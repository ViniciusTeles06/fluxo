export const CATEGORIAS = [
  'Renda',
  'Moradia',
  'Mercado',
  'Alimentação',
  'Transporte',
  'Lazer',
  'Assinaturas',
  'Saúde',
  'Educação',
  'Compras',
  'Outros',
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export type TipoLancamento = 'entrada' | 'saida'

export type FormaAVista = 'pix' | 'debito' | 'dinheiro'

export interface Lancamento {
  id: string
  descricao: string
  valor: number
  tipo: TipoLancamento
  categoria: Categoria
  forma: FormaAVista
  data: string
}

export interface CompraCartao {
  id: string
  descricao: string
  categoria: Categoria
  total: number
  parcelas: number
  data: string
}

export interface ContaDoMes {
  id: string
  nome: string
  valor: number
  dia: number
  categoria: Categoria
  idLancamento?: string
}

export interface Meta {
  id: string
  nome: string
  alvo: number
  guardado: number
}

export interface ConfigCartao {
  fechamento: number
  vencimento: number
}

export interface DadosFluxo {
  versao: 1
  lancamentos: Lancamento[]
  compras: CompraCartao[]
  contas: ContaDoMes[]
  metas: Meta[]
  limites: Partial<Record<Categoria, number>>
  faturasPagas: string[]
  cartao: ConfigCartao
}