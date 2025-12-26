import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, Receipt, AlertCircle, Paperclip, Trash2, Calendar, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import CurrencyInput from '../components/CurrencyInput';
import type { DespesaResponse } from '../types/api-types';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<DespesaResponse[]>([]);
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
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [dataPagamento, setDataPagamento] = useState('');
    const [observacao, setObservacao] = useState('');
    const [arquivo, setArquivo] = useState<File | null>(null);

    // Load expenses when component mounts or date filter changes
    useEffect(() => {
        loadExpenses();
    }, [startDate, endDate]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await api.getDespesas(startDate, endDate);
            setExpenses(data);
            setError(null);
        } catch (err) {
            console.error('Error loading expenses:', err);
            setError('Erro ao carregar despesas');
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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setArquivo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            await api.createDespesa(
                {
                    descricao,
                    valor: parseFloat(valor),
                    dataVencimento: dataVencimento || undefined,
                    dataPagamento: dataPagamento || undefined,
                    observacao: observacao || undefined,
                },
                arquivo || undefined
            );

            await loadExpenses();
            toast.success('Despesa registrada com sucesso!');
            setShowForm(false);
            setDescricao('');
            setValor('');
            setDataVencimento('');
            setDataPagamento('');
            setObservacao('');
            setArquivo(null);
        } catch (err: any) {
            console.error('Error creating expense:', err);

            let message = 'Erro ao registrar despesa';
            if (err.message?.includes('Maximum upload size exceeded')) {
                message = 'O arquivo é muito grande. Por favor, escolha um arquivo menor.';
            } else if (err.message) {
                message = err.message;
            }

            toast.error(message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
            try {
                await api.deleteDespesa(id);
                toast.success('Despesa excluída com sucesso!');
                await loadExpenses();
            } catch (err) {
                console.error('Error deleting expense:', err);
                toast.error('Erro ao excluir despesa');
            }
        }
    };

    const isExpiring = (expense: DespesaResponse) => {
        if (!expense.dataVencimento) return false;
        const daysUntil = Math.ceil((new Date(expense.dataVencimento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7 && daysUntil >= 0;
    };

    const isExpired = (expense: DespesaResponse) => {
        if (!expense.dataVencimento) return false;
        return new Date(expense.dataVencimento) < new Date();
    };

    const isPaid = (expense: DespesaResponse) => {
        return !!expense.dataPagamento;
    };

    return (
        <MainLayout>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Despesas</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Controle despesas e vencimentos
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={20} />
                    Nova Despesa
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
                        Registrar Despesa
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label htmlFor="descricao" className="label">Descrição</label>
                            <input
                                id="descricao"
                                type="text"
                                className="input"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Ex: Conserto eletricista"
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                                <label htmlFor="valor" className="label">Valor</label>
                                <CurrencyInput
                                    id="valor"
                                    value={valor}
                                    onChange={setValor}
                                    placeholder="R$ 0,00"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dataVencimento" className="label">
                                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    Vencimento (opcional)
                                </label>
                                <input
                                    id="dataVencimento"
                                    type="date"
                                    className="input"
                                    value={dataVencimento}
                                    onChange={(e) => setDataVencimento(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dataPagamento" className="label">
                                    <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    Pagamento (opcional)
                                </label>
                                <input
                                    id="dataPagamento"
                                    type="date"
                                    className="input"
                                    value={dataPagamento}
                                    onChange={(e) => setDataPagamento(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="observacao" className="label">Observação (opcional)</label>
                            <textarea
                                id="observacao"
                                className="input"
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                                placeholder="Detalhes adicionais sobre a despesa..."
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="anexo" className="label">Anexo (opcional)</label>
                            <input
                                id="anexo"
                                type="file"
                                className="input"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            {arquivo && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    <Paperclip size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                    {arquivo.name}
                                </p>
                            )}
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
                    <Receipt size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Carregando despesas...
                    </h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>
                        {error}
                    </h3>
                </div>
            ) : expenses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Receipt size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Nenhuma despesa registrada
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Registre despesas para controlar custos
                    </p>
                </div>
            ) : (
                <>
                    {expenses.some(e => (isExpiring(e) || isExpired(e)) && !isPaid(e)) && (
                        <div style={{
                            backgroundColor: '#fef3c7',
                            border: '1px solid #fbbf24',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <AlertCircle size={20} style={{ color: '#92400e', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>
                                    Atenção: Despesas próximas do vencimento
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                                    {expenses.filter(e => (isExpiring(e) || isExpired(e)) && !isPaid(e)).length} despesa(s) vencendo ou vencida(s) não paga(s)
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                        <th>Vencimento</th>
                                        <th>Pagamento</th>
                                        <th>Anexo</th>
                                        <th>Status</th>
                                        <th style={{ width: '60px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map(expense => (
                                        <tr key={expense.id} style={{
                                            backgroundColor: !isPaid(expense) && isExpired(expense) ? '#fee2e2' :
                                                !isPaid(expense) && isExpiring(expense) ? '#fef3c7' : 'transparent'
                                        }}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{expense.descricao}</div>
                                                {expense.observacao && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                        {expense.observacao}
                                                    </div>
                                                )}
                                            </td>
                                            <td>R$ {expense.valor.toFixed(2)}</td>
                                            <td>
                                                {expense.dataVencimento
                                                    ? new Date(expense.dataVencimento).toLocaleDateString('pt-BR')
                                                    : '-'
                                                }
                                            </td>
                                            <td>
                                                {expense.dataPagamento
                                                    ? new Date(expense.dataPagamento).toLocaleDateString('pt-BR')
                                                    : '-'
                                                }
                                            </td>
                                            <td>
                                                {expense.anexoUrl ? (
                                                    <a
                                                        href={expense.anexoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: 'var(--primary)', textDecoration: 'none' }}
                                                    >
                                                        <Download size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                                        Ver
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {isPaid(expense) ? (
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: '#dcfce7',
                                                        color: '#166534',
                                                    }}>
                                                        Pago
                                                    </span>
                                                ) : isExpired(expense) ? (
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: '#fee2e2',
                                                        color: '#991b1b',
                                                    }}>
                                                        Vencida
                                                    </span>
                                                ) : isExpiring(expense) ? (
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: '#fef3c7',
                                                        color: '#92400e',
                                                    }}>
                                                        Vencendo
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: '#e0e7ff',
                                                        color: '#3730a3',
                                                    }}>
                                                        Pendente
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-outline"
                                                    style={{ padding: '0.375rem', color: 'var(--danger)' }}
                                                    onClick={() => handleDelete(expense.id)}
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
                </>
            )}
        </MainLayout>
    );
}
