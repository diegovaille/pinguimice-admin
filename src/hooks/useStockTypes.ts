import { useState, useEffect } from 'react';
import type { StockTypes } from '../services/api';

// NOTE: This hook is deprecated and no longer used by the Stock page
// The new Stock page uses the API endpoints directly
export function useStockTypes() {
    const [stockTypes, setStockTypes] = useState<StockTypes>({ insumos: [], embalagens: [] });
    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        // Return empty data - this hook is deprecated
        setStockTypes({ insumos: [], embalagens: [] });
        setLoading(false);
    }, []);

    return { stockTypes, loading, error };
}
