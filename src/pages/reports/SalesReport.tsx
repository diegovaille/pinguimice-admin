import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { api } from '../../services/api';
import type { RelatorioVendasResponse } from '../../types/api-types';
import {
    ShoppingCart,
    TrendingUp,
    ArrowLeft,
    DollarSign,
    Users,
    MapPin,
    IceCream,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SalesReport() {
    const [report, setReport] = useState<RelatorioVendasResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    useEffect(() => {
        loadReport();
    }, [startDate, endDate]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const data = await api.getRelatorioVendas(startDate, endDate);
            setReport(data);
            setError(null);
        } catch (err) {
            console.error('Error loading sales report:', err);
            setError('Erro ao carregar relatório de vendas');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickFilter = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    return (
        <MainLayout>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <Link to="/reports" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="page-title">Relatório de Vendas</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Análise de desempenho comercial e comportamento do cliente
                </p>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                        <label className="label">Data Início</label>
                        <input
                            type="date"
                            className="input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                        <label className="label">Data Fim</label>
                        <input
                            type="date"
                            className="input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-outline" onClick={() => handleQuickFilter(7)} style={{ fontSize: '0.875rem' }}>7 dias</button>
                        <button className="btn btn-outline" onClick={() => handleQuickFilter(30)} style={{ fontSize: '0.875rem' }}>30 dias</button>
                        <button className="btn btn-outline" onClick={() => handleQuickFilter(90)} style={{ fontSize: '0.875rem' }}>90 dias</button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <ShoppingCart size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>Gerando relatório...</h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)' }}>{error}</h3>
                    <button className="btn btn-primary" onClick={loadReport} style={{ marginTop: '1rem' }}>Tentar Novamente</button>
                </div>
            ) : report ? (
                <>
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#dbeafe', color: '#1e40af' }}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Vendas</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>R$ {report.totalVendas.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#dcfce7', color: '#166534' }}>
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recebido</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>R$ {report.totalRecebido.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pendente</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>R$ {report.totalPendente.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                                    <ShoppingCart size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qtd Vendas</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>{report.quantidadeVendas}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#92400e' }}>
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ticket Médio</p>
                                    <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>R$ {report.ticketMedio.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Sales by Flavor */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <IceCream size={20} style={{ color: 'var(--primary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Vendas por Sabor</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {report.vendasPorSabor.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Sem dados</p>
                                ) : (
                                    report.vendasPorSabor.map((item) => (
                                        <div key={item.sabor}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                                <span style={{ fontWeight: 600 }}>{item.sabor}</span>
                                                <span>{item.quantidade} un. ({item.percentualQuantidade.toFixed(1)}%)</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${item.percentualQuantidade}%`,
                                                    height: '100%',
                                                    backgroundColor: 'var(--primary)',
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sales by Region */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <MapPin size={20} style={{ color: 'var(--primary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Vendas por Região</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {report.vendasPorRegiao.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Sem dados</p>
                                ) : (
                                    report.vendasPorRegiao.map((item) => (
                                        <div key={item.regiao}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                                <span style={{ fontWeight: 600 }}>{item.regiao}</span>
                                                <span>R$ {item.valorTotal.toFixed(2)} ({item.percentual.toFixed(1)}%)</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${item.percentual}%`,
                                                    height: '100%',
                                                    backgroundColor: '#10b981',
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Customers */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Users size={20} style={{ color: 'var(--primary)' }} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Top 10 Clientes</h3>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Qtd. Compras</th>
                                        <th>Total Gasto</th>
                                        <th>Ticket Médio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.topClientes.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                                Nenhum dado disponível
                                            </td>
                                        </tr>
                                    ) : (
                                        report.topClientes.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 600 }}>{item.cliente || 'Consumidor Final'}</td>
                                                <td>{item.quantidadeCompras}</td>
                                                <td>R$ {item.totalCompras.toFixed(2)}</td>
                                                <td>R$ {(item.totalCompras / item.quantidadeCompras).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </MainLayout>
    );
}
