import MainLayout from '../layouts/MainLayout';
import {
    Receipt,
    ShoppingCart,
    Package,
    Factory,
    PieChart,
    ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const reportOptions = [
    {
        title: 'Despesas',
        description: 'Análise de custos, fornecedores e vencimentos',
        icon: Receipt,
        path: '/reports/expenses',
        color: '#ef4444',
        bgColor: '#fee2e2'
    },
    {
        title: 'Vendas',
        description: 'Desempenho por sabor, região e período',
        icon: ShoppingCart,
        path: '/reports/sales',
        color: '#3b82f6',
        bgColor: '#dbeafe'
    },
    {
        title: 'Estoque',
        description: 'Snapshot atual e alertas de reposição',
        icon: Package,
        path: '/reports/stock',
        color: '#10b981',
        bgColor: '#dcfce7'
    },
    {
        title: 'Produção',
        description: 'Volume produzido e eficiência operacional',
        icon: Factory,
        path: '/reports/production',
        color: '#8b5cf6',
        bgColor: '#ede9fe'
    },
    {
        title: 'Lucro & DRE',
        description: 'Resultado financeiro líquido e margens',
        icon: PieChart,
        path: '/reports/profit',
        color: '#f59e0b',
        bgColor: '#fef3c7'
    }
];

export default function ReportsPage() {
    return (
        <MainLayout>
            <div className="page-header">
                <h1 className="page-title">Central de Relatórios</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Selecione uma categoria para visualizar análises detalhadas
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {reportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <Link
                            key={option.path}
                            to={option.path}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.25rem',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                        >
                            <div style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: option.bgColor,
                                color: option.color
                            }}>
                                <Icon size={28} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {option.title}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {option.description}
                                </p>
                            </div>
                            <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
                        </Link>
                    );
                })}
            </div>
        </MainLayout>
    );
}

