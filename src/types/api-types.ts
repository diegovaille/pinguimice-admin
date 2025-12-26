// TypeScript types generated from OpenAPI specification

// Enums
export const TipoEntrada = {
    CAIXA: 'CAIXA',
    PACOTE: 'PACOTE',
    KG: 'KG'
} as const;

export type TipoEntrada = typeof TipoEntrada[keyof typeof TipoEntrada];


// Sabores (Flavors)
export interface SaborRequest {
    nome: string;
    corHex?: string; // Pattern: ^#[0-9A-Fa-f]{6}$
    usaAcucar?: boolean;
}

export interface SaborResponse {
    id: string;
    nome: string;
    corHex?: string;
    ativo: boolean;
    usaAcucar: boolean;
    dataCriacao: string; // ISO 8601 date-time
}

// Regiões (Regions)
export interface RegiaoVendaRequest {
    nome: string;
    descricao?: string;
}

export interface RegiaoVendaResponse {
    id: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
    dataCriacao: string; // ISO 8601 date-time
}

// Matéria Prima (Raw Materials)
export interface MateriaPrimaRequest {
    nome: string;
    saborId?: string;
    tipoEntrada: TipoEntrada;
    quantidadeEntrada: number;
    precoEntrada: number;
}

export interface MateriaPrimaResponse {
    id: string;
    nome: string;
    saborId?: string;
    saborNome?: string;
    tipoEntrada: TipoEntrada;
    quantidadeEntrada: number;
    precoEntrada: number;
    totalUnidades: number; // Calculated automatically
    precoPorUnidade: number; // Calculated automatically
    estoqueUnidades: number; // Current stock in units
    dataCriacao: string; // ISO 8601 date-time
}

// Embalagem (Packaging)
export interface EmbalagemRequest {
    nome: string;
    saborId?: string;
    quantidadeKg: number;
    precoKg: number;
}

export interface EmbalagemResponse {
    id: string;
    nome: string;
    saborId?: string;
    saborNome?: string;
    quantidadeKg: number;
    precoKg: number;
    totalUnidades: number; // 1kg = 700 units
    precoPorUnidade: number;
    estoqueUnidades: number;
    dataCriacao: string; // ISO 8601 date-time
}

// Outros (Other Items)
export interface OutrosRequest {
    nome: string;
    quantidadeEntrada: number;
    precoEntrada: number;
    unidadesPorItem: number;
}

export interface OutrosResponse {
    id: string;
    nome: string;
    quantidadeEntrada: number;
    precoEntrada: number;
    unidadesPorItem: number;
    totalUnidades: number;
    precoPorUnidade: number;
    estoqueUnidades: number;
    dataCriacao: string; // ISO 8601 date-time
}

// Estoque Gelinho (Ice Stock)
export interface EstoqueGelinhoResponse {
    id: string;
    saborId: string;
    saborNome: string;
    quantidade: number;
    ultimaAtualizacao: string; // ISO 8601 date-time
}

// Produção (Production)
export interface ProducaoRequest {
    saborId: string;
    quantidadeProduzida: number;
    deduzirEstoque?: boolean; // Default: true
    dataProducao?: string; // ISO 8601 date-time
    observacoes?: string;
}

export interface ProducaoResponse {
    id: string;
    saborId: string;
    saborNome: string;
    quantidadeProduzida: number;
    deduzirEstoque: boolean;
    dataProducao: string; // ISO 8601 date-time
    observacoes?: string;
}

// Despesas (Expenses)
export interface DespesaRequest {
    descricao: string;
    valor: number;
    dataVencimento?: string; // ISO 8601 date
    dataPagamento?: string; // ISO 8601 date
    observacao?: string;
}

export interface DespesaResponse {
    id: string;
    descricao: string;
    valor: number;
    dataVencimento?: string;
    dataPagamento?: string;
    anexoUrl?: string;
    observacao?: string;
    dataCriacao: string; // ISO 8601 date-time
}

// Vendas (Sales)
export interface PinguimVendaItemRequest {
    saborId: string;
    quantidade: number;
}

export interface PinguimVendaRequest {
    clienteId?: string;
    itens: PinguimVendaItemRequest[];
    total: number;
    totalPago: number;
    abaterEstoque?: boolean; // Default: true
}

export interface PinguimVendaItemResponse {
    sabor: string;
    quantidade: number;
}

export interface PinguimVendaResponse {
    id: string;
    total: number;
    totalPago: number;
    dataVenda: string; // ISO 8601 date-time
    clienteId?: string;
    clienteNome?: string;
    regiaoId?: string;
    regiaoNome?: string;
    vendedor: string;
    abaterEstoque: boolean;
    itens: PinguimVendaItemResponse[];
}

// Auth
export interface PinguimLoginRequest {
    username: string; // The backend expects 'username' but frontend uses 'email' as username
    password: string;
}

export interface PinguimLoginResponse {
    token: string;
    email: string;
    organizacaoId: string;
    filialId: string;
    perfil: string;
}

// Relatórios (Reports)
export interface PeriodoRelatorio {
    inicio: string;
    fim: string;
}

export interface DespesaPorCategoriaItem {
    categoria: string;
    valor: number;
    percentual: number;
    quantidade: number;
}

export interface DespesaPorPeriodoItem {
    periodo: string;
    valor: number;
    quantidade: number;
}

export interface DespesaDetalhadaItem {
    descricao: string;
    valor: number;
    dataPagamento?: string;
    dataVencimento?: string;
    status: 'PAGO' | 'PENDENTE' | 'VENCIDO';
}

export interface RelatorioDespesasResponse {
    periodo: PeriodoRelatorio;
    totalDespesas: number;
    totalPago: number;
    totalPendente: number;
    despesasPorCategoria: DespesaPorCategoriaItem[];
    despesasPorSemana: DespesaPorPeriodoItem[];
    despesasPorMes: DespesaPorPeriodoItem[];
    despesasDetalhadas: DespesaDetalhadaItem[];
}

export interface VendaPorSaborItem {
    sabor: string;
    quantidade: number;
    valorTotal: number;
    percentualQuantidade: number;
    percentualValor: number;
}

export interface VendaPorRegiaoItem {
    regiao: string;
    quantidade: number;
    valorTotal: number;
    percentual: number;
}

export interface VendaPorPeriodoItem {
    periodo: string;
    valorTotal: number;
    quantidadeVendas: number;
}

export interface ClienteItem {
    cliente: string;
    totalCompras: number;
    quantidadeCompras: number;
}

export interface RelatorioVendasResponse {
    periodo: PeriodoRelatorio;
    totalVendas: number;
    totalRecebido: number;
    totalPendente: number;
    quantidadeVendas: number;
    ticketMedio: number;
    vendasPorSabor: VendaPorSaborItem[];
    vendasPorRegiao: VendaPorRegiaoItem[];
    vendasPorSemana: VendaPorPeriodoItem[];
    vendasPorDia: VendaPorPeriodoItem[];
    topClientes: ClienteItem[];
}

export interface EstoqueMateriaPrimaItem {
    nome: string;
    sabor?: string;
    estoqueUnidades: number;
    totalUnidades: number;
    percentualDisponivel: number;
    precoPorUnidade: number;
    valorTotal: number;
}

export interface EstoqueEmbalagemItem {
    nome: string;
    sabor?: string;
    estoqueUnidades: number;
    totalUnidades: number;
    percentualDisponivel: number;
    precoPorUnidade: number;
    valorTotal: number;
}

export interface EstoqueGelinhoItem {
    sabor: string;
    quantidade: number;
}

export interface AlertaEstoqueItem {
    tipo: 'MATERIA_PRIMA' | 'EMBALAGEM';
    nome: string;
    sabor?: string;
    estoqueAtual: number;
    nivelCritico: 'CRITICO' | 'BAIXO';
}

export interface RelatorioEstoqueResponse {
    dataGeracao: string;
    estoqueMateriaPrima: EstoqueMateriaPrimaItem[];
    estoqueEmbalagem: EstoqueEmbalagemItem[];
    estoqueGelinho: EstoqueGelinhoItem[];
    valorTotalEstoque: number;
    alertasEstoqueBaixo: AlertaEstoqueItem[];
}

export interface ProducaoPorSaborItem {
    sabor: string;
    quantidade: number;
    percentual: number;
    vezes: number;
}

export interface ProducaoPorPeriodoItem {
    periodo: string;
    quantidade: number;
    quantidadeProducoes: number;
}

export interface RelatorioProducaoResponse {
    periodo: PeriodoRelatorio;
    totalProducao: number;
    producaoPorSabor: ProducaoPorSaborItem[];
    producaoPorDia: ProducaoPorPeriodoItem[];
    mediaProducaoDiaria: number;
    diasComProducao: number;
}

export interface LucroPorPeriodoItem {
    periodo: string;
    vendas: number;
    despesas: number;
    lucro: number;
    margemLucro: number;
}

export interface MelhorPiorMesItem {
    mes: string;
    valor: number;
}

export interface ResumoFinanceiro {
    receitaMedia: number;
    despesaMedia: number;
    lucroMedio: number;
    melhorMes: MelhorPiorMesItem;
    piorMes: MelhorPiorMesItem;
}

export interface RelatorioLucroResponse {
    periodo: PeriodoRelatorio;
    totalVendas: number;
    totalDespesas: number;
    lucroLiquido: number;
    margemLucro: number;
    lucroPorMes: LucroPorPeriodoItem[];
    resumoFinanceiro: ResumoFinanceiro;
}

// Parâmetros de Cálculo
export interface ParametroCalculoRequest {
    chave: string;
    valor: number;
    descricao?: string;
}

export interface ParametroCalculoResponse {
    chave: string;
    valor: number;
    descricao?: string;
    dataAtualizacao: string; // ISO 8601 date-time
}

// Clientes
export interface ClienteRequest {
    nome: string;
    endereco?: string;
    telefone?: string;
    cnpj?: string;
    regiaoId?: string;
    bloqueado?: boolean;
    motivoBloqueio?: string;
}

export interface ClienteResponse {
    id: string;
    nome: string;
    endereco?: string;
    telefone?: string;
    cnpj?: string;
    regiao?: ClienteRegiaoInfo;
    bloqueado: boolean;
    motivoBloqueio?: string;
    dataCriacao: string;
}

export interface ClienteRegiaoInfo {
    id: string;
    nome: string;
}

