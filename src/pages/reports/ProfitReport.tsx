import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { api } from '../../services/api';
import type { RelatorioLucroResponse } from '../../types/api-types';
import {
    PieChart,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Award,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfitReport() {
    const [report, setReport] = useState<RelatorioLucroResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        // Start of current year
        return new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
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
            const data = await api.getRelatorioLucro(startDate, endDate);
            setReport(data);
            setError(null);
        } catch (err) {
            console.error('Error loading profit report:', err);
            setError('Erro ao carregar relatório de lucro');
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

    const handleYearFilter = (yearOffset: number = 0) => {
        const year = new Date().getFullYear() + yearOffset;
        setStartDate(`${year}-01-01`);
        setEndDate(`${year}-12-31`);
    };

    return (
        <MainLayout>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <Link to="/reports" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="page-title">Relatório de Lucro & DRE</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Análise financeira completa do negócio
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
                        <button className="btn btn-outline" onClick={() => handleYearFilter(0)} style={{ fontSize: '0.875rem' }}>Este Ano</button>
                        <button className="btn btn-outline" onClick={() => handleYearFilter(-1)} style={{ fontSize: '0.875rem' }}>Ano Passado</button>
                        <button className="btn btn-outline" onClick={() => handleQuickFilter(30)} style={{ fontSize: '0.875rem' }}>30 dias</button>
                        <button className="btn btn-outline" onClick={() => handleQuickFilter(90)} style={{ fontSize: '0.875rem' }}>90 dias</button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <PieChart size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>Gerando relatório...</h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)' }}>{error}</h3>
                    <button className="btn btn-primary" onClick={loadReport} style={{ marginTop: '1rem' }}>Tentar Novamente</button>
                </div>
            ) : report ? (
                <>
                    {/* Financial Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#dcfce7', color: '#166534' }}>
                                    <ArrowUpRight size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Receita (Vendas Pagas)</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#166534' }}>R$ {report.totalVendas.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                    <ArrowDownRight size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Despesas Pagas</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#991b1b' }}>R$ {report.totalDespesas.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{
                            backgroundColor: report.lucroLiquido >= 0 ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${report.lucroLiquido >= 0 ? '#10b981' : '#ef4444'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: report.lucroLiquido >= 0 ? '#10b981' : '#ef4444',
                                    color: 'white'
                                }}>
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Lucro Líquido</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: report.lucroLiquido >= 0 ? '#15803d' : '#b91c1c' }}>
                                        R$ {report.lucroLiquido.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                                    <Award size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Margem de Lucro</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{report.margemLucro.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                        {/* Monthly Profit Table */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Desempenho por Mês</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Mês</th>
                                            <th>Vendas</th>
                                            <th>Despesas</th>
                                            <th>Lucro</th>
                                            <th>Margem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.lucroPorMes.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 600 }}>{item.periodo}</td>
                                                <td style={{ color: '#166534' }}>R$ {item.vendas.toFixed(2)}</td>
                                                <td style={{ color: '#991b1b' }}>R$ {item.despesas.toFixed(2)}</td>
                                                <td style={{ fontWeight: 700, color: item.lucro >= 0 ? '#15803d' : '#b91c1c' }}>
                                                    R$ {item.lucro.toFixed(2)}
                                                </td>
                                                <td>{item.margemLucro.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                        {report.lucroPorMes.length === 0 && (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                                    Nenhum dado financeiro no período
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Financial Insights */}
                        <div className="card">
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Resumo e Médias</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Receita Média Mensal</p>
                                        <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>R$ {report.resumoFinanceiro.receitaMedia.toFixed(2)}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Despesa Média Mensal</p>
                                        <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>R$ {report.resumoFinanceiro.despesaMedia.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#065f46' }}>Lucro Médio Mensal</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065f46' }}>R$ {report.resumoFinanceiro.lucroMedio.toFixed(2)}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#166534' }}>Melhor Mês</p>
                                        <p style={{ fontWeight: 700 }}>{report.resumoFinanceiro.melhorMes?.mes || '-'}</p>
                                        <p style={{ fontSize: '0.875rem', color: '#166534' }}>R$ {report.resumoFinanceiro.melhorMes?.valor.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #ef4444' }}>
                                        <p style={{ fontSize: '0.7rem', color: '#991b1b' }}>Pior Mês</p>
                                        <p style={{ fontWeight: 700 }}>{report.resumoFinanceiro.piorMes?.mes || '-'}</p>
                                        <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>R$ {report.resumoFinanceiro.piorMes?.valor.toFixed(2) || '0.00'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </MainLayout>
    );
}
