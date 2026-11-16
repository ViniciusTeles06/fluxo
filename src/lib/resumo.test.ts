import { describe, expect, it } from 'vitest'
import type { DadosFluxo } from '../tipos'
import { dadosVazios } from './armazenamento'
import { criarSorteio, gerarExemplo } from './exemplo'
import { resumirMes } from './resumo'

const hoje = new Date(2026, 10, 10)

function dadosDeTeste(): DadosFluxo {
  return {
    ...dadosVazios(),
    nome: 'Teste',
    lancamentos: [
      { id: 'l1', descricao: 'Salário', valor: 500000, tipo: 'entrada', categoria: 'Renda', forma: 'pix', data: '2026-11-05' },
      { id: 'l2', descricao: 'Mercado', valor: 30000, tipo: 'saida', categoria: 'Mercado', forma: 'pix', data: '2026-11-06' },
      { id: 'l3', descricao: 'Aluguel', valor: 120000, tipo: 'saida', categoria: 'Moradia', forma: 'pix', data: '2026-11-10' },
      { id: 'l4', descricao: 'Do mês passado', valor: 99900, tipo: 'saida', categoria: 'Lazer', forma: 'pix', data: '2026-10-30' },
      { id: 'l5', descricao: 'Futuro', valor: 1000, tipo: 'saida', categoria: 'Lazer', forma: 'pix', data: '2026-11-20' },
    ],
    contas: [
      { id: 'k1', nome: 'Aluguel', valor: 120000, dia: 10, categoria: 'Moradia', idLancamento: 'l3' },
      { id: 'k2', nome: 'Internet', valor: 10000, dia: 20, categoria: 'Moradia' },
    ],
    compras: [{ id: 'c1', descricao: 'Notebook', categoria: 'Compras', total: 300000, parcelas: 10, data: '2026-09-14' }],
    limites: { Mercado: 25000 },
  }
}

describe('resumo do mês', () => {
  it('conta só o que é deste mês e já aconteceu', () => {
    const resumo = resumirMes(dadosDeTeste(), hoje)
    expect(resumo.entradas).toBe(500000)
    expect(resumo.saidas).toBe(150000)
  })

  it('desconta a fatura e as contas que ainda vão vencer', () => {
    const resumo = resumirMes(dadosDeTeste(), hoje)
    expect(resumo.faturaDoMes).toBe(30000)
    expect(resumo.contasPendentes).toBe(10000)
    expect(resumo.livre).toBe(500000 - 150000 - 30000 - 10000)
  })

  it('divide o que sobra pelos dias que faltam, contando hoje', () => {
    const resumo = resumirMes(dadosDeTeste(), hoje)
    expect(resumo.diasRestantes).toBe(21)
    expect(resumo.porDia).toBe(Math.floor(310000 / 21))
  })

  it('não mostra valor negativo por dia quando o mês está no vermelho', () => {
    const dados = dadosDeTeste()
    dados.lancamentos[0].valor = 1000
    const resumo = resumirMes(dados, hoje)
    expect(resumo.livre).toBeLessThan(0)
    expect(resumo.porDia).toBe(0)
  })

  it('monta o saldo dia a dia até hoje', () => {
    const resumo = resumirMes(dadosDeTeste(), hoje)
    expect(resumo.saldoPorDia).toHaveLength(10)
    expect(resumo.saldoPorDia[3]).toBe(0)
    expect(resumo.saldoPorDia[4]).toBe(500000)
    expect(resumo.saldoPorDia[9]).toBe(350000)
  })

  it('ordena as categorias pelo gasto e traz o limite', () => {
    const resumo = resumirMes(dadosDeTeste(), hoje)
    expect(resumo.categorias[0]).toEqual({ categoria: 'Moradia', gasto: 120000, limite: undefined })
    expect(resumo.categorias.find((item) => item.categoria === 'Mercado')).toEqual({ categoria: 'Mercado', gasto: 30000, limite: 25000 })
  })

  it('lista as contas que faltam pagar com os dias até o vencimento', () => {
    const resumo = resumirMes(dadosDeTeste(), hoje)
    expect(resumo.proximasContas).toEqual([
      { id: 'k2', nome: 'Internet', valor: 10000, vencimento: '2026-11-20', diasAte: 10 },
    ])
  })

  it('mostra a fatura que está aberta agora', () => {
    const resumo = resumirMes(dadosDeTeste(), hoje)
    expect(resumo.faturaAberta.mes).toBe('2026-12')
    expect(resumo.faturaAberta.total).toBe(30000)
    expect(resumo.faturaAberta.vencimento).toBe('2026-12-05')
  })

  it('não quebra sem nenhum dado', () => {
    const resumo = resumirMes(dadosVazios(), hoje)
    expect(resumo.porDia).toBe(0)
    expect(resumo.categorias).toEqual([])
    expect(resumo.saldoPorDia.every((valor) => valor === 0)).toBe(true)
  })

  it('funciona com os dados de exemplo em vários dias do mês', () => {
    for (const dia of [1, 15, 28, 30]) {
      const agora = new Date(2026, 10, dia)
      const resumo = resumirMes(gerarExemplo(agora, criarSorteio(dia)), agora)
      expect(resumo.saldoPorDia).toHaveLength(dia)
      expect(resumo.porDia).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(resumo.porDia)).toBe(true)
    }
  })
})