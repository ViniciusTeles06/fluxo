import { describe, expect, it } from 'vitest'
import { dividirEmParcelas, formatarReais, lerValor, reaisParaCentavos } from './dinheiro'

describe('dinheiro', () => {
  it('formata centavos em reais', () => {
    expect(formatarReais(123456).replace(/\s/g, ' ')).toBe('R$ 1.234,56')
    expect(formatarReais(5).replace(/\s/g, ' ')).toBe('R$ 0,05')
  })

  it('converte reais em centavos sem erro de arredondamento', () => {
    expect(reaisParaCentavos(0.1 + 0.2)).toBe(30)
    expect(reaisParaCentavos(19.99)).toBe(1999)
  })

  it('entende valores escritos do jeito brasileiro', () => {
    expect(lerValor('45')).toBe(4500)
    expect(lerValor('45,9')).toBe(4590)
    expect(lerValor('1.234,56')).toBe(123456)
    expect(lerValor('1.500')).toBe(150000)
    expect(lerValor('R$ 12,90')).toBe(1290)
    expect(lerValor('1234.56')).toBe(123456)
  })

  it('recusa valores inválidos', () => {
    expect(lerValor('')).toBeNull()
    expect(lerValor('abc')).toBeNull()
    expect(lerValor('0')).toBeNull()
    expect(lerValor('-10')).toBeNull()
    expect(lerValor('12,345')).toBeNull()
    expect(lerValor('99999999999999999999')).toBeNull()
  })

  it('divide em parcelas sem perder centavos', () => {
    expect(dividirEmParcelas(39990, 3)).toEqual([13330, 13330, 13330])
    expect(dividirEmParcelas(10000, 3)).toEqual([3334, 3333, 3333])
    const parcelas = dividirEmParcelas(349900, 10)
    expect(parcelas.reduce((soma, valor) => soma + valor, 0)).toBe(349900)
  })

  it('recusa parcelas impossíveis em vez de perder dinheiro', () => {
    expect(() => dividirEmParcelas(100, 0)).toThrow()
    expect(() => dividirEmParcelas(100, -1)).toThrow()
    expect(() => dividirEmParcelas(100, 2.5)).toThrow()
    expect(() => dividirEmParcelas(1, 3)).toThrow()
    expect(() => dividirEmParcelas(-100, 3)).toThrow()
    expect(dividirEmParcelas(3, 3)).toEqual([1, 1, 1])
  })
})