import type {
  Categoria,
  CompraCartao,
  ContaDoMes,
  DadosFluxo,
  FormaAVista,
  Lancamento,
} from '../tipos'
import { CARTAO_PADRAO } from './armazenamento'
import { chaveDoMes, dataNoMes, diasNoMes, paraDataISO, somarMeses } from './datas'

export const NOMES_DE_EXEMPLO = [
  'Marina',
  'Rafael',
  'Beatriz',
  'Lucas',
  'Camila',
  'Thiago',
  'Larissa',
  'Gabriel',
  'Juliana',
  'Felipe',
  'Amanda',
  'Bruno',
  'Letícia',
  'Diego',
  'Fernanda',
  'Mateus',
]

interface GastoDoDia {
  descricao: string
  categoria: Categoria
  minimo: number
  maximo: number
  chance: number
  formas: FormaAVista[]
  dias: 'uteis' | 'fimDeSemana' | 'todos'
}

const GASTOS_DO_DIA: GastoDoDia[] = [
  { descricao: 'Padaria', categoria: 'Alimentação', minimo: 850, maximo: 2690, chance: 0.3, formas: ['debito', 'pix'], dias: 'todos' },
  { descricao: 'Almoço', categoria: 'Alimentação', minimo: 2190, maximo: 3990, chance: 0.2, formas: ['debito', 'pix'], dias: 'uteis' },
  { descricao: 'Ônibus', categoria: 'Transporte', minimo: 450, maximo: 450, chance: 0.35, formas: ['debito'], dias: 'uteis' },
  { descricao: 'Uber', categoria: 'Transporte', minimo: 1180, maximo: 3460, chance: 0.12, formas: ['pix'], dias: 'todos' },
  { descricao: 'Farmácia', categoria: 'Saúde', minimo: 1790, maximo: 8930, chance: 0.04, formas: ['debito', 'pix'], dias: 'todos' },
  { descricao: 'Barzinho', categoria: 'Lazer', minimo: 4800, maximo: 12750, chance: 0.3, formas: ['pix'], dias: 'fimDeSemana' },
  { descricao: 'Cinema', categoria: 'Lazer', minimo: 2800, maximo: 5600, chance: 0.12, formas: ['debito'], dias: 'fimDeSemana' },
]

const COMPRAS_SOLTAS = [
  { descricao: 'iFood', categoria: 'Alimentação' as const, minimo: 3290, maximo: 7890 },
  { descricao: 'Shopee', categoria: 'Compras' as const, minimo: 2490, maximo: 13990 },
  { descricao: 'Posto de gasolina', categoria: 'Transporte' as const, minimo: 7000, maximo: 16000 },
]

export function criarSorteio(semente: number) {
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let mistura = estado
    mistura = Math.imul(mistura ^ (mistura >>> 15), mistura | 1)
    mistura ^= mistura + Math.imul(mistura ^ (mistura >>> 7), mistura | 61)
    return ((mistura ^ (mistura >>> 14)) >>> 0) / 4294967296
  }
}

export function gerarExemplo(hoje: Date, sorteio: () => number = Math.random): DadosFluxo {
  if (Number.isNaN(hoje.getTime())) {
    throw new Error('Data inválida para gerar o exemplo.')
  }
  const sortear = () => {
    const numero = sorteio()
    return numero >= 0 && numero < 1 ? numero : 0
  }
  const entre = (minimo: number, maximo: number) =>
    minimo + Math.floor(sortear() * (maximo - minimo + 1))
  const escolher = <T>(lista: readonly T[]) => lista[Math.floor(sortear() * lista.length)]

  const hojeISO = paraDataISO(hoje)
  const mesAtual = chaveDoMes(hoje)
  const meses = [somarMeses(mesAtual, -2), somarMeses(mesAtual, -1), mesAtual]

  let contador = 0
  const novoId = (prefixo: string) => `exemplo-${prefixo}-${++contador}`

  const lancamentos: Lancamento[] = []
  const compras: CompraCartao[] = []
  const lancar = (dados: Omit<Lancamento, 'id'>) => {
    const lancamento = { id: novoId('l'), ...dados }
    lancamentos.push(lancamento)
    return lancamento
  }
  const comprar = (dados: Omit<CompraCartao, 'id'>) => {
    if (dados.data <= hojeISO) {
      compras.push({ id: novoId('c'), ...dados })
    }
  }

  const salario = entre(520000, 590000)
  const energia = entre(17800, 25900)
  const contas: ContaDoMes[] = [
    { id: novoId('k'), nome: 'Aluguel', valor: 135000, dia: 10, categoria: 'Moradia' },
    { id: novoId('k'), nome: 'Energia', valor: energia, dia: 15, categoria: 'Moradia' },
    { id: novoId('k'), nome: 'Internet', valor: 9990, dia: 20, categoria: 'Moradia' },
    { id: novoId('k'), nome: 'Celular', valor: 4999, dia: 12, categoria: 'Moradia' },
    { id: novoId('k'), nome: 'Curso de inglês', valor: 18900, dia: 7, categoria: 'Educação' },
  ]

  for (const mes of meses) {
    const salarioNoDia = dataNoMes(mes, 5)
    if (salarioNoDia <= hojeISO) {
      lancar({ descricao: 'Salário', valor: salario, tipo: 'entrada', categoria: 'Renda', forma: 'pix', data: salarioNoDia })
    }

    for (const conta of contas) {
      const data = dataNoMes(mes, conta.dia)
      if (data > hojeISO) {
        continue
      }
      const valor = conta.nome === 'Energia' && mes !== mesAtual ? entre(16900, 26900) : conta.valor
      const pago = lancar({ descricao: conta.nome, valor, tipo: 'saida', categoria: conta.categoria, forma: 'pix', data })
      if (mes === mesAtual) {
        conta.idLancamento = pago.id
      }
    }

    comprar({ descricao: 'Spotify', categoria: 'Assinaturas', total: 2190, parcelas: 1, data: dataNoMes(mes, 8) })
    comprar({ descricao: 'Netflix', categoria: 'Assinaturas', total: 4490, parcelas: 1, data: dataNoMes(mes, 16) })

    for (let dia = 1; dia <= diasNoMes(mes); dia++) {
      const data = dataNoMes(mes, dia)
      if (data > hojeISO) {
        break
      }
      const semana = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)) - 1, dia).getDay()
      const fimDeSemana = semana === 0 || semana === 6

      if (semana === 6) {
        lancar({ descricao: 'Supermercado', valor: entre(12900, 27900), tipo: 'saida', categoria: 'Mercado', forma: escolher(['debito', 'pix'] as const), data })
      }
      if (semana === 3 && sortear() < 0.5) {
        lancar({ descricao: 'Hortifruti', valor: entre(2380, 5970), tipo: 'saida', categoria: 'Mercado', forma: 'debito', data })
      }

      for (const gasto of GASTOS_DO_DIA) {
        const diaCerto =
          gasto.dias === 'todos' || (gasto.dias === 'uteis' ? !fimDeSemana : fimDeSemana)
        if (diaCerto && sortear() < gasto.chance) {
          lancar({
            descricao: gasto.descricao,
            valor: entre(gasto.minimo, gasto.maximo),
            tipo: 'saida',
            categoria: gasto.categoria,
            forma: escolher(gasto.formas),
            data,
          })
        }
      }

      if (sortear() < 0.07) {
        const solta = escolher(COMPRAS_SOLTAS)
        comprar({ descricao: solta.descricao, categoria: solta.categoria, total: entre(solta.minimo, solta.maximo), parcelas: 1, data })
      }
    }
  }

  const freela = dataNoMes(meses[1], 18)
  lancar({ descricao: 'Freela de site', valor: entre(60000, 140000), tipo: 'entrada', categoria: 'Renda', forma: 'pix', data: freela })

  comprar({ descricao: 'Notebook', categoria: 'Compras', total: 349900, parcelas: 10, data: dataNoMes(meses[0], 14) })
  comprar({ descricao: 'Tênis de corrida', categoria: 'Compras', total: 39990, parcelas: 3, data: dataNoMes(meses[1], 21) })

  const cartao = { ...CARTAO_PADRAO }
  const faturasPagas = [somarMeses(mesAtual, -1), mesAtual].filter(
    (mes) => dataNoMes(mes, cartao.vencimento) < hojeISO,
  )

  lancamentos.sort((a, b) => b.data.localeCompare(a.data))
  compras.sort((a, b) => b.data.localeCompare(a.data))

  return {
    versao: 1,
    nome: escolher(NOMES_DE_EXEMPLO),
    exemplo: true,
    lancamentos,
    compras,
    contas,
    metas: [
      { id: novoId('m'), nome: 'Reserva de emergência', alvo: 1000000, guardado: entre(180000, 320000) },
      { id: novoId('m'), nome: 'Viagem de fim de ano', alvo: 450000, guardado: entre(60000, 150000) },
    ],
    limites: { Mercado: 110000, Alimentação: 45000, Lazer: 40000, Transporte: 25000 },
    faturasPagas,
    cartao,
  }
}