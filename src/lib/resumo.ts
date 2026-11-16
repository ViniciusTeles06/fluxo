import type { Categoria, DadosFluxo, Lancamento } from '../tipos'
import { mesDaPrimeiraFatura, totalDaFatura } from './cartao'
import { chaveDoMes, dataNoMes, diaDaData, diasNoMes, mesDaData, paraDataISO } from './datas'

export interface GastoCategoria {
  categoria: Categoria
  gasto: number
  limite?: number
}

export interface ContaPendente {
  id: string
  nome: string
  valor: number
  vencimento: string
  diasAte: number
}

export interface ResumoDoMes {
  mes: string
  hoje: string
  entradas: number
  saidas: number
  faturaDoMes: number
  faturaDoMesPaga: boolean
  contasPendentes: number
  livre: number
  diasRestantes: number
  porDia: number
  saldoPorDia: number[]
  categorias: GastoCategoria[]
  proximasContas: ContaPendente[]
  faturaAberta: { mes: string; total: number; vencimento: string }
  ultimos: Lancamento[]
}

function diasEntre(de: string, ate: string) {
  const [a1, m1, d1] = de.split('-').map(Number)
  const [a2, m2, d2] = ate.split('-').map(Number)
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000)
}

export function resumirMes(dados: DadosFluxo, agora: Date): ResumoDoMes {
  const hoje = paraDataISO(agora)
  const mes = chaveDoMes(agora)
  const dia = diaDaData(hoje)
  const totalDias = diasNoMes(mes)
  const doMes = dados.lancamentos.filter((item) => mesDaData(item.data) === mes && item.data <= hoje)

  const entradas = doMes.filter((item) => item.tipo === 'entrada').reduce((soma, item) => soma + item.valor, 0)
  const saidas = doMes.filter((item) => item.tipo === 'saida').reduce((soma, item) => soma + item.valor, 0)
  const faturaDoMes = totalDaFatura(dados.compras, mes, dados.cartao)

  const pendentes = dados.contas
    .filter((conta) => !conta.idLancamento)
    .map((conta) => {
      const vencimento = dataNoMes(mes, conta.dia)
      return { id: conta.id, nome: conta.nome, valor: conta.valor, vencimento, diasAte: diasEntre(hoje, vencimento) }
    })
  const contasPendentes = pendentes.reduce((soma, conta) => soma + conta.valor, 0)

  const livre = entradas - saidas - faturaDoMes - contasPendentes
  const diasRestantes = totalDias - dia + 1
  const porDia = livre > 0 ? Math.floor(livre / diasRestantes) : 0

  const saldoPorDia: number[] = []
  let acumulado = 0
  for (let d = 1; d <= dia; d++) {
    const data = dataNoMes(mes, d)
    for (const item of doMes) {
      if (item.data === data) {
        acumulado += item.tipo === 'entrada' ? item.valor : -item.valor
      }
    }
    saldoPorDia.push(acumulado)
  }

  const gastos = new Map<Categoria, number>()
  for (const item of doMes) {
    if (item.tipo === 'saida') {
      gastos.set(item.categoria, (gastos.get(item.categoria) ?? 0) + item.valor)
    }
  }
  for (const compra of dados.compras) {
    if (mesDaData(compra.data) === mes && compra.data <= hoje) {
      const parcela = Math.floor(compra.total / compra.parcelas)
      gastos.set(compra.categoria, (gastos.get(compra.categoria) ?? 0) + parcela)
    }
  }
  const categorias = [...gastos.entries()]
    .map(([categoria, gasto]) => ({ categoria, gasto, limite: dados.limites[categoria] }))
    .sort((a, b) => b.gasto - a.gasto)

  const mesFatura = mesDaPrimeiraFatura(hoje, dados.cartao)
  const faturaAberta = {
    mes: mesFatura,
    total: totalDaFatura(dados.compras, mesFatura, dados.cartao),
    vencimento: dataNoMes(mesFatura, dados.cartao.vencimento),
  }

  const ultimos = [...dados.lancamentos]
    .filter((item) => item.data <= hoje)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5)

  return {
    mes,
    hoje,
    entradas,
    saidas,
    faturaDoMes,
    faturaDoMesPaga: dados.faturasPagas.includes(mes),
    contasPendentes,
    livre,
    diasRestantes,
    porDia,
    saldoPorDia,
    categorias,
    proximasContas: pendentes.sort((a, b) => a.vencimento.localeCompare(b.vencimento)),
    faturaAberta,
    ultimos,
  }
}