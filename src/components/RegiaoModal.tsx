import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { RegiaoVendaRequest, RegiaoVendaResponse } from '../types/api-types';
import './Modal.css';

interface RegiaoModalProps {
    regiao: RegiaoVendaResponse | null;
    onClose: () => void;
    onSave: (data: RegiaoVendaRequest) => void;
}

export default function RegiaoModal({ regiao, onClose, onSave }: RegiaoModalProps) {
    const [nome, setNome] = useState(regiao?.nome || '');
    const [descricao, setDescricao] = useState(regiao?.descricao || '');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({
            nome,
            descricao: descricao || undefined,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {regiao ? 'Editar Região' : 'Adicionar Região'}
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
                            placeholder="Ex: Centro, Zona Norte, Zona Sul"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descricao" className="label">Descrição (opcional)</label>
                        <textarea
                            id="descricao"
                            className="input"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Informações adicionais sobre a região"
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
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
