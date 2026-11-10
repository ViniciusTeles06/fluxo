import { describe, expect, it } from 'vitest'
import {
  chaveDoMes,
  dataNoMes,
  diaDaData,
  diasNoMes,
  mesDaData,
  nomeDoMes,
  paraDataISO,
  somarMeses,
} from './datas'

describe('datas', () => {
  it('formata a data local sem trocar de dia por causa do fuso', () => {
    expect(paraDataISO(new Date(2026, 10, 9, 23, 30))).toBe('2026-11-09')
  })

  it('pega o mês e o dia de uma data', () => {
    expect(chaveDoMes(new Date(2026, 0, 31))).toBe('2026-01')
    expect(mesDaData('2026-11-09')).toBe('2026-11')
    expect(diaDaData('2026-11-09')).toBe(9)
  })

  it('soma meses atravessando o ano', () => {
    expect(somarMeses('2026-11', 1)).toBe('2026-12')
    expect(somarMeses('2026-12', 1)).toBe('2027-01')
    expect(somarMeses('2026-01', -1)).toBe('2025-12')
    expect(somarMeses('2026-03', 10)).toBe('2027-01')
  })

  it('conta os dias de cada mês, inclusive fevereiro bissexto', () => {
    expect(diasNoMes('2026-11')).toBe(30)
    expect(diasNoMes('2026-02')).toBe(28)
    expect(diasNoMes('2028-02')).toBe(29)
  })

  it('limita o dia ao último dia do mês', () => {
    expect(dataNoMes('2026-02', 31)).toBe('2026-02-28')
    expect(dataNoMes('2026-11', 5)).toBe('2026-11-05')
  })

  it('dá o nome do mês em português', () => {
    expect(nomeDoMes('2026-03')).toBe('março')
  })

  it('não aceita mês em formato errado', () => {
    expect(() => somarMeses('2026/11', 1)).toThrow()
    expect(() => diasNoMes('2026-13')).toThrow()
    expect(() => nomeDoMes('')).toThrow()
  })

  it('nunca gera um dia fora do mês', () => {
    expect(dataNoMes('2026-04', 0)).toBe('2026-04-01')
    expect(dataNoMes('2026-04', -3)).toBe('2026-04-01')
    expect(dataNoMes('2026-04', 5.7)).toBe('2026-04-05')
  })

  it('ignora a parte quebrada ao somar meses', () => {
    expect(somarMeses('2026-11', 1.5)).toBe('2026-12')
  })
})