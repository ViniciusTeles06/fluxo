import { useLayoutEffect, useRef, useState } from 'react'
import { PAGINAS, type IdPagina } from '../lib/paginas'

interface Props {
  atual: IdPagina
  aoTrocar: (id: IdPagina) => void
}

export function Pilulas({ atual, aoTrocar }: Props) {
  const botoes = useRef(new Map<IdPagina, HTMLButtonElement>())
  const [marcador, setMarcador] = useState({ esquerda: 0, largura: 0 })

  useLayoutEffect(() => {
    const medir = () => {
      const botao = botoes.current.get(atual)
      if (botao) {
        setMarcador({ esquerda: botao.offsetLeft, largura: botao.offsetWidth })
      }
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [atual])

  return (
    <nav className="pilulas" aria-label="Seções">
      <span
        className="pilulas-marcador"
        style={{ transform: `translateX(${marcador.esquerda}px)`, width: marcador.largura }}
        aria-hidden="true"
      />
      {PAGINAS.map((pagina) => (
        <button
          key={pagina.id}
          ref={(elemento) => {
            if (elemento) {
              botoes.current.set(pagina.id, elemento)
            }
          }}
          type="button"
          className={pagina.id === atual ? 'ativa' : undefined}
          aria-current={pagina.id === atual ? 'page' : undefined}
          onClick={() => aoTrocar(pagina.id)}
        >
          {pagina.nome}
        </button>
      ))}
    </nav>
  )
}