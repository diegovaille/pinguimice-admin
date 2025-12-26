import { useState, useEffect, type FormEvent } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, ShoppingCart, Trash2, Edit2, CheckCircle2, PackageCheck, PackageX } from 'lucide-react';
import CurrencyInput from '../components/CurrencyInput';
import type { PinguimVendaResponse, PinguimVendaRequest } from '../types/api-types';
import { useFlavors } from '../hooks/useFlavors';
import { useClients } from '../hooks/useClients';
import { api } from '../services/api.ts';

export default function SalesPage() {
    const { flavors } = useFlavors();
    const [sales, setSales] = useState<PinguimVendaResponse[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingSale, setEditingSale] = useState<PinguimVendaResponse | null>(null);

    // Date filter state (default: last 7 days)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    // Form state
    const [clienteId, setClienteId] = useState('');
    const [gelos, setGelos] = useState<Record<string, string>>({});
    const [unit, setUnit] = useState<'pacote' | 'unidade'>('pacote');
    const [total, setTotal] = useState('');
    const [totalPago, setTotalPago] = useState('');
    const [abaterEstoque, setAbaterEstoque] = useState(true);

    const { clients } = useClients();

    // Load sales when component mounts or date filter changes
    useEffect(() => {
        loadSales();
    }, [startDate, endDate]);

    const loadSales = async () => {
        try {
            setLoading(true);

            // Parse dates manually to ensure we're working with local time
            const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
            const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);

            const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
            const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

            const data = await api.getSales(start, end);
            setSales(data);
            setError(null);
        } catch (err) {
            console.error('Error loading sales:', err);
            setError('Erro ao carregar vendas');
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

    const handleEdit = (sale: PinguimVendaResponse) => {
        setEditingSale(sale);
        setClienteId(sale.clienteId || '');

        const newGelos: Record<string, string> = {};
        sale.itens.forEach(item => {
            const flavor = flavors.find(f => f.nome === item.sabor);
            if (flavor) {
                newGelos[flavor.id] = (item.quantidade / 50).toString(); // Defaulting to packets for edit
            }
        });
        setGelos(newGelos);
        setUnit('pacote');
        setTotal(sale.total.toString());
        setTotalPago(sale.totalPago.toString());
        setAbaterEstoque(sale.abaterEstoque);
        setShowForm(true);
    };

    const handleMarkAsPaid = async (id: string) => {
        try {
            await api.markSaleAsPaid(id);
            await loadSales();
        } catch (err) {
            console.error('Error marking sale as paid:', err);
            alert('Erro ao marcar venda como paga');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const multiplier = unit === 'pacote' ? 50 : 1;

        const itens = Object.entries(gelos)
            .filter(([_, qty]) => qty && parseFloat(qty) > 0)
            .map(([flavorId, qty]) => ({
                saborId: flavorId,
                quantidade: parseInt(qty) * multiplier,
            }));

        if (itens.length === 0) {
            alert('Adicione pelo menos um sabor de gelo à venda');
            return;
        }

        try {
            const newSale: PinguimVendaRequest = {
                clienteId: clienteId || undefined,
                itens,
                total: parseFloat(total),
                totalPago: parseFloat(totalPago),
                abaterEstoque,
            };

            if (editingSale) {
                await api.updateSale(editingSale.id, newSale);
            } else {
                await api.createSale(newSale);
            }

            await loadSales();

            // Reset form
            setShowForm(false);
            setEditingSale(null);
            setClienteId('');
            setGelos({});
            setUnit('pacote');
            setTotal('');
            setTotalPago('');
            setAbaterEstoque(true);
        } catch (err: any) {
            console.error('Error creating sale:', err);
            alert(err.message || 'Erro ao registrar venda');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja cancelar esta venda? O estoque será restaurado.')) {
            try {
                await api.cancelSale(id);
                await loadSales();
            } catch (err) {
                console.error('Error deleting sale:', err);
                alert('Erro ao cancelar venda');
            }
        }
    };

    return (
        <MainLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Vendas</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Registre vendas e controle o estoque
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} />
                    Nova Venda
                </button>
            </div>

            {/* Editing Indicator */}
            {editingSale && (
                <div style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Editando venda de <strong>{new Date(editingSale.dataVenda).toLocaleDateString('pt-BR')}</strong></span>
                    <button
                        className="btn btn-outline"
                        style={{ color: 'white', borderColor: 'white', padding: '0.25rem 0.75rem' }}
                        onClick={() => {
                            setEditingSale(null);
                            setShowForm(false);
                            setClienteId('');
                            setGelos({});
                            setTotal('');
                            setTotalPago('');
                        }}
                    >
                        Cancelar Edição
                    </button>
                </div>
            )}

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
                            onClick={() => handleQuickFilter(0)}
                            style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                        >
                            Hoje
                        </button>
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
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
                        {editingSale ? 'Editar Venda' : 'Registrar Venda'}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {/* Note: Date selection removed from form as API doesn't support it yet */}
                            {/* <div className="form-group">
                                <label htmlFor="saleDate" className="label">
                                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    Data da Venda
                                </label>
                                <input
                                    id="saleDate"
                                    type="date"
                                    className="input"
                                    value={saleDate}
                                    onChange={(e) => setSaleDate(e.target.value)}
                                    required
                                    disabled // Disabled until API supports backdating
                                />
                                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                    Data será registrada como hoje
                                </small>
                            </div> */}

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label htmlFor="cliente" className="label">Cliente</label>
                                <select
                                    id="cliente"
                                    className="input"
                                    value={clienteId}
                                    onChange={(e) => setClienteId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nome} {c.regiao ? `(${c.regiao.nome})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <label className="label" style={{ margin: 0 }}>Gelos por Sabor</label>
                                <select
                                    className="input"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value as 'pacote' | 'unidade')}
                                    style={{ width: '130px', padding: '0.25rem 0.5rem', height: 'auto' }}
                                >
                                    <option value="pacote">pacote(s)</option>
                                    <option value="unidade">unidade(s)</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                {flavors.map(flavor => (
                                    <div key={flavor.id} className="form-group">
                                        <label htmlFor={`gelo-${flavor.id}`} className="label" style={{ fontSize: '0.75rem' }}>
                                            {flavor.nome}
                                        </label>
                                        <input
                                            id={`gelo-${flavor.id}`}
                                            type="number"
                                            className="input"
                                            value={gelos[flavor.id] || ''}
                                            onChange={(e) => setGelos({ ...gelos, [flavor.id]: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {unit === 'pacote' && gelos[flavor.id] && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                {parseInt(gelos[flavor.id]) * 50} unidades
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {(() => {
                                const totalUnits = Object.values(gelos).reduce((acc, qty) => acc + (parseInt(qty) || 0), 0) * (unit === 'pacote' ? 50 : 1);
                                const totalPackets = totalUnits / 50;
                                return totalUnits > 0 && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem',
                                        backgroundColor: 'var(--background)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem',
                                        color: 'var(--text-main)',
                                        display: 'flex',
                                        gap: '1rem',
                                        justifyContent: 'flex-end',
                                        borderBottom: '1px dashed var(--border)',
                                        paddingBottom: '0.75rem'
                                    }}>
                                        <div style={{ color: 'var(--text-secondary)' }}>Resumo:</div>
                                        <div><strong>{totalUnits} unidades</strong></div>
                                        <div style={{ color: 'var(--text-secondary)' }}>|</div>
                                        <div><strong>{totalPackets.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pacotes</strong></div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="total" className="label">Preço Total</label>
                                <CurrencyInput
                                    id="total"
                                    value={total}
                                    onChange={setTotal}
                                    placeholder="R$ 0,00"
                                    required
                                />
                                {(() => {
                                    const totalUnits = Object.values(gelos).reduce((acc, qty) => acc + (parseInt(qty) || 0), 0) * (unit === 'pacote' ? 50 : 1);
                                    const pricePerUnit = totalUnits > 0 ? parseFloat(total) / totalUnits : 0;
                                    return totalUnits > 0 && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                                            Preço por unidade: R$ {pricePerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    );
                                })()}
                            </div>

                            <div className="form-group">
                                <label htmlFor="totalPago" className="label">Total Pago</label>
                                <input
                                    type="hidden" // Just for spacing if needed, but we'll use a switch below
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '42px' }}>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={abaterEstoque}
                                            onChange={(e) => setAbaterEstoque(e.target.checked)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                    <span style={{ fontSize: '0.875rem' }}>Abater do estoque?</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingSale(null);
                                    setClienteId('');
                                    setGelos({});
                                    setTotal('');
                                    setTotalPago('');
                                }}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingSale ? 'Salvar Alterações' : 'Registrar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <ShoppingCart size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Carregando vendas...
                    </h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>
                        {error}
                    </h3>
                </div>
            ) : sales.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <ShoppingCart size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Nenhuma venda registrada
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Registre vendas para controlar o estoque
                    </p>
                </div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Cliente</th>
                                    <th>Região</th>
                                    <th>Gelos</th>
                                    <th>Total</th>
                                    <th>Pago</th>
                                    <th>Estoque</th>
                                    <th style={{ width: '100px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map(sale => (
                                    <tr key={sale.id}>
                                        <td>{new Date(sale.dataVenda).toLocaleDateString('pt-BR')} {new Date(sale.dataVenda).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{sale.clienteNome || '-'}</td>
                                        <td>{sale.regiaoNome || '-'}</td>
                                        <td style={{ fontSize: '0.875rem' }}>
                                            {sale.itens.map(item => (
                                                <div key={item.sabor}>{item.sabor}: {item.quantidade}</div>
                                            ))}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>R$ {sale.total.toFixed(2)}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: sale.totalPago >= sale.total ? '#dcfce7' : '#fef3c7',
                                                color: sale.totalPago >= sale.total ? '#166534' : '#92400e',
                                            }}>
                                                R$ {sale.totalPago.toFixed(2)}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {sale.abaterEstoque ? (
                                                <span title="Estoque abatido"><PackageCheck size={18} style={{ color: '#10b981' }} /></span>
                                            ) : (
                                                <span title="Apenas financeiro"><PackageX size={18} style={{ color: 'var(--text-secondary)' }} /></span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {sale.totalPago < sale.total && (
                                                    <button
                                                        className="btn-outline"
                                                        style={{ padding: '0.375rem', color: '#10b981' }}
                                                        onClick={() => handleMarkAsPaid(sale.id)}
                                                        title="Marcar como Pago"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-outline"
                                                    style={{ padding: '0.375rem', color: 'var(--primary)' }}
                                                    onClick={() => handleEdit(sale)}
                                                    title="Editar venda"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn-outline"
                                                    style={{ padding: '0.375rem', color: 'var(--danger)' }}
                                                    onClick={() => handleDelete(sale.id)}
                                                    title="Cancelar venda"
                                                >
                                                    <Trash2 size={16} />
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
        </MainLayout>
    );
}
