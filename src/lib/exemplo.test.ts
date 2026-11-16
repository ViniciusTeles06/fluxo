import { describe, expect, it } from 'vitest'
import { validarDados } from './armazenamento'
import { totalDaFatura } from './cartao'
import { mesDaData, somarMeses } from './datas'
import { NOMES_DE_EXEMPLO, criarSorteio, gerarExemplo } from './exemplo'

const hoje = new Date(2026, 10, 10)

describe('dados de exemplo', () => {
  it('gera sempre os mesmos dados com a mesma semente', () => {
    expect(gerarExemplo(hoje, criarSorteio(7))).toEqual(gerarExemplo(hoje, criarSorteio(7)))
    expect(gerarExemplo(hoje, criarSorteio(7))).not.toEqual(gerarExemplo(hoje, criarSorteio(8)))
  })

  it('passa na validação do armazenamento sem perder nada', () => {
    for (let semente = 1; semente <= 30; semente++) {
      const dados = gerarExemplo(hoje, criarSorteio(semente))
      expect(validarDados(JSON.parse(JSON.stringify(dados)))).toEqual(dados)
    }
  })

  it('marca como exemplo e usa um nome da lista', () => {
    const dados = gerarExemplo(hoje, criarSorteio(3))
    expect(dados.exemplo).toBe(true)
    expect(NOMES_DE_EXEMPLO).toContain(dados.nome)
  })

  it('todos os ids começam com exemplo e não se repetem', () => {
    const dados = gerarExemplo(hoje, criarSorteio(21))
    const ids = [...dados.lancamentos, ...dados.compras, ...dados.contas, ...dados.metas].map((item) => item.id)
    expect(ids.every((id) => id.startsWith('exemplo-'))).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('não quebra com um sorteio fora do intervalo nem aceita data inválida', () => {
    for (const valor of [1, -1, Number.NaN]) {
      const dados = gerarExemplo(hoje, () => valor)
      expect(validarDados(JSON.parse(JSON.stringify(dados)))).toEqual(dados)
    }
    expect(() => gerarExemplo(new Date('x'))).toThrow()
  })

  it('cobre os últimos três meses sem nenhuma data no futuro', () => {
    const dados = gerarExemplo(hoje, criarSorteio(5))
    const datas = [...dados.lancamentos, ...dados.compras].map((item) => item.data)
    expect(datas.every((data) => data <= '2026-11-10')).toBe(true)
    expect(new Set(datas.map(mesDaData))).toEqual(new Set(['2026-09', '2026-10', '2026-11']))
  })

  it('recebe o salário todo mês em que o dia 5 já passou', () => {
    const dados = gerarExemplo(hoje, criarSorteio(9))
    const salarios = dados.lancamentos.filter((item) => item.descricao === 'Salário')
    expect(salarios.map((item) => item.data).sort()).toEqual(['2026-09-05', '2026-10-05', '2026-11-05'])
    const noInicioDoMes = gerarExemplo(new Date(2026, 10, 2), criarSorteio(9))
    expect(noInicioDoMes.lancamentos.some((item) => item.data === '2026-11-05')).toBe(false)
  })

  it('liga as contas já pagas neste mês ao lançamento do pagamento', () => {
    const dados = gerarExemplo(hoje, criarSorteio(11))
    const aluguel = dados.contas.find((conta) => conta.nome === 'Aluguel')
    const internet = dados.contas.find((conta) => conta.nome === 'Internet')
    expect(dados.lancamentos.find((item) => item.id === aluguel?.idLancamento)?.data).toBe('2026-11-10')
    expect(internet?.idLancamento).toBeUndefined()
  })

  it('os meses fechados não gastam mais do que entrou', () => {
    for (let semente = 1; semente <= 200; semente++) {
      const dados = gerarExemplo(hoje, criarSorteio(semente))
      for (const mes of ['2026-09', '2026-10']) {
        const doMes = dados.lancamentos.filter((item) => mesDaData(item.data) === mes)
        const entradas = doMes.filter((item) => item.tipo === 'entrada').reduce((soma, item) => soma + item.valor, 0)
        const saidas = doMes.filter((item) => item.tipo === 'saida').reduce((soma, item) => soma + item.valor, 0)
        const fatura = totalDaFatura(dados.compras, somarMeses(mes, 1), dados.cartao)
        expect(saidas + fatura).toBeLessThan(entradas)
      }
    }
  })

  it('tem fatura no cartão e marca como paga a que já venceu', () => {
    const dados = gerarExemplo(hoje, criarSorteio(13))
    expect(totalDaFatura(dados.compras, '2026-12', dados.cartao)).toBeGreaterThan(0)
    expect(dados.faturasPagas).toEqual(['2026-10', '2026-11'])
  })

  it('funciona na virada do ano e em ano bissexto', () => {
    for (const dia of [new Date(2027, 0, 1), new Date(2028, 1, 29), new Date(2026, 11, 31)]) {
      const dados = gerarExemplo(dia, criarSorteio(1))
      expect(validarDados(JSON.parse(JSON.stringify(dados)))).toEqual(dados)
    }
  })
})