import { useState, useEffect, type FormEvent } from 'react';
import MainLayout from '../layouts/MainLayout';
import { api } from '../services/api';
import type { ClienteResponse, ClienteRequest } from '../types/api-types';
import { Plus, Search, Edit2, Trash2, Ban, Unlock, MapPin, Phone } from 'lucide-react';
import { useRegions } from '../hooks/useRegions';

export default function Clients() {
    const [clients, setClients] = useState<ClienteResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<ClienteResponse | null>(null);

    // Form state
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [regiaoId, setRegiaoId] = useState('');

    const { regions } = useRegions();

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await api.getClientes();
            setClients(data);
        } catch (err) {
            console.error('Error loading clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const clientData: ClienteRequest = {
                nome,
                endereco: endereco || undefined,
                telefone: telefone || undefined,
                cnpj: cnpj || undefined,
                regiaoId: regiaoId || undefined
            };

            if (editingClient) {
                await api.updateCliente(editingClient.id, clientData);
            } else {
                await api.createCliente(clientData);
            }

            setShowForm(false);
            resetForm();
            loadClients();
        } catch (err: any) {
            console.error('Error saving client:', err);
            alert(err.message || 'Erro ao salvar cliente');
        }
    };

    const resetForm = () => {
        setEditingClient(null);
        setNome('');
        setEndereco('');
        setTelefone('');
        setCnpj('');
        setRegiaoId('');
    };

    const handleEdit = (client: ClienteResponse) => {
        setEditingClient(client);
        setNome(client.nome);
        setEndereco(client.endereco || '');
        setTelefone(client.telefone || '');
        setCnpj(client.cnpj || '');
        setRegiaoId(client.regiao?.id || '');
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        try {
            await api.deleteCliente(id);
            loadClients();
        } catch (err) {
            console.error('Error deleting client:', err);
            alert('Erro ao excluir cliente');
        }
    };

    const handleToggleBlock = async (client: ClienteResponse) => {
        try {
            if (client.bloqueado) {
                await api.desbloquearCliente(client.id);
            } else {
                const motivo = prompt('Motivo do bloqueio:');
                if (motivo === null) return;
                await api.bloquearCliente(client.id, motivo);
            }
            loadClients();
        } catch (err) {
            console.error('Error toggling block status:', err);
            alert('Erro ao alterar status do cliente');
        }
    };

    const filteredClients = clients.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cnpj?.includes(searchTerm)
    );

    return (
        <MainLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerenciamento da carteira de clientes e pontos de venda</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                    <Plus size={20} /> Novo Cliente
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="label">Nome / Razão Social</label>
                            <input className="input" value={nome} onChange={e => setNome(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="label">CNPJ / CPF</label>
                            <input className="input" value={cnpj} onChange={e => setCnpj(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="label">Telefone</label>
                            <input className="input" value={telefone} onChange={e => setTelefone(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="label">Endereço</label>
                            <input className="input" value={endereco} onChange={e => setEndereco(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="label">Região</label>
                            <select className="select" value={regiaoId} onChange={e => setRegiaoId(e.target.value)}>
                                <option value="">Sem região</option>
                                {regions.map(r => (
                                    <option key={r.id} value={r.id}>{r.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            className="input"
                            style={{ paddingLeft: '40px' }}
                            placeholder="Buscar por nome ou CNPJ..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Contato / Endereço</th>
                                <th>Região</th>
                                <th>Status</th>
                                <th style={{ width: '120px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</td></tr>
                            ) : filteredClients.map(client => (
                                <tr key={client.id} style={{ opacity: client.bloqueado ? 0.7 : 1 }}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{client.nome}</div>
                                        {client.cnpj && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{client.cnpj}</div>}
                                    </td>
                                    <td>
                                        {client.telefone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Phone size={14} /> {client.telefone}</div>}
                                        {client.endereco && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><MapPin size={14} /> {client.endereco}</div>}
                                    </td>
                                    <td>
                                        {client.regiao ? (
                                            <span className="badge badge-info">{client.regiao.nome}</span>
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>N/A</span>
                                        )}
                                    </td>
                                    <td>
                                        {client.bloqueado ? (
                                            <span className="badge badge-danger" title={client.motivoBloqueio}>Bloqueado</span>
                                        ) : (
                                            <span className="badge badge-success">Ativo</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-outline" onClick={() => handleToggleBlock(client)} title={client.bloqueado ? 'Desbloquear' : 'Bloquear'}>
                                                {client.bloqueado ? <Unlock size={16} /> : <Ban size={16} />}
                                            </button>
                                            <button className="btn-outline" onClick={() => handleEdit(client)} title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-outline" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(client.id)} title="Excluir">
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
        </MainLayout>
    );
}
