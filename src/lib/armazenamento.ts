import {
  CATEGORIAS,
  type Categoria,
  type CompraCartao,
  type ConfigCartao,
  type ContaDoMes,
  type DadosFluxo,
  type FormaAVista,
  type Lancamento,
  type Meta,
  type TipoLancamento,
} from '../tipos'
import { VALOR_MAXIMO } from './dinheiro'

export const CHAVE_DADOS = 'fluxo:dados'
export const CHAVE_COPIA = 'fluxo:dados:copia'
export const MAXIMO_PARCELAS = 48
export const CARTAO_PADRAO: ConfigCartao = { fechamento: 27, vencimento: 5 }

export interface Armazenamento {
  getItem(chave: string): string | null
  setItem(chave: string, valor: string): void
}

export interface Carregamento {
  dados: DadosFluxo
  podeSalvar: boolean
}

type Bruto = Record<string, unknown>

export function dadosVazios(): DadosFluxo {
  return {
    versao: 1,
    nome: '',
    exemplo: false,
    lancamentos: [],
    compras: [],
    contas: [],
    metas: [],
    limites: {},
    faturasPagas: [],
    cartao: { ...CARTAO_PADRAO },
  }
}

function ehObjeto(valor: unknown): valor is Bruto {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function ehTexto(valor: unknown, maximo: number): valor is string {
  return typeof valor === 'string' && valor.trim().length > 0 && valor.length <= maximo
}

function ehInteiro(valor: unknown, minimo: number, maximo: number): valor is number {
  return Number.isInteger(valor) && (valor as number) >= minimo && (valor as number) <= maximo
}

function ehValor(valor: unknown): valor is number {
  return ehInteiro(valor, 1, VALOR_MAXIMO)
}

function ehCategoria(valor: unknown): valor is Categoria {
  return (CATEGORIAS as readonly unknown[]).includes(valor)
}

function ehTipo(valor: unknown): valor is TipoLancamento {
  return valor === 'entrada' || valor === 'saida'
}

function ehForma(valor: unknown): valor is FormaAVista {
  return valor === 'pix' || valor === 'debito' || valor === 'dinheiro'
}

function ehData(valor: unknown): valor is string {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false
  }
  const [ano, mes, dia] = valor.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia)
  return (
    ano >= 2000 &&
    ano <= 2100 &&
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia
  )
}

function ehMes(valor: unknown): valor is string {
  return typeof valor === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(valor)
}

function lerLista<T extends { id: string }>(valor: unknown, ler: (item: Bruto) => T | null) {
  if (!Array.isArray(valor)) {
    return []
  }
  const ids = new Set<string>()
  const lista: T[] = []
  for (const item of valor) {
    const lido = ehObjeto(item) ? ler(item) : null
    if (lido && !ids.has(lido.id)) {
      ids.add(lido.id)
      lista.push(lido)
    }
  }
  return lista
}

function lerLancamento(item: Bruto): Lancamento | null {
  const { id, descricao, valor, tipo, categoria, forma, data } = item
  if (
    !ehTexto(id, 64) ||
    !ehTexto(descricao, 80) ||
    !ehValor(valor) ||
    !ehTipo(tipo) ||
    !ehCategoria(categoria) ||
    !ehForma(forma) ||
    !ehData(data)
  ) {
    return null
  }
  return { id, descricao, valor, tipo, categoria, forma, data }
}

function lerCompra(item: Bruto): CompraCartao | null {
  const { id, descricao, categoria, total, parcelas, data } = item
  if (
    !ehTexto(id, 64) ||
    !ehTexto(descricao, 80) ||
    !ehCategoria(categoria) ||
    !ehValor(total) ||
    !ehInteiro(parcelas, 1, MAXIMO_PARCELAS) ||
    total < parcelas ||
    !ehData(data)
  ) {
    return null
  }
  return { id, descricao, categoria, total, parcelas, data }
}

function lerConta(item: Bruto): ContaDoMes | null {
  const { id, nome, valor, dia, categoria, idLancamento } = item
  if (
    !ehTexto(id, 64) ||
    !ehTexto(nome, 60) ||
    !ehValor(valor) ||
    !ehInteiro(dia, 1, 31) ||
    !ehCategoria(categoria)
  ) {
    return null
  }
  const conta: ContaDoMes = { id, nome, valor, dia, categoria }
  if (ehTexto(idLancamento, 64)) {
    conta.idLancamento = idLancamento
  }
  return conta
}

function lerMeta(item: Bruto): Meta | null {
  const { id, nome, alvo, guardado } = item
  if (
    !ehTexto(id, 64) ||
    !ehTexto(nome, 60) ||
    !ehValor(alvo) ||
    !ehInteiro(guardado, 0, VALOR_MAXIMO)
  ) {
    return null
  }
  return { id, nome, alvo, guardado }
}

function lerLimites(valor: unknown) {
  const limites: DadosFluxo['limites'] = {}
  if (!ehObjeto(valor)) {
    return limites
  }
  for (const categoria of CATEGORIAS) {
    const limite = valor[categoria]
    if (ehValor(limite)) {
      limites[categoria] = limite
    }
  }
  return limites
}

function lerCartao(valor: unknown): ConfigCartao {
  const cartao = ehObjeto(valor) ? valor : {}
  return {
    fechamento: ehInteiro(cartao.fechamento, 1, 31) ? cartao.fechamento : CARTAO_PADRAO.fechamento,
    vencimento: ehInteiro(cartao.vencimento, 1, 31) ? cartao.vencimento : CARTAO_PADRAO.vencimento,
  }
}

export function validarDados(bruto: unknown): DadosFluxo | null {
  if (!ehObjeto(bruto) || bruto.versao !== 1) {
    return null
  }
  return {
    versao: 1,
    nome: typeof bruto.nome === 'string' ? Array.from(bruto.nome.trim()).slice(0, 40).join('') : '',
    exemplo: bruto.exemplo === true,
    lancamentos: lerLista(bruto.lancamentos, lerLancamento),
    compras: lerLista(bruto.compras, lerCompra),
    contas: lerLista(bruto.contas, lerConta),
    metas: lerLista(bruto.metas, lerMeta),
    limites: lerLimites(bruto.limites),
    faturasPagas: Array.isArray(bruto.faturasPagas)
      ? [...new Set(bruto.faturasPagas.filter(ehMes))]
      : [],
    cartao: lerCartao(bruto.cartao),
  }
}

function armazenamentoDoNavegador(): Armazenamento | undefined {
  try {
    return globalThis.localStorage ?? undefined
  } catch {
    return undefined
  }
}

function interpretar(texto: string) {
  try {
    return validarDados(JSON.parse(texto))
  } catch {
    return null
  }
}

function gravar(armazenamento: Armazenamento, chave: string, texto: string) {
  try {
    armazenamento.setItem(chave, texto)
    return true
  } catch {
    return false
  }
}

export function carregarDados(armazenamento = armazenamentoDoNavegador()): Carregamento {
  if (!armazenamento) {
    return { dados: dadosVazios(), podeSalvar: false }
  }
  let salvo: string | null
  try {
    salvo = armazenamento.getItem(CHAVE_DADOS)
  } catch {
    return { dados: dadosVazios(), podeSalvar: false }
  }
  if (salvo === null) {
    return { dados: dadosVazios(), podeSalvar: true }
  }
  const dados = interpretar(salvo)
  if (dados && JSON.stringify(dados) === salvo) {
    return { dados, podeSalvar: true }
  }
  return {
    dados: dados ?? dadosVazios(),
    podeSalvar: gravar(armazenamento, CHAVE_COPIA, salvo),
  }
}

export function salvarDados(dados: DadosFluxo, armazenamento = armazenamentoDoNavegador()) {
  const limpos = validarDados(dados)
  if (!armazenamento || !limpos) {
    return false
  }
  return gravar(armazenamento, CHAVE_DADOS, JSON.stringify(limpos))
}