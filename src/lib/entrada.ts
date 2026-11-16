import type { DadosFluxo } from '../tipos'
import { dadosVazios } from './armazenamento'

export const TAMANHO_MAXIMO_NOME = 40

export function precisaDeEntrada(dados: DadosFluxo) {
  return !dados.exemplo && dados.nome.trim() === ''
}

export function limparNome(texto: string) {
  return Array.from(texto.trim().replace(/\s+/g, ' ')).slice(0, TAMANHO_MAXIMO_NOME).join('')
}

export function comecarDoZero(nome: string): DadosFluxo | null {
  const limpo = limparNome(nome)
  if (limpo === '') {
    return null
  }
  return { ...dadosVazios(), nome: limpo }
}

export function primeiroNome(nome: string) {
  return nome.trim().split(' ')[0] ?? ''
}