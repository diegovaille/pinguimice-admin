import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { api } from '../../services/api';
import type { RelatorioEstoqueResponse } from '../../types/api-types';
import {
    Package,
    AlertTriangle,
    ArrowLeft,
    Box,
    FileText,
    IceCream,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StockReport() {
    const [report, setReport] = useState<RelatorioEstoqueResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedAlerta, setExpandedAlerta] = useState(true);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            setLoading(true);
            const data = await api.getRelatorioEstoque();
            setReport(data);
            setError(null);
        } catch (err) {
            console.error('Error loading stock report:', err);
            setError('Erro ao carregar relatório de estoque');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <Link to="/reports" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="page-title">Relatório de Estoque</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Panorama atual do estoque e alertas de reposição
                </p>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Package size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>Gerando relatório...</h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)' }}>{error}</h3>
                    <button className="btn btn-primary" onClick={loadReport} style={{ marginTop: '1rem' }}>Tentar Novamente</button>
                </div>
            ) : report ? (
                <>
                    {/* Alerts Section */}
                    {report.alertasEstoqueBaixo.length > 0 && (
                        <div className={`card ${expandedAlerta ? 'expanded' : ''}`} style={{
                            marginBottom: '1.5rem',
                            border: '1px solid #fbbf24',
                            backgroundColor: '#fffdfa'
                        }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setExpandedAlerta(!expandedAlerta)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <AlertTriangle size={20} style={{ color: '#d97706' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#92400e' }}>
                                        Alertas de Estoque Baixo ({report.alertasEstoqueBaixo.length})
                                    </h3>
                                </div>
                                {expandedAlerta ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>

                            {expandedAlerta && (
                                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {report.alertasEstoqueBaixo.map((alerta, index) => (
                                        <div key={index} style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            backgroundColor: alerta.nivelCritico === 'CRITICO' ? '#fee2e2' : '#fef3c7',
                                            border: `1px solid ${alerta.nivelCritico === 'CRITICO' ? '#ef4444' : '#fbbf24'}`,
                                        }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{alerta.nome}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{alerta.sabor || 'Sem sabor'}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                                <span>Estoque: {alerta.estoqueAtual} un.</span>
                                                <span style={{ fontWeight: 700, color: alerta.nivelCritico === 'CRITICO' ? '#991b1b' : '#92400e' }}>
                                                    {alerta.nivelCritico}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Value Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Box size={32} />
                                <div>
                                    <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Valor Total Investido em Estoque (MP + EMB)</p>
                                    <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>R$ {report.valorTotalEstoque.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Relatório Gerado em</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>{new Date(report.dataGeracao).toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Materia Prima */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <FileText size={20} style={{ color: 'var(--primary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Matéria Prima</h3>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Estoque</th>
                                            <th>% Disp.</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.estoqueMateriaPrima.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{item.nome}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.sabor || '-'}</div>
                                                </td>
                                                <td>{item.estoqueUnidades} / {item.totalUnidades}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ flex: 1, height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${item.percentualDisponivel}%`,
                                                                height: '100%',
                                                                backgroundColor: item.percentualDisponivel < 10 ? '#ef4444' : item.percentualDisponivel < 20 ? '#f59e0b' : '#10b981'
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', width: '35px' }}>{item.percentualDisponivel.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td>R$ {item.valorTotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Embalagens */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Package size={20} style={{ color: 'var(--primary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Embalagens</h3>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Estoque</th>
                                            <th>% Disp.</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.estoqueEmbalagem.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{item.nome}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.sabor || '-'}</div>
                                                </td>
                                                <td>{item.estoqueUnidades} / {item.totalUnidades}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ flex: 1, height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${item.percentualDisponivel}%`,
                                                                height: '100%',
                                                                backgroundColor: item.percentualDisponivel < 10 ? '#ef4444' : item.percentualDisponivel < 20 ? '#f59e0b' : '#10b981'
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', width: '35px' }}>{item.percentualDisponivel.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td>R$ {item.valorTotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                        {/* Gelinhos */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <IceCream size={20} style={{ color: 'var(--primary)' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Estoque de Gelinhos (Prontos)</h3>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sabor</th>
                                            <th>Unidades</th>
                                            <th>Pacotes (aprox.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.estoqueGelinho.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 600 }}>{item.sabor}</td>
                                                <td>{item.quantidade} un</td>
                                                <td>{(item.quantidade / 50).toFixed(1)} pc</td>
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
