export const PAGINAS = [
  { id: 'inicio', nome: 'Início' },
  { id: 'extrato', nome: 'Extrato' },
  { id: 'orcamento', nome: 'Orçamento' },
  { id: 'metas', nome: 'Metas' },
] as const

export type IdPagina = (typeof PAGINAS)[number]['id']

export function paginaDoEndereco(hash: string): IdPagina {
  const id = hash.replace(/^#\/?/, '')
  return PAGINAS.find((pagina) => pagina.id === id)?.id ?? 'inicio'
}

export function posicaoDaPagina(id: IdPagina) {
  return PAGINAS.findIndex((pagina) => pagina.id === id)
}

export function saudacao(hora: number) {
  if (hora >= 5 && hora < 12) {
    return 'Bom dia'
  }
  if (hora >= 12 && hora < 18) {
    return 'Boa tarde'
  }
  return 'Boa noite'
}