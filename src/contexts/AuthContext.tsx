import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthState, LoginCredentials, User } from '../types';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
    });

    // Load token from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                setAuthState({
                    user,
                    token,
                    isAuthenticated: true,
                });
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            // Call the real API
            const response = await api.login({
                username: credentials.email,
                password: credentials.password
            });

            const user: User = {
                id: response.filialId, // Using filialId as user ID for now, or we could decode from token if needed
                name: response.email.split('@')[0], // Simple name extraction
                email: response.email,
            };

            // Store in localStorage
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('auth_user', JSON.stringify(user));

            // Store additional info if needed
            localStorage.setItem('auth_organizacao_id', response.organizacaoId);
            localStorage.setItem('auth_filial_id', response.filialId);
            localStorage.setItem('auth_perfil', response.perfil);

            setAuthState({
                user,
                token: response.token,
                isAuthenticated: true,
            });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
