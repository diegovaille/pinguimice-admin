import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import SaborModal from '../components/SaborModal';
import { Plus, Palette, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import type { SaborRequest, SaborResponse } from '../types/api-types';

export default function Sabores() {
    const [sabores, setSabores] = useState<SaborResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSabor, setEditingSabor] = useState<SaborResponse | null>(null);

    useEffect(() => {
        loadSabores();
    }, []);

    const loadSabores = async () => {
        try {
            setLoading(true);
            const data = await api.getSabores(false); // Get all sabores, not just active
            setSabores(data);
            setError(null);
        } catch (err) {
            console.error('Error loading sabores:', err);
            setError('Erro ao carregar sabores');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: SaborRequest) => {
        try {
            setLoading(true);
            if (editingSabor) {
                await api.updateSabor(editingSabor.id, data);
            } else {
                await api.createSabor(data);
            }
            setIsModalOpen(false);
            setEditingSabor(null);
            await loadSabores();
        } catch (err) {
            console.error('Error saving sabor:', err);
            setError('Erro ao salvar sabor');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (sabor: SaborResponse) => {
        setEditingSabor(sabor);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingSabor(null);
        setIsModalOpen(true);
    };

    return (
        <MainLayout>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Sabores</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Gerencie os sabores de gelinhos
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={20} />
                    Adicionar Sabor
                </button>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Palette size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Carregando sabores...
                    </h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>
                        {error}
                    </h3>
                </div>
            ) : sabores.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Palette size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Nenhum sabor cadastrado
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Adicione sabores para começar
                    </p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Cor</th>
                                    <th>Nome</th>
                                    <th>Base Açúcar</th>
                                    <th>Status</th>
                                    <th>Data Criação</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sabores.map(sabor => (
                                    <tr key={sabor.id}>
                                        <td>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius)',
                                                backgroundColor: sabor.corHex || '#ccc',
                                                border: '2px solid var(--border)',
                                            }} />
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{sabor.nome}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: sabor.usaAcucar ? '#fff8e1' : '#f5f5f5',
                                                color: sabor.usaAcucar ? '#f57f17' : '#616161',
                                                border: sabor.usaAcucar ? '1px solid #ffe082' : '1px solid #e0e0e0',
                                            }}>
                                                {sabor.usaAcucar ? 'Sim' : 'Não'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: sabor.ativo ? '#e8f5e9' : '#ffebee',
                                                color: sabor.ativo ? '#2e7d32' : '#c62828',
                                            }}>
                                                {sabor.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {new Date(sabor.dataCriacao).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => handleEdit(sabor)}
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
                <SaborModal
                    sabor={editingSabor}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingSabor(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </MainLayout>
    );
}
