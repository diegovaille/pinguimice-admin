import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ClienteResponse } from '../types/api-types';

export function useClients() {
    const [clients, setClients] = useState<ClienteResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                const data = await api.getClientes(true); // Default to only active clients for hooks
                setClients(data);
                setError(null);
            } catch (err) {
                console.error('Error loading clients hook:', err);
                setError('Erro ao carregar clientes');
            } finally {
                setLoading(false);
            }
        };

        loadClients();
    }, []);

    return { clients, loading, error };
}
