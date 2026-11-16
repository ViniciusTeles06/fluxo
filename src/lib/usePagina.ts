import { useSyncExternalStore } from 'react'
import { paginaDoEndereco, type IdPagina } from './paginas'

function assinar(avisar: () => void) {
  window.addEventListener('hashchange', avisar)
  return () => window.removeEventListener('hashchange', avisar)
}

export function usePagina() {
  const pagina = useSyncExternalStore(
    assinar,
    () => paginaDoEndereco(window.location.hash),
    () => 'inicio' as IdPagina,
  )
  const irPara = (id: IdPagina) => {
    window.location.hash = id
  }
  return [pagina, irPara] as const
}