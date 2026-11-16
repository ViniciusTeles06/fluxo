import { useEffect, useRef, useState } from 'react'
import type { DadosFluxo } from '../tipos'
import { carregarDados, dadosVazios, salvarDados } from './armazenamento'

export function useDados() {
  const [inicio] = useState(() => carregarDados())
  const [dados, setDados] = useState<DadosFluxo>(inicio.dados)
  const primeira = useRef(true)

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false
      return
    }
    if (inicio.podeSalvar) {
      salvarDados(dados)
    }
  }, [dados, inicio.podeSalvar])

  const recomecar = () => setDados(dadosVazios())

  return { dados, setDados, recomecar, salvando: inicio.podeSalvar }
}