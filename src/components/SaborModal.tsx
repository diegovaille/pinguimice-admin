import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { SaborRequest, SaborResponse } from '../types/api-types';
import './Modal.css';

interface SaborModalProps {
    sabor: SaborResponse | null;
    onClose: () => void;
    onSave: (data: SaborRequest) => void;
}

export default function SaborModal({ sabor, onClose, onSave }: SaborModalProps) {
    const [nome, setNome] = useState(sabor?.nome || '');
    const [corHex, setCorHex] = useState(sabor?.corHex || '#FF5733');
    const [usaAcucar, setUsaAcucar] = useState(sabor?.usaAcucar || false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({
            nome,
            corHex,
            usaAcucar,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {sabor ? 'Editar Sabor' : 'Adicionar Sabor'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label htmlFor="nome" className="label">Nome</label>
                        <input
                            id="nome"
                            type="text"
                            className="input"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Morango, Limão, Uva"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="corHex" className="label">Cor</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                id="corHex"
                                type="color"
                                className="input"
                                value={corHex}
                                onChange={(e) => setCorHex(e.target.value)}
                                style={{ width: '80px', height: '40px', cursor: 'pointer' }}
                            />
                            <input
                                type="text"
                                className="input"
                                value={corHex}
                                onChange={(e) => setCorHex(e.target.value)}
                                placeholder="#FF5733"
                                pattern="^#[0-9A-Fa-f]{6}$"
                                style={{ flex: 1 }}
                            />
                        </div>
                        <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                            Escolha uma cor para identificar o sabor
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={usaAcucar}
                                onChange={(e) => setUsaAcucar(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span>Usa Açúcar?</span>
                        </label>
                        <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                            Indica se este sabor utiliza açúcar como base na produção
                        </small>
                    </div>

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
