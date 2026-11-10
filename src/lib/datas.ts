const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

function doisDigitos(numero: number) {
  return String(numero).padStart(2, '0')
}

function partesDoMes(chave: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(chave)) {
    throw new Error(`Mês inválido: ${chave}`)
  }
  const [ano, mes] = chave.split('-').map(Number)
  return { ano, mes }
}

export function paraDataISO(data: Date) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
}

export function hojeISO() {
  return paraDataISO(new Date())
}

export function chaveDoMes(data: Date) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}`
}

export function mesDaData(dataISO: string) {
  return dataISO.slice(0, 7)
}

export function diaDaData(dataISO: string) {
  return Number(dataISO.slice(8, 10))
}

export function somarMeses(chave: string, quantidade: number) {
  const { ano, mes } = partesDoMes(chave)
  const data = new Date(ano, mes - 1, 1)
  data.setMonth(data.getMonth() + Math.trunc(quantidade))
  return chaveDoMes(data)
}

export function diasNoMes(chave: string) {
  const { ano, mes } = partesDoMes(chave)
  return new Date(ano, mes, 0).getDate()
}

export function dataNoMes(chave: string, dia: number) {
  const diaValido = Math.max(1, Math.min(Math.trunc(dia), diasNoMes(chave)))
  return `${chave}-${doisDigitos(diaValido)}`
}

export function nomeDoMes(chave: string) {
  return MESES[partesDoMes(chave).mes - 1]
}