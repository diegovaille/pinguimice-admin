import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { RegiaoVendaResponse } from '../types/api-types';

export function useRegions() {
    const [regions, setRegions] = useState<RegiaoVendaResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        loadRegions();
    }, []);

    const loadRegions = async () => {
        try {
            setLoading(true);
            const data = await api.getRegioes(true); // Only active regions
            setRegions(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading regions:', err);
        } finally {
            setLoading(false);
        }
    };

    return { regions, loading, error };
}
