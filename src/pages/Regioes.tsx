import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import RegiaoModal from '../components/RegiaoModal';
import { Plus, MapPin, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import type { RegiaoVendaRequest, RegiaoVendaResponse } from '../types/api-types';

export default function Regioes() {
    const [regioes, setRegioes] = useState<RegiaoVendaResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegiao, setEditingRegiao] = useState<RegiaoVendaResponse | null>(null);

    useEffect(() => {
        loadRegioes();
    }, []);

    const loadRegioes = async () => {
        try {
            setLoading(true);
            const data = await api.getRegioes(false); // Get all regioes, not just active
            setRegioes(data);
            setError(null);
        } catch (err) {
            console.error('Error loading regioes:', err);
            setError('Erro ao carregar regiões');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: RegiaoVendaRequest) => {
        try {
            setLoading(true);
            if (editingRegiao) {
                await api.updateRegiao(editingRegiao.id, data);
            } else {
                await api.createRegiao(data);
            }
            setIsModalOpen(false);
            setEditingRegiao(null);
            await loadRegioes();
        } catch (err) {
            console.error('Error saving regiao:', err);
            setError('Erro ao salvar região');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (regiao: RegiaoVendaResponse) => {
        setEditingRegiao(regiao);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingRegiao(null);
        setIsModalOpen(true);
    };

    return (
        <MainLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Regiões de Venda</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Gerencie as regiões de venda
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={20} />
                    Adicionar Região
                </button>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <MapPin size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Carregando regiões...
                    </h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>
                        {error}
                    </h3>
                </div>
            ) : regioes.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <MapPin size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Nenhuma região cadastrada
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Adicione regiões para começar
                    </p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th>Status</th>
                                    <th>Data Criação</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regioes.map(regiao => (
                                    <tr key={regiao.id}>
                                        <td style={{ fontWeight: 600 }}>{regiao.nome}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {regiao.descricao || '-'}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: regiao.ativo ? '#e8f5e9' : '#ffebee',
                                                color: regiao.ativo ? '#2e7d32' : '#c62828',
                                            }}>
                                                {regiao.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {new Date(regiao.dataCriacao).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => handleEdit(regiao)}
                                                    style={{ padding: '0.5rem' }}
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <RegiaoModal
                    regiao={editingRegiao}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingRegiao(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </MainLayout>
    );
}
