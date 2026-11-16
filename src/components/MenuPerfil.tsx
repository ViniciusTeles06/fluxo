import { useEffect, useRef, useState } from 'react'
import type { Tema } from '../lib/tema'
import { Icone } from './Icone'

interface Props {
  nome: string
  tema: Tema
  aoTrocarTema: (tema: Tema, origem: HTMLElement) => void
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) {
    return 'F'
  }
  return partes
    .slice(0, 2)
    .map((parte) => Array.from(parte)[0].toUpperCase())
    .join('')
}

export function MenuPerfil({ nome, tema, aoTrocarTema }: Props) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef<HTMLDivElement>(null)
  const botao = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberto) {
      return
    }
    const fecharFora = (evento: PointerEvent) => {
      if (!caixa.current?.contains(evento.target as Node)) {
        setAberto(false)
      }
    }
    const fecharNoEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setAberto(false)
        botao.current?.focus()
      }
    }
    document.addEventListener('pointerdown', fecharFora)
    document.addEventListener('keydown', fecharNoEsc)
    return () => {
      document.removeEventListener('pointerdown', fecharFora)
      document.removeEventListener('keydown', fecharNoEsc)
    }
  }, [aberto])

  return (
    <div className="perfil" ref={caixa}>
      <button
        ref={botao}
        type="button"
        className="avatar"
        aria-label="Abrir perfil"
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
      >
        {iniciais(nome)}
      </button>
      <div className={aberto ? 'menu aberto' : 'menu'} role="dialog" aria-label="Perfil" hidden={!aberto}>
        <div className="menu-quem">
          <span className="avatar" aria-hidden="true">{iniciais(nome)}</span>
          <div>
            <strong>{nome || 'Seu perfil'}</strong>
            <small>
              <Icone nome="cadeado" tamanho={12} /> Dados só neste aparelho
            </small>
          </div>
        </div>
        <p className="menu-rotulo">Aparência</p>
        <div className={`tema tema-${tema}`} role="group" aria-label="Tema">
          <span className="tema-marcador" aria-hidden="true" />
          <button type="button" aria-pressed={tema === 'claro'} onClick={(evento) => aoTrocarTema('claro', evento.currentTarget)}>
            <Icone nome="sol" tamanho={16} /> Claro
          </button>
          <button type="button" aria-pressed={tema === 'escuro'} onClick={(evento) => aoTrocarTema('escuro', evento.currentTarget)}>
            <Icone nome="lua" tamanho={16} /> Escuro
          </button>
        </div>
      </div>
    </div>
  )
}