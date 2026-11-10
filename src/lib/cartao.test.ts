import { describe, expect, it } from 'vitest'
import type { CompraCartao, ConfigCartao } from '../tipos'
import {
  mesDaPrimeiraFatura,
  parcelamentosAtivos,
  parcelasDaCompra,
  parcelasDaFatura,
  totalDaFatura,
} from './cartao'

const nubankComum: ConfigCartao = { fechamento: 27, vencimento: 5 }
const fechaNoInicio: ConfigCartao = { fechamento: 3, vencimento: 10 }

function compra(dados: Partial<CompraCartao>): CompraCartao {
  return {
    id: 'c1',
    descricao: 'Compra',
    categoria: 'Compras',
    total: 10000,
    parcelas: 1,
    data: '2026-11-10',
    ...dados,
  }
}

describe('cartão de crédito', () => {
  it('compra antes do fechamento vai para a fatura do mês seguinte', () => {
    expect(mesDaPrimeiraFatura('2026-11-10', nubankComum)).toBe('2026-12')
    expect(mesDaPrimeiraFatura('2026-11-26', nubankComum)).toBe('2026-12')
  })

  it('compra no dia do fechamento ou depois pula uma fatura', () => {
    expect(mesDaPrimeiraFatura('2026-11-27', nubankComum)).toBe('2027-01')
    expect(mesDaPrimeiraFatura('2026-11-30', nubankComum)).toBe('2027-01')
  })

  it('quando o vencimento vem depois do fechamento, a fatura vence no mesmo mês', () => {
    expect(mesDaPrimeiraFatura('2026-11-02', fechaNoInicio)).toBe('2026-11')
    expect(mesDaPrimeiraFatura('2026-11-03', fechaNoInicio)).toBe('2026-12')
  })

  it('passa para o ano seguinte em dezembro', () => {
    expect(mesDaPrimeiraFatura('2026-12-26', nubankComum)).toBe('2027-01')
    expect(mesDaPrimeiraFatura('2026-12-27', nubankComum)).toBe('2027-02')
  })

  it('vencimento no mesmo dia do fechamento fica para o mês seguinte', () => {
    const cartao: ConfigCartao = { fechamento: 10, vencimento: 10 }
    expect(mesDaPrimeiraFatura('2026-03-09', cartao)).toBe('2026-04')
    expect(mesDaPrimeiraFatura('2026-03-10', cartao)).toBe('2026-05')
  })

  it('fechamento no dia 31 vira o último dia em meses curtos', () => {
    const cartao: ConfigCartao = { fechamento: 31, vencimento: 8 }
    expect(mesDaPrimeiraFatura('2027-02-27', cartao)).toBe('2027-03')
    expect(mesDaPrimeiraFatura('2027-02-28', cartao)).toBe('2027-04')
  })

  it('divide uma compra parcelada em faturas seguidas', () => {
    const parcelas = parcelasDaCompra(
      compra({ total: 39990, parcelas: 3, data: '2026-11-20' }),
      nubankComum,
    )
    expect(parcelas.map((parcela) => parcela.mesFatura)).toEqual(['2026-12', '2027-01', '2027-02'])
    expect(parcelas.map((parcela) => parcela.valor)).toEqual([13330, 13330, 13330])
    expect(parcelas.map((parcela) => parcela.numero)).toEqual([1, 2, 3])
    expect(parcelas[0].vencimento).toBe('2026-12-05')
  })

  it('ajusta o vencimento em meses curtos', () => {
    const cartao: ConfigCartao = { fechamento: 20, vencimento: 30 }
    const [parcela] = parcelasDaCompra(compra({ data: '2027-02-25' }), cartao)
    expect(parcela.mesFatura).toBe('2027-03')
    const [emFevereiro] = parcelasDaCompra(compra({ data: '2027-02-10' }), cartao)
    expect(emFevereiro.vencimento).toBe('2027-02-28')
  })

  it('soma só as parcelas que caem na fatura pedida', () => {
    const compras = [
      compra({ id: 'notebook', total: 349900, parcelas: 10, data: '2026-08-14' }),
      compra({ id: 'spotify', total: 2190, parcelas: 1, data: '2026-11-03' }),
      compra({ id: 'tenis', total: 39990, parcelas: 3, data: '2026-11-28' }),
    ]
    expect(parcelasDaFatura(compras, '2026-12', nubankComum).map((parcela) => parcela.idCompra)).toEqual([
      'notebook',
      'spotify',
    ])
    expect(totalDaFatura(compras, '2026-12', nubankComum)).toBe(34990 + 2190)
    expect(totalDaFatura(compras, '2027-01', nubankComum)).toBe(34990 + 13330)
  })

  it('a soma de todas as parcelas é sempre o valor da compra', () => {
    const notebook = compra({ total: 349900, parcelas: 10, data: '2026-08-14' })
    const parcelas = parcelasDaCompra(notebook, nubankComum)
    expect(parcelas.reduce((soma, parcela) => soma + parcela.valor, 0)).toBe(349900)
    expect(parcelas.at(-1)?.mesFatura).toBe('2027-06')
  })

  it('lista os parcelamentos ativos com o número da parcela', () => {
    const compras = [
      compra({ id: 'notebook', total: 349900, parcelas: 10, data: '2026-08-14' }),
      compra({ id: 'spotify', total: 2190, parcelas: 1, data: '2026-11-03' }),
    ]
    const ativos = parcelamentosAtivos(compras, '2026-12', nubankComum)
    expect(ativos).toHaveLength(1)
    expect(ativos[0].compra.id).toBe('notebook')
    expect(ativos[0].parcelaAtual).toBe(4)
    expect(parcelamentosAtivos(compras, '2027-07', nubankComum)).toHaveLength(0)
  })
})