import { useEffect, useRef } from 'react'
import { formatarReais } from '../lib/dinheiro'

interface Props {
  valores: number[]
  totalDias: number
}

const LARGURA = 800
const ALTURA = 240

export function GraficoSaldo({ valores, totalDias }: Props) {
  const linha = useRef<SVGPathElement>(null)
  const maior = Math.max(1, ...valores)
  const menor = Math.min(0, ...valores)
  const faixa = maior - menor || 1
  const pontos = valores.map((valor, indice) => [
    totalDias > 1 ? (indice / (totalDias - 1)) * LARGURA : 0,
    ALTURA - ((valor - menor) / faixa) * (ALTURA - 24) - 12,
  ])
  const caminho = pontos.map(([x, y], indice) => `${indice === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const ultimo = pontos[pontos.length - 1] ?? [0, ALTURA]
  const area = pontos.length > 1 ? `${caminho} L${ultimo[0]},${ALTURA} L0,${ALTURA} Z` : ''
  const marcas = [1, 8, 15, 22, totalDias]

  useEffect(() => {
    const elemento = linha.current
    if (!elemento || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const total = elemento.getTotalLength()
    const animacao = elemento.animate(
      [{ strokeDasharray: `${total}`, strokeDashoffset: `${total}` }, { strokeDasharray: `${total}`, strokeDashoffset: '0' }],
      { duration: 1400, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    )
    return () => animacao.cancel()
  }, [caminho])

  return (
    <figure className="grafico-saldo">
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} preserveAspectRatio="none" role="img" aria-label={`Saldo do mês até hoje: ${formatarReais(valores[valores.length - 1] ?? 0)}`}>
        <defs>
          <linearGradient id="grafico-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.14" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((posicao) => (
          <line key={posicao} className="grafico-grade" x1="0" x2={LARGURA} y1={ALTURA * posicao} y2={ALTURA * posicao} />
        ))}
        {area && <path className="grafico-area" d={area} />}
        <path ref={linha} className="grafico-linha" d={caminho} />
      </svg>
      <span className={ultimo[0] / LARGURA < 0.3 ? 'grafico-ponto a-direita' : 'grafico-ponto'} style={{ left: `${(ultimo[0] / LARGURA) * 100}%`, top: `${(ultimo[1] / ALTURA) * 100}%` }}>
        <span className="grafico-dica">
          <small>Hoje</small>
          <b className="numero">{formatarReais(valores[valores.length - 1] ?? 0)}</b>
        </span>
      </span>
      <figcaption className="grafico-dias">
        {marcas.map((dia) => (
          <span key={dia} style={{ left: `${((dia - 1) / Math.max(1, totalDias - 1)) * 100}%` }}>
            {dia}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}