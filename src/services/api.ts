import { config } from '../config/config';
import type {
    SaborRequest,
    SaborResponse,
    RegiaoVendaRequest,
    RegiaoVendaResponse,
    MateriaPrimaRequest,
    MateriaPrimaResponse,
    EmbalagemRequest,
    EmbalagemResponse,
    OutrosRequest,
    OutrosResponse,
    EstoqueGelinhoResponse,
    ProducaoRequest,
    ProducaoResponse,
    DespesaRequest,
    DespesaResponse,
    PinguimVendaRequest,
    PinguimVendaResponse,
    PinguimLoginRequest,
    PinguimLoginResponse,
    RelatorioDespesasResponse,
    RelatorioVendasResponse,
    RelatorioEstoqueResponse,
    RelatorioProducaoResponse,
    RelatorioLucroResponse,
    ParametroCalculoRequest,
    ParametroCalculoResponse,
    ClienteRequest,
    ClienteResponse,
} from '../types/api-types';

// API Client with authentication and error handling
class ApiClient {
    private getAuthHeaders(includeContentType: boolean = true): HeadersInit {
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {};

        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
                // If not JSON, use the text or default message
                errorMessage = errorText || errorMessage;
            }

            throw new Error(errorMessage);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    // Auth API
    async login(data: PinguimLoginRequest): Promise<PinguimLoginResponse> {
        const url = config.getApiUrl('auth/login');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return this.handleResponse<PinguimLoginResponse>(response);
    }

    // Sabores (Flavors) API
    async getSabores(apenasAtivos: boolean = true): Promise<SaborResponse[]> {
        const url = config.getApiUrl(`sabores?apenasAtivos=${apenasAtivos}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<SaborResponse[]>(response);
    }

    async createSabor(data: SaborRequest): Promise<SaborResponse> {
        const url = config.getApiUrl('sabores');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<SaborResponse>(response);
    }

    async updateSabor(id: string, data: SaborRequest): Promise<SaborResponse> {
        const url = config.getApiUrl(`sabores/${id}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<SaborResponse>(response);
    }

    // Regiões (Regions) API
    async getRegioes(apenasAtivos: boolean = true): Promise<RegiaoVendaResponse[]> {
        const url = config.getApiUrl(`regioes?apenasAtivos=${apenasAtivos}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<RegiaoVendaResponse[]>(response);
    }

    async createRegiao(data: RegiaoVendaRequest): Promise<RegiaoVendaResponse> {
        const url = config.getApiUrl('regioes');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<RegiaoVendaResponse>(response);
    }

    async updateRegiao(id: string, data: RegiaoVendaRequest): Promise<RegiaoVendaResponse> {
        const url = config.getApiUrl(`regioes/${id}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<RegiaoVendaResponse>(response);
    }

    // Matéria Prima (Raw Materials) API
    async getMateriaPrima(): Promise<MateriaPrimaResponse[]> {
        const url = config.getApiUrl('materia-prima');
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<MateriaPrimaResponse[]>(response);
    }

    async createMateriaPrima(data: MateriaPrimaRequest): Promise<MateriaPrimaResponse> {
        const url = config.getApiUrl('materia-prima');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<MateriaPrimaResponse>(response);
    }

    async updateMateriaPrima(id: string, data: MateriaPrimaRequest): Promise<MateriaPrimaResponse> {
        const url = config.getApiUrl(`materia-prima/${id}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<MateriaPrimaResponse>(response);
    }

    async deleteMateriaPrima(id: string): Promise<void> {
        const url = config.getApiUrl(`materia-prima/${id}`);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<void>(response);
    }

    // Embalagem (Packaging) API
    async getEmbalagens(): Promise<EmbalagemResponse[]> {
        const url = config.getApiUrl('embalagem');
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<EmbalagemResponse[]>(response);
    }

    async createEmbalagem(data: EmbalagemRequest): Promise<EmbalagemResponse> {
        const url = config.getApiUrl('embalagem');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<EmbalagemResponse>(response);
    }

    async updateEmbalagem(id: string, data: EmbalagemRequest): Promise<EmbalagemResponse> {
        const url = config.getApiUrl(`embalagem/${id}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<EmbalagemResponse>(response);
    }

    async deleteEmbalagem(id: string): Promise<void> {
        const url = config.getApiUrl(`embalagem/${id}`);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<void>(response);
    }

    // Outros (Other Items) API
    async getOutros(): Promise<OutrosResponse[]> {
        const url = config.getApiUrl('outros');
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<OutrosResponse[]>(response);
    }

    async createOutros(data: OutrosRequest): Promise<OutrosResponse> {
        const url = config.getApiUrl('outros');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<OutrosResponse>(response);
    }

    async updateOutros(id: string, data: OutrosRequest): Promise<OutrosResponse> {
        const url = config.getApiUrl(`outros/${id}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<OutrosResponse>(response);
    }

    async deleteOutros(id: string): Promise<void> {
        const url = config.getApiUrl(`outros/${id}`);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<void>(response);
    }

    // Estoque Gelinho (Ice Stock) API
    async getEstoqueGelinho(): Promise<EstoqueGelinhoResponse[]> {
        const url = config.getApiUrl('estoque-gelinho');
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<EstoqueGelinhoResponse[]>(response);
    }

    // Produção (Production) API
    async getProducao(inicio?: string, fim?: string): Promise<ProducaoResponse[]> {
        let url = config.getApiUrl('producao');
        const params = new URLSearchParams();

        if (inicio) params.append('inicio', inicio);
        if (fim) params.append('fim', fim);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<ProducaoResponse[]>(response);
    }

    async createProducao(data: ProducaoRequest): Promise<ProducaoResponse> {
        const url = config.getApiUrl('producao');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<ProducaoResponse>(response);
    }

    async deleteProducao(id: string): Promise<void> {
        const url = config.getApiUrl(`producao/${id}`);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<void>(response);
    }

    // Despesas (Expenses) API
    async getDespesas(inicio?: string, fim?: string): Promise<DespesaResponse[]> {
        let url = config.getApiUrl('despesas');
        const params = new URLSearchParams();

        if (inicio) params.append('inicio', inicio);
        if (fim) params.append('fim', fim);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<DespesaResponse[]>(response);
    }

    async createDespesa(data: DespesaRequest, arquivo?: File): Promise<DespesaResponse> {
        const url = config.getApiUrl('despesas');

        if (!arquivo) {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data),
            });
            return this.handleResponse<DespesaResponse>(response);
        }

        const formData = new FormData();
        // Add the JSON data as a blob with explicit type
        formData.append('dados', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        formData.append('arquivo', arquivo);

        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(false), // Let browser set Content-Type with boundary
            body: formData,
        });
        return this.handleResponse<DespesaResponse>(response);
    }

    async updateDespesa(id: string, data: DespesaRequest, arquivo?: File): Promise<DespesaResponse> {
        const url = config.getApiUrl(`despesas/${id}`);

        if (!arquivo) {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data),
            });
            return this.handleResponse<DespesaResponse>(response);
        }

        const formData = new FormData();
        // Add the JSON data as a blob with explicit type
        formData.append('dados', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        formData.append('arquivo', arquivo);

        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(false), // Let browser set Content-Type with boundary
            body: formData,
        });
        return this.handleResponse<DespesaResponse>(response);
    }

    async deleteDespesa(id: string): Promise<void> {
        const url = config.getApiUrl(`despesas/${id}`);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<void>(response);
    }

    // Sales API
    async getSales(inicio?: Date, fim?: Date): Promise<PinguimVendaResponse[]> {
        let url = config.getApiUrl('vendas');
        const params = new URLSearchParams();

        if (inicio) params.append('inicio', inicio.toISOString());
        if (fim) params.append('fim', fim.toISOString());

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<PinguimVendaResponse[]>(response);
    }

    async createSale(data: PinguimVendaRequest): Promise<PinguimVendaResponse> {
        const url = config.getApiUrl('vendas');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<PinguimVendaResponse>(response);
    }

    async updateSale(id: string, data: PinguimVendaRequest): Promise<PinguimVendaResponse> {
        const url = config.getApiUrl(`vendas/${id}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<PinguimVendaResponse>(response);
    }

    async markSaleAsPaid(id: string): Promise<PinguimVendaResponse> {
        const url = config.getApiUrl(`vendas/${id}/pagar`);
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<PinguimVendaResponse>(response);
    }

    async cancelSale(id: string): Promise<void> {
        const url = config.getApiUrl(`vendas/${id}`);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<void>(response);
    }

    // Relatórios (Reports) API
    async getRelatorioDespesas(inicio: string, fim: string): Promise<RelatorioDespesasResponse> {
        const url = config.getApiUrl(`relatorios/despesas?inicio=${inicio}&fim=${fim}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<RelatorioDespesasResponse>(response);
    }

    async getRelatorioVendas(inicio: string, fim: string): Promise<RelatorioVendasResponse> {
        const url = config.getApiUrl(`relatorios/vendas?inicio=${inicio}&fim=${fim}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<RelatorioVendasResponse>(response);
    }

    async getRelatorioEstoque(): Promise<RelatorioEstoqueResponse> {
        const url = config.getApiUrl('relatorios/estoque');
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<RelatorioEstoqueResponse>(response);
    }

    async getRelatorioProducao(inicio: string, fim: string): Promise<RelatorioProducaoResponse> {
        const url = config.getApiUrl(`relatorios/producao?inicio=${inicio}&fim=${fim}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<RelatorioProducaoResponse>(response);
    }

    async getRelatorioLucro(inicio: string, fim: string): Promise<RelatorioLucroResponse> {
        const url = config.getApiUrl(`relatorios/lucro?inicio=${inicio}&fim=${fim}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<RelatorioLucroResponse>(response);
    }

    // Parâmetros de Cálculo API
    async getParametrosCalculo(): Promise<ParametroCalculoResponse[]> {
        const url = config.getApiUrl('parametros-calculo');
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<ParametroCalculoResponse[]>(response);
    }

    async createParametroCalculo(data: ParametroCalculoRequest): Promise<ParametroCalculoResponse> {
        const url = config.getApiUrl('parametros-calculo');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<ParametroCalculoResponse>(response);
    }

    async getParametroPorChave(chave: string): Promise<ParametroCalculoResponse> {
        const url = config.getApiUrl(`parametros-calculo/${chave}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<ParametroCalculoResponse>(response);
    }

    async updateParametroCalculo(chave: string, data: ParametroCalculoRequest): Promise<ParametroCalculoResponse> {
        const url = config.getApiUrl(`parametros-calculo/${chave}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<ParametroCalculoResponse>(response);
    }

    // Clientes API
    async getClientes(apenasAtivos = false): Promise<ClienteResponse[]> {
        const url = config.getApiUrl(`clientes?apenasAtivos=${apenasAtivos}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<ClienteResponse[]>(response);
    }

    async createCliente(data: ClienteRequest): Promise<ClienteResponse> {
        const url = config.getApiUrl('clientes');
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<ClienteResponse>(response);
    }

    async getClientePorId(id: string): Promise<ClienteResponse> {
        const url = config.getApiUrl(`clientes/${id}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<ClienteResponse>(response);
    }

    async updateCliente(id: string, data: ClienteRequest): Promise<ClienteResponse> {
        const url = config.getApiUrl(`clientes/${id}`);
        const response = await fetch(url, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<ClienteResponse>(response);
    }

    async deleteCliente(id: string): Promise<void> {
        const url = config.getApiUrl(`clientes/${id}`);
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<void>(response);
    }

    async bloquearCliente(id: string, motivo: string): Promise<ClienteResponse> {
        const url = config.getApiUrl(`clientes/${id}/bloquear`);
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ motivo }),
        });
        return this.handleResponse<ClienteResponse>(response);
    }

    async desbloquearCliente(id: string): Promise<ClienteResponse> {
        const url = config.getApiUrl(`clientes/${id}/desbloquear`);
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
        });
        return this.handleResponse<ClienteResponse>(response);
    }
}

// Export singleton instance
export const api = new ApiClient();

// Legacy compatibility exports (deprecated - will be removed)
export interface Flavor {
    id: string;
    name: string;
}

export interface StockTypeItem {
    name: string;
    unit: string;
}

export interface StockTypes {
    insumos: StockTypeItem[];
    embalagens: StockTypeItem[];
}
