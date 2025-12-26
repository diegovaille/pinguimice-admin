import { useState, useEffect, type FormEvent } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, Factory, Trash2, Calendar } from 'lucide-react';
import { useFlavors } from '../hooks/useFlavors';
import { api } from '../services/api';
import type { ProducaoResponse } from '../types/api-types';

export default function ProductionPage() {
    const { flavors } = useFlavors();
    const [productions, setProductions] = useState<ProducaoResponse[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Date filter state (default: last 30 days)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saborId, setSaborId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState<'pacote' | 'unidade'>('pacote');
    const [deductFromStock, setDeductFromStock] = useState(true);
    const [observacoes, setObservacoes] = useState('');

    // Set default flavor when flavors are loaded
    useEffect(() => {
        if (flavors.length > 0 && !saborId) {
            setSaborId(flavors[0].id);
        }
    }, [flavors, saborId]);

    // Load productions when component mounts or date filter changes
    useEffect(() => {
        loadProductions();
    }, [startDate, endDate]);

    const loadProductions = async () => {
        try {
            setLoading(true);
            const data = await api.getProducao(startDate, endDate);
            setProductions(data);
            setError(null);
        } catch (err) {
            console.error('Error loading productions:', err);
            setError('Erro ao carregar produções');
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const calculatedQuantity = unit === 'pacote' ? parseInt(quantity) * 50 : parseInt(quantity);

        try {
            await api.createProducao({
                saborId,
                quantidadeProduzida: calculatedQuantity,
                deduzirEstoque: deductFromStock,
                dataProducao: new Date(date).toISOString(),
                observacoes: observacoes || undefined,
            });

            await loadProductions();
            setShowForm(false);
            setQuantity('');
            setUnit('pacote');
            setObservacoes('');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (err: any) {
            console.error('Error creating production:', err);
            alert(err.message || 'Erro ao registrar produção');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta produção? O estoque será revertido se foi deduzido.')) {
            try {
                await api.deleteProducao(id);
                await loadProductions();
            } catch (err) {
                console.error('Error deleting production:', err);
                alert('Erro ao excluir produção');
            }
        }
    };

    return (
        <MainLayout>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Produção Diária</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Registre a produção e gerencie o estoque
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} />
                    Nova Produção
                </button>
            </div>

            {/* Date Filter */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                        <label htmlFor="startDate" className="label">Data Início</label>
                        <input
                            id="startDate"
                            type="date"
                            className="input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                        <label htmlFor="endDate" className="label">Data Fim</label>
                        <input
                            id="endDate"
                            type="date"
                            className="input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleQuickFilter(7)}
                            style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        >
                            7 dias
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleQuickFilter(30)}
                            style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        >
                            30 dias
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleQuickFilter(90)}
                            style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        >
                            90 dias
                        </button>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
                        Registrar Produção
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="date" className="label">
                                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    Data da Produção
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    className="input"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="flavor" className="label">Sabor</label>
                                <select
                                    id="flavor"
                                    className="input"
                                    value={saborId}
                                    onChange={(e) => setSaborId(e.target.value)}
                                    required
                                >
                                    {flavors.map(f => (
                                        <option key={f.id} value={f.id}>{f.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="quantity" className="label">Quantidade</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        id="quantity"
                                        type="number"
                                        className="input"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        style={{ flex: 1 }}
                                        required
                                    />
                                    <select
                                        className="input"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value as 'pacote' | 'unidade')}
                                        style={{ width: '130px' }}
                                    >
                                        <option value="pacote">pacote(s)</option>
                                        <option value="unidade">unidade(s)</option>
                                    </select>
                                </div>
                                {unit === 'pacote' && quantity && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Total: {parseInt(quantity) * 50 || 0} unidades
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="observacoes" className="label">Observações (opcional)</label>
                            <textarea
                                id="observacoes"
                                className="input"
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                placeholder="Adicione observações sobre esta produção..."
                                rows={3}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                id="deduct"
                                type="checkbox"
                                checked={deductFromStock}
                                onChange={(e) => setDeductFromStock(e.target.checked)}
                                style={{ width: 'auto' }}
                            />
                            <label htmlFor="deduct" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                                Deduzir do estoque de insumos (FIFO)
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Registrar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Factory size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Carregando produções...
                    </h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>
                        {error}
                    </h3>
                </div>
            ) : productions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Factory size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Nenhuma produção registrada
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Registre a produção diária para controlar o estoque
                    </p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Sabor</th>
                                    <th>Quantidade</th>
                                    <th>Deduziu Estoque</th>
                                    <th>Observações</th>
                                    <th style={{ width: '60px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productions.map(prod => (
                                    <tr key={prod.id}>
                                        <td>{new Date(prod.dataProducao).toLocaleDateString('pt-BR')}</td>
                                        <td style={{ fontWeight: 600 }}>{prod.saborNome}</td>
                                        <td>{prod.quantidadeProduzida} un</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: prod.deduzirEstoque ? '#dcfce7' : '#fee2e2',
                                                color: prod.deduzirEstoque ? '#166534' : '#991b1b',
                                            }}>
                                                {prod.deduzirEstoque ? 'Sim' : 'Não'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {prod.observacoes || '-'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-outline"
                                                style={{ padding: '0.375rem', color: 'var(--danger)' }}
                                                onClick={() => handleDelete(prod.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
