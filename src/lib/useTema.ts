import { useCallback, useEffect, useState } from 'react'
import { CHAVE_TEMA, lerPreferencia, raioDaTransicao, resolverTema, type Tema } from './tema'

function lerSalvo() {
  try {
    return lerPreferencia(localStorage.getItem(CHAVE_TEMA))
  } catch {
    return 'sistema'
  }
}

function salvarPreferencia(tema: Tema) {
  try {
    localStorage.setItem(CHAVE_TEMA, tema)
    return true
  } catch {
    return false
  }
}

function sistemaEscuro() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(() => resolverTema(lerSalvo(), sistemaEscuro()))

  useEffect(() => {
    document.documentElement.dataset.tema = tema
  }, [tema])

  const trocar = useCallback((novo: Tema, origem?: HTMLElement) => {
    if (novo === tema) {
      return
    }
    salvarPreferencia(novo)
    const aplicar = () => {
      document.documentElement.dataset.tema = novo
      setTema(novo)
    }
    const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!origem || semAnimacao || !document.startViewTransition) {
      aplicar()
      return
    }
    const caixa = origem.getBoundingClientRect()
    const x = caixa.left + caixa.width / 2
    const y = caixa.top + caixa.height / 2
    const raio = raioDaTransicao(x, y, window.innerWidth, window.innerHeight)
    const transicao = document.startViewTransition(aplicar)
    transicao.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }, [tema])

  return [tema, trocar] as const
}