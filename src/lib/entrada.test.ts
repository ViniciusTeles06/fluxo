import { describe, expect, it } from 'vitest'
import { dadosVazios } from './armazenamento'
import { comecarDoZero, limparNome, precisaDeEntrada, primeiroNome } from './entrada'
import { criarSorteio, gerarExemplo } from './exemplo'

describe('entrada', () => {
  it('mostra a entrada só para quem ainda não começou', () => {
    expect(precisaDeEntrada(dadosVazios())).toBe(true)
    expect(precisaDeEntrada({ ...dadosVazios(), nome: 'Vinícius' })).toBe(false)
    expect(precisaDeEntrada(gerarExemplo(new Date(2026, 10, 10), criarSorteio(1)))).toBe(false)
  })

  it('limpa o nome antes de guardar', () => {
    expect(limparNome('  Ana   Clara  ')).toBe('Ana Clara')
    expect(limparNome('a'.repeat(60))).toHaveLength(40)
    expect(Array.from(limparNome('😀'.repeat(50)))).toHaveLength(40)
  })

  it('começa do zero com o nome e sem nenhum lançamento', () => {
    const dados = comecarDoZero(' Vinícius ')
    expect(dados?.nome).toBe('Vinícius')
    expect(dados?.exemplo).toBe(false)
    expect(dados?.lancamentos).toEqual([])
    expect(comecarDoZero('   ')).toBeNull()
  })

  it('pega só o primeiro nome para o cumprimento', () => {
    expect(primeiroNome('Vinícius Teles')).toBe('Vinícius')
    expect(primeiroNome('')).toBe('')
  })
})