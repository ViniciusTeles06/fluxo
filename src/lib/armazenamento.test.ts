import { describe, expect, it } from 'vitest'
import type { DadosFluxo } from '../tipos'
import {
  CARTAO_PADRAO,
  CHAVE_COPIA,
  CHAVE_DADOS,
  carregarDados,
  dadosVazios,
  salvarDados,
  validarDados,
  type Armazenamento,
} from './armazenamento'

function memoria(inicial: Record<string, string> = {}) {
  const itens = new Map(Object.entries(inicial))
  return {
    itens,
    getItem: (chave: string) => itens.get(chave) ?? null,
    setItem: (chave: string, valor: string) => {
      itens.set(chave, valor)
    },
  }
}

const quebrado: Armazenamento = {
  getItem: () => {
    throw new Error('bloqueado')
  },
  setItem: () => {
    throw new Error('cheio')
  },
}

const dadosCompletos: DadosFluxo = {
  versao: 1,
  nome: 'Marina',
  exemplo: false,
  lancamentos: [
    {
      id: 'l1',
      descricao: 'Salário',
      valor: 412350,
      tipo: 'entrada',
      categoria: 'Renda',
      forma: 'pix',
      data: '2026-11-05',
    },
  ],
  compras: [
    {
      id: 'c1',
      descricao: 'Fone',
      categoria: 'Compras',
      total: 28990,
      parcelas: 3,
      data: '2026-11-08',
    },
  ],
  contas: [
    { id: 'k1', nome: 'Aluguel', valor: 135000, dia: 10, categoria: 'Moradia', idLancamento: 'l9' },
  ],
  metas: [{ id: 'm1', nome: 'Reserva', alvo: 600000, guardado: 87340 }],
  limites: { Mercado: 90000 },
  faturasPagas: ['2026-10'],
  cartao: { fechamento: 3, vencimento: 10 },
}

describe('armazenamento', () => {
  it('começa vazio quando não há nada salvo', () => {
    expect(carregarDados(memoria())).toEqual({ dados: dadosVazios(), podeSalvar: true })
  })

  it('salva e carrega os mesmos dados sem criar cópia', () => {
    const armazenamento = memoria()
    expect(salvarDados(dadosCompletos, armazenamento)).toBe(true)
    expect(carregarDados(armazenamento)).toEqual({ dados: dadosCompletos, podeSalvar: true })
    expect(armazenamento.itens.has(CHAVE_COPIA)).toBe(false)
  })

  it('salva na ordem certa mesmo com os campos em outra ordem', () => {
    const armazenamento = memoria()
    const conta = { dia: 5, valor: 4990, nome: 'Internet', categoria: 'Moradia' as const, id: 'k2' }
    salvarDados({ ...dadosCompletos, contas: [conta] }, armazenamento)
    expect(carregarDados(armazenamento).dados.contas).toEqual([conta])
    expect(armazenamento.itens.has(CHAVE_COPIA)).toBe(false)
  })

  it('guarda uma cópia quando o que está salvo não pode ser lido', () => {
    const armazenamento = memoria({ [CHAVE_DADOS]: '{quebrado' })
    expect(carregarDados(armazenamento)).toEqual({ dados: dadosVazios(), podeSalvar: true })
    expect(armazenamento.itens.get(CHAVE_COPIA)).toBe('{quebrado')
  })

  it('não aceita uma versão desconhecida', () => {
    const salvo = JSON.stringify({ ...dadosCompletos, versao: 2 })
    const armazenamento = memoria({ [CHAVE_DADOS]: salvo })
    expect(carregarDados(armazenamento).dados).toEqual(dadosVazios())
    expect(armazenamento.itens.get(CHAVE_COPIA)).toBe(salvo)
  })

  it('guarda uma cópia antes de descartar um item inválido', () => {
    const salvo = JSON.stringify({
      ...dadosCompletos,
      metas: [...dadosCompletos.metas, { id: 'm2', nome: 'Viagem', alvo: -1, guardado: 0 }],
    })
    const armazenamento = memoria({ [CHAVE_DADOS]: salvo })
    const { dados, podeSalvar } = carregarDados(armazenamento)
    expect(dados.metas).toEqual(dadosCompletos.metas)
    expect(podeSalvar).toBe(true)
    expect(armazenamento.itens.get(CHAVE_COPIA)).toBe(salvo)
  })

  it('não deixa salvar por cima quando a cópia não pôde ser feita', () => {
    const armazenamento = {
      getItem: () => '{quebrado',
      setItem: () => {
        throw new Error('cheio')
      },
    }
    expect(carregarDados(armazenamento)).toEqual({ dados: dadosVazios(), podeSalvar: false })
  })

  it('descarta só os itens inválidos e mantém o resto', () => {
    const dados = validarDados({
      ...dadosCompletos,
      lancamentos: [
        ...dadosCompletos.lancamentos,
        { ...dadosCompletos.lancamentos[0], id: 'l2', valor: -500 },
        { ...dadosCompletos.lancamentos[0], id: 'l3', data: '2026-02-31' },
        { ...dadosCompletos.lancamentos[0], id: 'l4', categoria: 'Viagem' },
        'texto solto',
        null,
      ],
      compras: [
        ...dadosCompletos.compras,
        { ...dadosCompletos.compras[0], id: 'c2', parcelas: 0 },
        { ...dadosCompletos.compras[0], id: 'c3', parcelas: 1000 },
        { ...dadosCompletos.compras[0], id: 'c4', total: 2, parcelas: 3 },
      ],
      contas: [...dadosCompletos.contas, { ...dadosCompletos.contas[0], id: 'k2', dia: 40 }],
      metas: [...dadosCompletos.metas, { ...dadosCompletos.metas[0], id: 'm2', guardado: -1 }],
    })
    expect(dados?.lancamentos.map((item) => item.id)).toEqual(['l1'])
    expect(dados?.compras.map((item) => item.id)).toEqual(['c1'])
    expect(dados?.contas.map((item) => item.id)).toEqual(['k1'])
    expect(dados?.metas.map((item) => item.id)).toEqual(['m1'])
  })

  it('ignora ids repetidos e campos que não fazem parte do app', () => {
    const dados = validarDados({
      ...dadosCompletos,
      lancamentos: [
        { ...dadosCompletos.lancamentos[0], extra: '<script>' },
        { ...dadosCompletos.lancamentos[0], descricao: 'Outro' },
      ],
    })
    expect(dados?.lancamentos).toEqual(dadosCompletos.lancamentos)
  })

  it('volta para o padrão quando o cartão está com dias inválidos', () => {
    const dados = validarDados({ ...dadosCompletos, cartao: { fechamento: 40, vencimento: null } })
    expect(dados?.cartao).toEqual(CARTAO_PADRAO)
    expect(validarDados({ ...dadosCompletos, cartao: 'x' })?.cartao).toEqual(CARTAO_PADRAO)
  })

  it('corta o nome em 40 caracteres sem quebrar emojis', () => {
    const nome = `${'a'.repeat(39)}😀😀`
    expect(validarDados({ ...dadosCompletos, nome })?.nome).toBe(`${'a'.repeat(39)}😀`)
  })

  it('mantém só limites e faturas válidos', () => {
    const dados = validarDados({
      ...dadosCompletos,
      limites: { Mercado: 90000, Lazer: -1, Viagem: 5000 },
      faturasPagas: ['2026-10', '2026-10', '2026-13', 7],
    })
    expect(dados?.limites).toEqual({ Mercado: 90000 })
    expect(dados?.faturasPagas).toEqual(['2026-10'])
  })

  it('não quebra quando o navegador bloqueia o armazenamento', () => {
    expect(carregarDados(quebrado)).toEqual({ dados: dadosVazios(), podeSalvar: false })
    expect(salvarDados(dadosCompletos, quebrado)).toBe(false)
  })
})