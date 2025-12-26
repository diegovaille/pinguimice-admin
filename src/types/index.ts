export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface StockItem {
    id: string;
    name: string;
    type: 'insumo' | 'embalagem' | 'outros';
    quantity: number;
    unit: string;
    lastUpdated: Date;
}

export interface IceStock {
    flavor: string;
    quantity: number;
}

export interface Production {
    id: string;
    date: Date;
    flavor: string;
    quantity: number;
    ingredients: Record<string, number>;
    packaging: Record<string, number>;
    deductFromStock: boolean;
}

export interface Sale {
    id: string;
    date: Date;
    cliente: string | null;
    regiao: string;
    gelos: Record<string, number>;
    total: number;
    pago: number;
}

export interface Expense {
    id: string;
    descricao: string;
    anexo?: string;
    total: number;
    data: Date;
    vencimento?: Date;
}
