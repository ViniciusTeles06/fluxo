import { describe, expect, it } from 'vitest'
import { lerPreferencia, raioDaTransicao, resolverTema } from './tema'

describe('tema', () => {
  it('aceita só claro, escuro ou volta para o do sistema', () => {
    expect(lerPreferencia('claro')).toBe('claro')
    expect(lerPreferencia('escuro')).toBe('escuro')
    expect(lerPreferencia(null)).toBe('sistema')
    expect(lerPreferencia('roxo')).toBe('sistema')
  })

  it('segue o sistema quando não há escolha', () => {
    expect(resolverTema('sistema', true)).toBe('escuro')
    expect(resolverTema('sistema', false)).toBe('claro')
    expect(resolverTema('claro', true)).toBe('claro')
  })

  it('o círculo da transição alcança o canto mais distante da tela', () => {
    expect(raioDaTransicao(0, 0, 300, 400)).toBe(500)
    expect(raioDaTransicao(300, 400, 300, 400)).toBe(500)
    expect(raioDaTransicao(150, 200, 300, 400)).toBe(250)
  })
})