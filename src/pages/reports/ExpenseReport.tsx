import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { api } from '../../services/api';
import type { RelatorioDespesasResponse } from '../../types/api-types';
import {
    Receipt,
    TrendingDown,
    ArrowLeft,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ExpenseReport() {
    const [report, setReport] = useState<RelatorioDespesasResponse | null>(null);
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
            const data = await api.getRelatorioDespesas(startDate, endDate);
            setReport(data);
            setError(null);
        } catch (err) {
            console.error('Error loading expense report:', err);
            setError('Erro ao carregar relatório de despesas');
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
                    <h1 className="page-title">Relatório de Despesas</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Análise detalhada de custos e despesas no período
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
                    <Receipt size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                    <TrendingDown size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Despesas</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>R$ {report.totalDespesas.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#dcfce7', color: '#166534' }}>
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Pago</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>R$ {report.totalPago.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#92400e' }}>
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Pendente</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>R$ {report.totalPendente.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {/* Expenses by Category */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Despesas por Categoria</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {report.despesasPorCategoria.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Sem dados</p>
                                ) : (
                                    report.despesasPorCategoria.map((item) => (
                                        <div key={item.categoria}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                                <span style={{ fontWeight: 600 }}>{item.categoria}</span>
                                                <span>R$ {item.valor.toFixed(2)} ({item.percentual.toFixed(1)}%)</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${item.percentual}%`,
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

                        {/* Recent Detailed Expenses */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Últimas Despesas</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Descrição</th>
                                            <th>Valor</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.despesasDetalhadas.slice(0, 10).map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontSize: '0.875rem' }}>
                                                    {item.dataPagamento ? new Date(item.dataPagamento).toLocaleDateString('pt-BR') :
                                                        item.dataVencimento ? new Date(item.dataVencimento).toLocaleDateString('pt-BR') : '-'}
                                                </td>
                                                <td>{item.descricao}</td>
                                                <td style={{ fontWeight: 600 }}>R$ {item.valor.toFixed(2)}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.125rem 0.5rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: item.status === 'PAGO' ? '#dcfce7' : item.status === 'VENCIDO' ? '#fee2e2' : '#fef3c7',
                                                        color: item.status === 'PAGO' ? '#166534' : item.status === 'VENCIDO' ? '#991b1b' : '#92400e',
                                                    }}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </MainLayout>
    );
}
