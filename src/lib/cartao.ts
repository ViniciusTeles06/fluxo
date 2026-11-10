import type { Categoria, CompraCartao, ConfigCartao } from '../tipos'
import { dataNoMes, diaDaData, diasNoMes, mesDaData, somarMeses } from './datas'
import { dividirEmParcelas } from './dinheiro'

export interface Parcela {
  idCompra: string
  descricao: string
  categoria: Categoria
  numero: number
  quantidade: number
  valor: number
  mesFatura: string
  vencimento: string
}

export interface Parcelamento {
  compra: CompraCartao
  parcelaAtual: number
  valorParcela: number
}

export function mesDaPrimeiraFatura(dataCompra: string, cartao: ConfigCartao) {
  const mesCompra = mesDaData(dataCompra)
  const diaFechamento = Math.min(cartao.fechamento, diasNoMes(mesCompra))
  const mesFechamento =
    diaDaData(dataCompra) < diaFechamento ? mesCompra : somarMeses(mesCompra, 1)
  return cartao.vencimento > cartao.fechamento ? mesFechamento : somarMeses(mesFechamento, 1)
}

export function parcelasDaCompra(compra: CompraCartao, cartao: ConfigCartao): Parcela[] {
  const primeira = mesDaPrimeiraFatura(compra.data, cartao)
  return dividirEmParcelas(compra.total, compra.parcelas).map((valor, indice) => {
    const mesFatura = somarMeses(primeira, indice)
    return {
      idCompra: compra.id,
      descricao: compra.descricao,
      categoria: compra.categoria,
      numero: indice + 1,
      quantidade: compra.parcelas,
      valor,
      mesFatura,
      vencimento: dataNoMes(mesFatura, cartao.vencimento),
    }
  })
}

export function parcelasDaFatura(compras: CompraCartao[], mes: string, cartao: ConfigCartao) {
  return compras.flatMap((compra) =>
    parcelasDaCompra(compra, cartao).filter((parcela) => parcela.mesFatura === mes),
  )
}

export function totalDaFatura(compras: CompraCartao[], mes: string, cartao: ConfigCartao) {
  return parcelasDaFatura(compras, mes, cartao).reduce((soma, parcela) => soma + parcela.valor, 0)
}

export function parcelamentosAtivos(
  compras: CompraCartao[],
  mes: string,
  cartao: ConfigCartao,
): Parcelamento[] {
  return compras
    .filter((compra) => compra.parcelas > 1)
    .flatMap((compra) => {
      const parcela = parcelasDaCompra(compra, cartao).find((item) => item.mesFatura === mes)
      return parcela
        ? [{ compra, parcelaAtual: parcela.numero, valorParcela: parcela.valor }]
        : []
    })
}