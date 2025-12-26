import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { api } from '../services/api';
import type { ParametroCalculoResponse } from '../types/api-types';
import { Settings, Save, AlertCircle, Clock } from 'lucide-react';

export default function CalculationParameters() {
    const [parameters, setParameters] = useState<ParametroCalculoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [editDesc, setEditDesc] = useState<string>('');

    useEffect(() => {
        loadParameters();
    }, []);

    const loadParameters = async () => {
        try {
            setLoading(true);
            const data = await api.getParametrosCalculo();
            setParameters(data);
            setError(null);
        } catch (err) {
            console.error('Error loading parameters:', err);
            setError('Erro ao carregar parâmetros de cálculo');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (param: ParametroCalculoResponse) => {
        setEditingKey(param.chave);
        setEditValue(param.valor.toString());
        setEditDesc(param.descricao || '');
    };

    const handleSave = async (chave: string) => {
        try {
            await api.updateParametroCalculo(chave, {
                chave,
                valor: parseFloat(editValue),
                descricao: editDesc || undefined
            });
            setEditingKey(null);
            await loadParameters();
        } catch (err: any) {
            console.error('Error updating parameter:', err);
            alert(err.message || 'Erro ao atualizar parâmetro');
        }
    };

    return (
        <MainLayout>
            <div className="page-header">
                <h1 className="page-title">Parâmetros de Cálculo</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Fórmulas e valores base usados nos cálculos automáticos de estoque e produção
                </p>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Settings size={48} className="spin" style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>Carregando parâmetros...</h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <AlertCircle size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--danger)' }}>{error}</h3>
                    <button className="btn btn-primary" onClick={loadParameters} style={{ marginTop: '1rem' }}>Tentar Novamente</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="card" style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '0.875rem' }}>
                                <strong>Atenção:</strong> Alterar estes valores afeta como o sistema calcula o rendimento da matéria prima e embalagens.
                                Use com cautela e verifique se os valores correspondem à realidade da produção.
                            </p>
                        </div>
                    </div>

                    <div className="card">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Chave do Parâmetro</th>
                                        <th style={{ width: '150px' }}>Valor Atual</th>
                                        <th>Descrição</th>
                                        <th style={{ width: '100px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parameters.map(param => (
                                        <tr key={param.chave}>
                                            <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                                <code>{param.chave}</code>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                    <Clock size={12} />
                                                    Atualizado em: {new Date(param.dataAtualizacao).toLocaleString('pt-BR')}
                                                </div>
                                            </td>
                                            <td>
                                                {editingKey === param.chave ? (
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        step="any"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        autoFocus
                                                        style={{ padding: '0.25rem 0.5rem' }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{param.valor}</span>
                                                )}
                                            </td>
                                            <td>
                                                {editingKey === param.chave ? (
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={editDesc}
                                                        onChange={(e) => setEditDesc(e.target.value)}
                                                        style={{ padding: '0.25rem 0.5rem' }}
                                                    />
                                                ) : (
                                                    param.descricao || '-'
                                                )}
                                            </td>
                                            <td>
                                                {editingKey === param.chave ? (
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.25rem 0.5rem' }}
                                                        onClick={() => handleSave(param.chave)}
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.25rem 0.5rem' }}
                                                        onClick={() => handleEdit(param)}
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {parameters.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                                Nenhum parâmetro configurado no sistema.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
