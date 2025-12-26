
import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Plus, Package, IceCream, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import StockModal, { type StockModalData } from '../components/StockModal';
import type {
    MateriaPrimaResponse,
    EmbalagemResponse,
    OutrosResponse,
    EstoqueGelinhoResponse,
    SaborResponse,
} from '../types/api-types';

type UnifiedStockItem = (MateriaPrimaResponse | EmbalagemResponse | OutrosResponse) & {
    itemType: 'Matéria Prima' | 'Embalagem' | 'Outros';
};

export default function Stock() {
    const [allItems, setAllItems] = useState<UnifiedStockItem[]>([]);
    const [iceStock, setIceStock] = useState<EstoqueGelinhoResponse[]>([]);
    const [flavors, setFlavors] = useState<SaborResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'stock' | 'ice'>('stock');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<UnifiedStockItem | null>(null);
    const [displayUnit, setDisplayUnit] = useState<'unidade' | 'pacote'>('unidade');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const itemsPerPage = isMobile ? 10 : 20;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        loadAllStock();
    }, []);

    const loadAllStock = async () => {
        try {
            setLoading(true);
            const [mpData, embData, outData, iceData, flavorsData] = await Promise.all([
                api.getMateriaPrima(),
                api.getEmbalagens(),
                api.getOutros(),
                api.getEstoqueGelinho(),
                api.getSabores(),
            ]);

            // Combine all items with type labels
            const combined: UnifiedStockItem[] = [
                ...mpData.map(item => ({ ...item, itemType: 'Matéria Prima' as const })),
                ...embData.map(item => ({ ...item, itemType: 'Embalagem' as const })),
                ...outData.map(item => ({ ...item, itemType: 'Outros' as const })),
            ];

            // Sort by creation date descending (newest first)
            combined.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());

            setAllItems(combined);
            setIceStock(iceData);
            setFlavors(flavorsData);
            setError(null);
        } catch (err: any) {
            console.error('Error loading stock:', err);
            // Enhanced logging to help find which endpoint failed
            if (err.message) {
                console.error('Detalhamento do erro:', err.message);
            }
            setError('Erro ao carregar estoque. Verifique os logs do console.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: UnifiedStockItem) => {
        const modalData: StockModalData = {
            name: item.nome,
            type: item.itemType === 'Matéria Prima' ? 'insumo' :
                item.itemType === 'Embalagem' ? 'embalagem' : 'outros',
            quantity: 'quantidadeEntrada' in item ? item.quantidadeEntrada :
                'quantidadeKg' in item ? item.quantidadeKg : 0, // For editing, we might need original input quantity
            unit: item.itemType === 'Embalagem' ? 'kg' : 'un',
            price: 'precoEntrada' in item ? item.precoEntrada :
                'precoKg' in item ? item.precoKg : 0,
            saborId: 'saborId' in item && item.saborId ? item.saborId.toString() : undefined,
        };

        if (item.itemType === 'Matéria Prima' && 'tipoEntrada' in item) {
            modalData.tipoEntrada = item.tipoEntrada;
        }

        if (item.itemType === 'Outros' && 'unidadesPorItem' in item) {
            modalData.unidadesPorItem = item.unidadesPorItem;
        }

        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item: UnifiedStockItem) => {
        if (!window.confirm(`Tem certeza que deseja excluir "${item.nome}" ? `)) {
            return;
        }

        try {
            setLoading(true);
            if (item.itemType === 'Matéria Prima') {
                await api.deleteMateriaPrima(item.id.toString());
            } else if (item.itemType === 'Embalagem') {
                await api.deleteEmbalagem(item.id.toString());
            } else if (item.itemType === 'Outros') {
                await api.deleteOutros(item.id.toString());
            }
            await loadAllStock();
        } catch (err) {
            console.error('Error deleting item:', err);
            setError('Erro ao excluir item');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async (data: StockModalData) => {
        try {
            setLoading(true);
            if (editingItem) {
                // Update existing item
                if (data.type === 'insumo') {
                    await api.updateMateriaPrima(editingItem.id.toString(), {
                        nome: data.name,
                        tipoEntrada: data.tipoEntrada!,
                        quantidadeEntrada: data.quantity,
                        precoEntrada: data.price,
                        saborId: data.saborId,
                    });
                } else if (data.type === 'embalagem') {
                    await api.updateEmbalagem(editingItem.id.toString(), {
                        nome: data.name,
                        quantidadeKg: data.quantity,
                        precoKg: data.price,
                        saborId: data.saborId,
                    });
                } else if (data.type === 'outros') {
                    await api.updateOutros(editingItem.id.toString(), {
                        nome: data.name,
                        quantidadeEntrada: data.quantity,
                        precoEntrada: data.price,
                        unidadesPorItem: data.unidadesPorItem!,
                    });
                }
            } else {
                // Create new item
                if (data.type === 'insumo') {
                    await api.createMateriaPrima({
                        nome: data.name,
                        tipoEntrada: data.tipoEntrada!,
                        quantidadeEntrada: data.quantity,
                        precoEntrada: data.price,
                        saborId: data.saborId,
                    });
                } else if (data.type === 'embalagem') {
                    await api.createEmbalagem({
                        nome: data.name,
                        quantidadeKg: data.quantity,
                        precoKg: data.price,
                        saborId: data.saborId,
                    });
                } else if (data.type === 'outros') {
                    await api.createOutros({
                        nome: data.name,
                        quantidadeEntrada: data.quantity,
                        precoEntrada: data.price,
                        unidadesPorItem: data.unidadesPorItem!,
                    });
                }
            }

            setIsModalOpen(false);
            setEditingItem(null);
            setCurrentPage(1); // Reset to first page after adding/editing
            await loadAllStock();
        } catch (err) {
            console.error('Error saving item:', err);
            setError('Erro ao salvar item');
        } finally {
            setLoading(false);
        }
    };

    const totalIce = iceStock.reduce((sum, ice) => sum + ice.quantidade, 0);

    // Pagination logic
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = allItems.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // Calculate summary by flavor
    const getSummaryByFlavor = () => {
        const summary: Record<string, {
            saborId?: number;
            saborNome: string;
            materiaPrima: number;
            embalagem: number;
            outros: number;
        }> = {};

        // Add "Genérico" category for items without flavor
        summary['generic'] = {
            saborNome: 'Genérico',
            materiaPrima: 0,
            embalagem: 0,
            outros: 0,
        };

        allItems.forEach(item => {
            const saborId = 'saborId' in item ? item.saborId : undefined;
            const key = saborId || 'generic';
            const saborNome = ('saborNome' in item && item.saborNome) || 'Genérico';

            if (!summary[key]) {
                summary[key] = {
                    saborId: saborId as number | undefined,
                    saborNome,
                    materiaPrima: 0,
                    embalagem: 0,
                    outros: 0,
                };
            }

            if (item.itemType === 'Matéria Prima') {
                summary[key].materiaPrima += item.estoqueUnidades;
            } else if (item.itemType === 'Embalagem') {
                summary[key].embalagem += item.estoqueUnidades;
            } else if (item.itemType === 'Outros') {
                summary[key].outros += item.estoqueUnidades;
            }
        });

        // Remove generic if it has no items
        if (summary['generic'].materiaPrima === 0 &&
            summary['generic'].embalagem === 0 &&
            summary['generic'].outros === 0) {
            delete summary['generic'];
        }

        return Object.values(summary);
    };

    const summaryData = getSummaryByFlavor();

    const renderStockTable = () => {
        if (allItems.length === 0) {
            return (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Package size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Nenhum item em estoque
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Adicione itens para começar
                    </p>
                </div>
            );
        }

        return (
            <>
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Nome</th>
                                    <th>Sabor</th>
                                    <th>Qtd Total</th>
                                    <th>Preço Unit.</th>
                                    <th>Total {displayUnit === 'pacote' ? 'Pc.' : 'Un.'}</th>
                                    <th>Preço/Un</th>
                                    <th>Estoque ({displayUnit === 'pacote' ? 'pc.' : 'un'})</th>
                                    <th>Data Criação</th>
                                    <th style={{ width: '100px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: 'var(--radius)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: item.itemType === 'Matéria Prima' ? '#e3f2fd' :
                                                    item.itemType === 'Embalagem' ? '#f3e5f5' : '#fff3e0',
                                                color: item.itemType === 'Matéria Prima' ? '#1976d2' :
                                                    item.itemType === 'Embalagem' ? '#7b1fa2' : '#f57c00',
                                            }}>
                                                {item.itemType}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{item.nome}</td>
                                        <td>{('saborNome' in item && item.saborNome) || '-'}</td>
                                        <td>
                                            {item.itemType === 'Matéria Prima' && 'tipoEntrada' in item ?
                                                `${item.quantidadeEntrada} ${item.tipoEntrada === 'CAIXA' ? 'cx' : item.tipoEntrada === 'PACOTE' ? 'pc.' : 'kg'}` :
                                                item.itemType === 'Embalagem' && 'quantidadeKg' in item ?
                                                    `${item.quantidadeKg} kg` :
                                                    item.itemType === 'Outros' && 'quantidadeEntrada' in item ?
                                                        `${item.quantidadeEntrada} kg` : '-'}
                                        </td>
                                        <td>
                                            R$ {('precoEntrada' in item ? item.precoEntrada :
                                                'precoKg' in item ? item.precoKg : 0).toFixed(2)}
                                        </td>
                                        <td>{displayUnit === 'unidade' ? item.totalUnidades : (item.totalUnidades / 50).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td>
                                        <td>R$ {item.precoPorUnidade.toFixed(4)}</td>
                                        <td style={{ fontWeight: 600, color: item.estoqueUnidades > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                            {displayUnit === 'unidade' ? item.estoqueUnidades : (item.estoqueUnidades / 50).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {new Date(item.dataCriacao).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="icon-button"
                                                    title="Editar"
                                                    style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="icon-button"
                                                    title="Excluir"
                                                    style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1.5rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Mostrando {startIndex + 1}-{Math.min(endIndex, allItems.length)} de {allItems.length} itens
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{ padding: '0.5rem 0.75rem' }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                className="btn btn-outline"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{ padding: '0.5rem 0.75rem' }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <MainLayout>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Estoque</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Gerencie insumos, embalagens e estoque de gelos
                    </p>
                </div>
                {activeTab === 'stock' && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            display: 'flex',
                            backgroundColor: 'var(--background)',
                            padding: '2px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)'
                        }}>
                            <button
                                onClick={() => setDisplayUnit('unidade')}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    backgroundColor: displayUnit === 'unidade' ? 'var(--primary)' : 'transparent',
                                    color: displayUnit === 'unidade' ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Unidades
                            </button>
                            <button
                                onClick={() => setDisplayUnit('pacote')}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    backgroundColor: displayUnit === 'pacote' ? 'var(--primary)' : 'transparent',
                                    color: displayUnit === 'pacote' ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Pacotes
                            </button>
                        </div>
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            <Plus size={20} />
                            Adicionar Item
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid var(--border)',
                flexWrap: 'wrap',
            }}>
                <button
                    onClick={() => setActiveTab('stock')}
                    style={{
                        padding: '0.75rem 1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'stock' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'stock' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'stock' ? 600 : 400,
                        cursor: 'pointer',
                        marginBottom: '-2px',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                    }}
                >
                    Insumos / Embalagens / Outros
                </button>
                <button
                    onClick={() => setActiveTab('ice')}
                    style={{
                        padding: '0.75rem 1rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'ice' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'ice' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'ice' ? 600 : 400,
                        cursor: 'pointer',
                        marginBottom: '-2px',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <IceCream size={18} />
                    Gelos Saborizados
                </button>
                {activeTab === 'ice' && (
                    <div style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        backgroundColor: 'var(--background)',
                        padding: '2px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        alignSelf: 'center'
                    }}>
                        <button
                            onClick={() => setDisplayUnit('unidade')}
                            style={{
                                padding: '0.4rem 0.8rem',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                backgroundColor: displayUnit === 'unidade' ? 'var(--primary)' : 'transparent',
                                color: displayUnit === 'unidade' ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Unidades
                        </button>
                        <button
                            onClick={() => setDisplayUnit('pacote')}
                            style={{
                                padding: '0.4rem 0.8rem',
                                border: 'none',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                backgroundColor: displayUnit === 'pacote' ? 'var(--primary)' : 'transparent',
                                color: displayUnit === 'pacote' ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Pacotes
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Cards by Flavor */}
            {!loading && !error && activeTab === 'stock' && summaryData.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Resumo por Sabor
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {summaryData.map((summary, index) => {
                            const flavor = summary.saborId ? flavors.find(f => f.id.toString() === summary.saborId?.toString()) : null;
                            const color = flavor?.corHex;

                            return (
                                <div
                                    key={index}
                                    className="card"
                                    style={{
                                        padding: '1.25rem',
                                        background: color ? `linear-gradient(90deg, #ffffff 60%, ${color}44 80%, ${color} 100%)` : 'white',
                                        border: color ? `1px solid ${color}44` : '1px solid var(--border)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                        {summary.saborNome}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                Matéria Prima:
                                            </span>
                                            <span style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: summary.materiaPrima > 0 ? '#1976d2' : 'var(--text-secondary)'
                                            }}>
                                                {displayUnit === 'unidade'
                                                    ? `${summary.materiaPrima.toLocaleString('pt-BR')} un`
                                                    : `${(summary.materiaPrima / 50).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pc.`}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                Embalagem:
                                            </span>
                                            <span style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: summary.embalagem > 0 ? '#7b1fa2' : 'var(--text-secondary)'
                                            }}>
                                                {displayUnit === 'unidade'
                                                    ? `${summary.embalagem.toLocaleString('pt-BR')} un`
                                                    : `${(summary.embalagem / 50).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pc.`}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                Outros:
                                            </span>
                                            <span style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: summary.outros > 0 ? '#f57c00' : 'var(--text-secondary)'
                                            }}>
                                                {displayUnit === 'unidade'
                                                    ? `${summary.outros.toLocaleString('pt-BR')} un`
                                                    : `${(summary.outros / 50).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pc.`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Package size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Carregando estoque...
                    </h3>
                </div>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>
                        {error}
                    </h3>
                </div>
            ) : (
                <>
                    {activeTab === 'stock' && renderStockTable()}

                    {activeTab === 'ice' && (
                        <>
                            <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-lg)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    }}>
                                        <IceCream size={32} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                                            Total de Gelos em Estoque {displayUnit === 'pacote' ? '(pc.)' : '(un)'}
                                        </p>
                                        <p style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                            {displayUnit === 'unidade'
                                                ? totalIce.toLocaleString('pt-BR')
                                                : (totalIce / 50).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                {iceStock.map(ice => {
                                    const flavor = flavors.find(f => f.id === ice.saborId);
                                    const color = flavor?.corHex || '#eee';
                                    return (
                                        <div
                                            key={ice.id}
                                            className="card"
                                            style={{
                                                background: `linear-gradient(90deg, #ffffff 60%, ${color}44 80%, ${color} 100%)`,
                                                transition: 'all 0.3s ease',
                                                border: `1px solid ${color}44`
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                                        {ice.saborNome}
                                                    </h3>
                                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                                                        {displayUnit === 'unidade'
                                                            ? ice.quantidade.toLocaleString('pt-BR')
                                                            : (ice.quantidade / 50).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                                        {displayUnit === 'unidade' ? 'unidades' : 'pc.'}
                                                    </p>
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                                        Atualizado: {new Date(ice.ultimaAtualizacao).toLocaleString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalIce === 0 && (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem', marginTop: '1.5rem' }}>
                                    <IceCream size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
                                    <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        Nenhum gelo em estoque
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        O estoque será atualizado automaticamente quando você registrar produções
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {isModalOpen && (
                <StockModal
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                    onSave={handleSaveItem}
                    initialData={editingItem ? {
                        name: editingItem.nome,
                        type: editingItem.itemType === 'Matéria Prima' ? 'insumo' :
                            editingItem.itemType === 'Embalagem' ? 'embalagem' : 'outros',
                        quantity: 'quantidadeEntrada' in editingItem ? editingItem.quantidadeEntrada :
                            'quantidadeKg' in editingItem ? editingItem.quantidadeKg : 0,
                        unit: editingItem.itemType === 'Embalagem' ? 'kg' : 'un',
                        price: 'precoEntrada' in editingItem ? editingItem.precoEntrada :
                            'precoKg' in editingItem ? editingItem.precoKg : 0,
                        saborId: 'saborId' in editingItem && editingItem.saborId ? editingItem.saborId.toString() : undefined,
                        tipoEntrada: 'tipoEntrada' in editingItem ? editingItem.tipoEntrada : undefined,
                        unidadesPorItem: 'unidadesPorItem' in editingItem ? editingItem.unidadesPorItem : undefined
                    } : undefined}
                />
            )}
        </MainLayout>
    );
}
