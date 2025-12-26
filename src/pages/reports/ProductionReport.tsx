import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { api } from '../../services/api';
import type { RelatorioProducaoResponse } from '../../types/api-types';
import {
    Factory,
    TrendingUp,
    Calendar,
    ArrowLeft,
    IceCream,
    Clock,
    BarChart
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductionReport() {
    const [report, setReport] = useState<RelatorioProducaoResponse | null>(null);
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
            const data = await api.getRelatorioProducao(startDate, endDate);
            setReport(data);
            setError(null);
        } catch (err) {
            console.error('Error loading production report:', err);
            setError('Erro ao carregar relatório de produção');
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
                    <h1 className="page-title">Relatório de Produção</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Análise de volume de produção e produtividade
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
                    <Factory size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
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
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                                    <BarChart size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Produzido</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{report.totalProducao} un.</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>~{(report.totalProducao / 50).toFixed(1)} pacotes</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#dcfce7', color: '#166534' }}>
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Média Diária</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{report.mediaProducaoDiaria.toFixed(1)} un.</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>em {report.diasComProducao} dias ativos</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#92400e' }}>
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Frequência</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>{(report.diasComProducao / 30 * 100).toFixed(0)}%</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>taxa de ocupação (30d)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {/* Production by Flavor */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <IceCream size={20} style={{ color: 'var(--primary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Produção por Sabor</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {report.producaoPorSabor.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Sem dados</p>
                                ) : (
                                    report.producaoPorSabor.map((item) => (
                                        <div key={item.sabor}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                                <span style={{ fontWeight: 600 }}>{item.sabor}</span>
                                                <span>{item.quantidade} un. ({item.percentual.toFixed(1)}%)</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${item.percentual}%`,
                                                    height: '100%',
                                                    backgroundColor: 'var(--primary)',
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                Produzido {item.vezes} vezes no período
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Production Days */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Calendar size={20} style={{ color: 'var(--primary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Histórico Recente</h3>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Quantidade</th>
                                            <th>Registros</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.producaoPorDia.slice(0, 10).map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 600 }}>{new Date(item.periodo).toLocaleDateString('pt-BR')}</td>
                                                <td>{item.quantidade} un</td>
                                                <td>{item.quantidadeProducoes}</td>
                                            </tr>
                                        ))}
                                        {report.producaoPorDia.length === 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                                    Nenhum registro no período
                                                </td>
                                            </tr>
                                        )}
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
