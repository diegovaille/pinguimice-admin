import { useState, type FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { TipoEntrada } from '../types/api-types';
import type { SaborResponse } from '../types/api-types';
import { api } from '../services/api';
import CurrencyInput from './CurrencyInput';
import './Modal.css';

export interface StockModalData {
    name: string;
    type: 'insumo' | 'embalagem' | 'outros';
    quantity: number;
    unit: string;
    price: number;
    tipoEntrada?: TipoEntrada;
    unidadesPorItem?: number;
    saborId?: string;
}

interface StockModalProps {
    onClose: () => void;
    onSave: (data: StockModalData) => void;
    initialData?: StockModalData;
}

export default function StockModal({ onClose, onSave, initialData }: StockModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<'insumo' | 'embalagem' | 'outros'>('insumo');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('un');

    // Fields for specific types
    const [tipoEntrada, setTipoEntrada] = useState<TipoEntrada>('CAIXA');
    const [unidadesPorItem, setUnidadesPorItem] = useState('');
    const [saborId, setSaborId] = useState<string>('');

    // Sabores list
    const [sabores, setSabores] = useState<SaborResponse[]>([]);
    const [loadingSabores, setLoadingSabores] = useState(false);

    useEffect(() => {
        loadSabores();
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setQuantity(initialData.quantity.toString());
            setPrice(initialData.price.toString());
            setUnit(initialData.unit);

            if (initialData.tipoEntrada) setTipoEntrada(initialData.tipoEntrada);

            // For Outros, we display units / 50 (e.g. 3500 becomes 70)
            if (initialData.unidadesPorItem) {
                const displayUnidades = initialData.type === 'outros'
                    ? initialData.unidadesPorItem / 50
                    : initialData.unidadesPorItem;
                setUnidadesPorItem(displayUnidades.toString());
            }

            if (initialData.saborId) setSaborId(initialData.saborId.toString());
        }
    }, [initialData]);

    const loadSabores = async () => {
        try {
            setLoadingSabores(true);
            const data = await api.getSabores();
            setSabores(data);
        } catch (err) {
            console.error('Error loading sabores:', err);
        } finally {
            setLoadingSabores(false);
        }
    };

    // Intelligent auto-filling and reset logic
    useEffect(() => {
        // Skip if editing an existing item
        if (initialData) return;

        // Reset common fields on type change (except if they are about to be set below)
        setQuantity('');

        if (type === 'outros') {
            setName('Saco Transparente (50 un)');
            setPrice('25.00');
            setUnidadesPorItem('75');
            return;
        }

        // Reset price if it was the default from "outros" or just generally on type change
        setPrice('');
        setUnidadesPorItem('');

        if (type === 'insumo') {
            if (!saborId || saborId === '') {
                setName('Açúcar');
                setTipoEntrada('KG');
            } else {
                const selectedSabor = sabores.find(s => s.id.toString() === saborId);
                if (selectedSabor) {
                    if (selectedSabor.nome === 'Coco' || selectedSabor.nome === 'Maçã Verde') {
                        setName('Selecta Tropical');
                        setTipoEntrada('KG');
                    } else {
                        setName(`Aptil ${selectedSabor.nome}`);
                        setTipoEntrada('CAIXA');
                    }
                }
            }
        } else if (type === 'embalagem') {
            setName('');
            setUnit('kg');
        }
    }, [type, saborId, sabores, initialData]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const data: StockModalData = {
            name,
            type,
            quantity: parseFloat(quantity),
            unit,
            price: parseFloat(price),
        };

        if (type === 'insumo') {
            data.tipoEntrada = tipoEntrada;
            // Add saborId if selected (optional)
            if (saborId && saborId !== '') {
                data.saborId = saborId;
            }
        } else if (type === 'embalagem') {
            // Add saborId if selected (optional)
            if (saborId && saborId !== '') {
                data.saborId = saborId;
            }
        } else if (type === 'outros') {
            // Saco Transparente logic: user inputs "70" (bags), but we save "3500" (total units)
            // because production deductions use individual units.
            data.unidadesPorItem = parseInt(unidadesPorItem) * 50;
        }

        onSave(data);
    };

    const showSaborField = type === 'insumo' || type === 'embalagem';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Adicionar Item</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="type" className="label">Tipo</label>
                        <select
                            id="type"
                            className="input"
                            value={type}
                            onChange={(e) => setType(e.target.value as 'insumo' | 'embalagem' | 'outros')}
                            required
                        >
                            <option value="insumo">Matéria Prima</option>
                            <option value="embalagem">Embalagem</option>
                            <option value="outros">Outros</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="label">Nome</label>
                        <input
                            id="name"
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Leite, Sacola, Copo"
                            required
                            autoFocus
                            disabled={type === 'outros' || (type === 'insumo' && (!saborId || saborId === ''))}
                        />
                    </div>

                    {showSaborField && (
                        <div className="form-group">
                            <label htmlFor="saborId" className="label">
                                Sabor (opcional)
                            </label>
                            <select
                                id="saborId"
                                className="input"
                                value={saborId}
                                onChange={(e) => setSaborId(e.target.value)}
                                disabled={loadingSabores}
                            >
                                <option value="">Nenhum / Genérico</option>
                                {sabores.map(sabor => (
                                    <option key={sabor.id} value={sabor.id}>
                                        {sabor.nome}
                                    </option>
                                ))}
                            </select>
                            <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                                Deixe vazio para itens genéricos que podem ser usados em qualquer sabor
                            </small>
                        </div>
                    )}

                    {type === 'insumo' && (
                        <div className="form-group">
                            <label htmlFor="tipoEntrada" className="label">Tipo de Entrada</label>
                            <select
                                id="tipoEntrada"
                                className="input"
                                value={tipoEntrada}
                                onChange={(e) => setTipoEntrada(e.target.value as TipoEntrada)}
                                required
                            >
                                <option value={TipoEntrada.CAIXA}>Caixa</option>
                                <option value={TipoEntrada.PACOTE}>Pacote</option>
                                <option value={TipoEntrada.KG}>Quilograma (KG)</option>
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label htmlFor="quantity" className="label">
                                {type === 'embalagem' ? 'Quantidade (Kg)' :
                                    type === 'outros' ? 'Quantidade Total (Kg)' : 'Quantidade Total (Unidades)'}
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                step="0.01"
                                className="input"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price" className="label">
                                {type === 'embalagem' || type === 'outros' ? 'Preço por Kg' : 'Preço por Unidade'}
                            </label>
                            <CurrencyInput
                                id="price"
                                value={price}
                                onChange={setPrice}
                                placeholder="R$ 0,00"
                                required
                            />
                        </div>
                    </div>

                    {type === 'outros' && (
                        <div className="form-group">
                            <label htmlFor="unidadesPorItem" className="label">Total de sacos (50 un) por Kg</label>
                            <input
                                id="unidadesPorItem"
                                type="number"
                                className="input"
                                value={unidadesPorItem}
                                onChange={(e) => setUnidadesPorItem(e.target.value)}
                                placeholder="75"
                                required
                            />
                            <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                                Cada saco equivale a 50 unidades no estoque. 1Kg = 3750 unidades totais.
                            </small>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
