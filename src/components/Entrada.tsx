import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { DadosFluxo } from '../tipos'
import { TAMANHO_MAXIMO_NOME, comecarDoZero } from '../lib/entrada'
import { gerarExemplo } from '../lib/exemplo'
import { Icone } from './Icone'
import './Entrada.css'

const LARGURA = 342
const ALTURA = 200
const PONTOS = [0.14, 0.22, 0.17, 0.31, 0.26, 0.24, 0.4, 0.35, 0.52, 0.46, 0.61, 0.57, 0.74, 0.7, 0.86]
const SIMPLES = [0.14, 0.36, 0.3, 0.62, 0.86]
const SALDO_FINAL = 1248032

function curva(valores: number[]) {
  const pontos = valores.map((valor, indice) => [
    (indice * LARGURA) / (valores.length - 1),
    ALTURA - valor * ALTURA,
  ])
  let caminho = `M${pontos[0][0]},${pontos[0][1]}`
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] ?? pontos[i]
    const p1 = pontos[i]
    const p2 = pontos[i + 1]
    const p3 = pontos[i + 2] ?? p2
    caminho += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return caminho
}

const CAMINHO = curva(PONTOS)
const CAMINHO_SIMPLES = curva(SIMPLES)
const formatador = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

interface Props {
  aoEntrar: (dados: DadosFluxo) => void
}

export function Entrada({ aoEntrar }: Props) {
  const grafico = useRef<HTMLDivElement>(null)
  const vaga = useRef<HTMLSpanElement>(null)
  const linha = useRef<SVGPathElement>(null)
  const ponta = useRef<SVGCircleElement>(null)
  const valor = useRef<HTMLElement>(null)
  const [fase, setFase] = useState<'desenhando' | 'desenhou' | 'encolheu'>('desenhando')
  const [pedindoNome, setPedindoNome] = useState(false)
  const [nome, setNome] = useState('')
  const campo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const caminho = linha.current
    if (!caminho || !grafico.current || !vaga.current) {
      return
    }
    const total = caminho.getTotalLength()
    const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const animacoes: Animation[] = []
    let quadro = 0
    let espera = 0

    const desenhar = (progresso: number) => {
      caminho.style.strokeDasharray = `${total}`
      caminho.style.strokeDashoffset = `${total * (1 - progresso)}`
      const ponto = caminho.getPointAtLength(Math.max(total * progresso, 0.01))
      ponta.current?.setAttribute('cx', `${ponto.x}`)
      ponta.current?.setAttribute('cy', `${ponto.y}`)
      if (valor.current) {
        const parcial = progresso >= 1 ? SALDO_FINAL : ((ALTURA - ponto.y) / ALTURA / 0.86) * SALDO_FINAL
        valor.current.textContent = formatador.format(Math.max(0, parcial) / 100)
      }
    }

    const encolher = () => {
      const g = grafico.current?.getBoundingClientRect()
      const v = vaga.current?.getBoundingClientRect()
      if (!g || !v || !grafico.current) {
        return
      }
      const escalaX = v.width / g.width
      const escalaY = v.height / g.height
      grafico.current.style.setProperty('--traco-simples', `${2.4 / ((escalaX + escalaY) / 2)}`)
      animacoes.push(
        grafico.current.animate(
          [{ transform: 'none' }, { transform: `translate(${v.left - g.left}px, ${v.top - g.top}px) scale(${escalaX}, ${escalaY})` }],
          { duration: semAnimacao ? 1 : 900, easing: 'cubic-bezier(0.65, 0, 0.15, 1)', fill: 'forwards' },
        ),
      )
      setFase('encolheu')
    }

    if (semAnimacao) {
      desenhar(1)
      encolher()
      return () => animacoes.forEach((animacao) => animacao.cancel())
    }

    const comeco = performance.now() + 350
    const passo = (agora: number) => {
      const progresso = Math.min(1, Math.max(0, (agora - comeco) / 1700))
      desenhar(suave(progresso))
      if (progresso < 1) {
        quadro = requestAnimationFrame(passo)
      } else {
        setFase('desenhou')
        espera = window.setTimeout(encolher, 900)
      }
    }
    quadro = requestAnimationFrame(passo)

    return () => {
      cancelAnimationFrame(quadro)
      window.clearTimeout(espera)
      animacoes.forEach((animacao) => animacao.cancel())
    }
  }, [])

  useEffect(() => {
    if (pedindoNome) {
      campo.current?.focus()
    }
  }, [pedindoNome])

  const enviar = (evento: FormEvent) => {
    evento.preventDefault()
    const dados = comecarDoZero(nome)
    if (dados) {
      aoEntrar(dados)
    }
  }

  return (
    <div className={`entrada ${fase === 'desenhando' ? '' : 'desenhou'} ${fase === 'encolheu' ? 'encolheu' : ''}`}>
      <div className="entrada-saldo" aria-hidden="true">
        <small>Saldo do mês</small>
        <strong className="numero">
          <span>R$</span>
          <em ref={valor}>0,00</em>
        </strong>
        <i>+18,4% este mês</i>
      </div>

      <div className="entrada-grafico" ref={grafico} aria-hidden="true">
        <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="entrada-traco" x1="0" x2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.45" />
              <stop offset="1" stopColor="currentColor" />
            </linearGradient>
            <linearGradient id="entrada-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[1, 2, 3].map((linhaGrade) => (
            <line key={linhaGrade} className="entrada-grade" x1="0" x2={LARGURA} y1={(linhaGrade * ALTURA) / 4} y2={(linhaGrade * ALTURA) / 4} />
          ))}
          <path className="entrada-area" d={`${CAMINHO} L${LARGURA},${ALTURA} L0,${ALTURA} Z`} />
          <path className="entrada-linha" ref={linha} d={CAMINHO} />
          <path className="entrada-simples" d={CAMINHO_SIMPLES} />
          <circle className="entrada-ponta" ref={ponta} r="3.5" />
        </svg>
      </div>

      <div className="entrada-marca">
        <div className="entrada-marca-linha">
          <span className="entrada-vaga" ref={vaga} />
          <h1>
            {Array.from('fluxo').map((letra, indice) => (
              <span key={indice} style={{ animationDelay: `${520 + indice * 55}ms` }}>
                {letra}
              </span>
            ))}
          </h1>
        </div>
        <p>Seu dinheiro, em movimento.</p>
      </div>

      <section className="entrada-painel" aria-label="Como você quer começar">
        {pedindoNome ? (
          <form onSubmit={enviar}>
            <h2>Como podemos te chamar?</h2>
            <p>O nome aparece só no seu cumprimento.</p>
            <input
              ref={campo}
              className="entrada-campo"
              value={nome}
              maxLength={TAMANHO_MAXIMO_NOME}
              autoComplete="given-name"
              placeholder="Seu nome"
              aria-label="Seu nome"
              onChange={(evento) => setNome(evento.target.value)}
            />
            <button className="entrada-botao principal" type="submit" disabled={nome.trim() === ''}>
              Começar
            </button>
            <button className="entrada-botao secundario" type="button" onClick={() => setPedindoNome(false)}>
              Voltar
            </button>
          </form>
        ) : (
          <>
            <h2>Como você quer começar?</h2>
            <p>Organize seus gastos e ganhos em poucos toques.</p>
            <button className="entrada-botao principal" type="button" onClick={() => setPedindoNome(true)}>
              Começar do zero
            </button>
            <button className="entrada-botao secundario" type="button" onClick={() => aoEntrar(gerarExemplo(new Date()))}>
              Explorar com dados de exemplo
            </button>
          </>
        )}
        <p className="entrada-aviso">
          <Icone nome="cadeado" tamanho={14} /> Seus dados ficam só neste aparelho
        </p>
      </section>
    </div>
  )
}