import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { SaborResponse } from '../types/api-types';

export function useFlavors() {
    const [flavors, setFlavors] = useState<SaborResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFlavors = async () => {
            try {
                setLoading(true);
                const data = await api.getSabores(true); // Only active flavors
                setFlavors(data);
                setError(null);
            } catch (err) {
                setError('Erro ao carregar sabores');
                console.error('Failed to load flavors:', err);
            } finally {
                setLoading(false);
            }
        };

        loadFlavors();
    }, []);

    return { flavors, loading, error };
}
