import MainLayout from '../layouts/MainLayout';

export default function Dashboard() {
    return (
        <MainLayout>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Bem-vindo ao sistema de gestão Pinguim Ice
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Estoque Total
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        -
                    </p>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Produção Hoje
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        -
                    </p>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Vendas Hoje
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        -
                    </p>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Despesas Pendentes
                    </h3>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        -
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
