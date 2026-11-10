const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const VALOR_MAXIMO = 100_000_000_00

export function formatarReais(centavos: number) {
  return formatador.format(centavos / 100)
}

export function reaisParaCentavos(reais: number) {
  return Math.round(reais * 100)
}

export function lerValor(texto: string): number | null {
  const limpo = texto.replace(/r\$/gi, '').replace(/\s/g, '')
  let numero: number

  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(limpo) || /^\d+(,\d{1,2})?$/.test(limpo)) {
    numero = Number(limpo.replace(/\./g, '').replace(',', '.'))
  } else if (/^\d+\.\d{1,2}$/.test(limpo)) {
    numero = Number(limpo)
  } else {
    return null
  }

  const centavos = Math.round(numero * 100)
  return centavos > 0 && centavos <= VALOR_MAXIMO ? centavos : null
}

export function dividirEmParcelas(total: number, parcelas: number) {
  if (!Number.isInteger(parcelas) || parcelas < 1) {
    throw new Error('O número de parcelas precisa ser um inteiro maior que zero.')
  }
  if (!Number.isInteger(total) || total < parcelas) {
    throw new Error('O total precisa ser um valor em centavos de pelo menos 1 centavo por parcela.')
  }
  const base = Math.floor(total / parcelas)
  const resto = total - base * parcelas
  return Array.from({ length: parcelas }, (_, indice) => (indice === 0 ? base + resto : base))
}