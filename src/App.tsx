import { useState } from 'react'
import { Icone } from './components/Icone'
import { Logo } from './components/Logo'
import { MenuPerfil } from './components/MenuPerfil'
import { Pilulas } from './components/Pilulas'
import { posicaoDaPagina } from './lib/paginas'
import { usePagina } from './lib/usePagina'
import { useTema } from './lib/useTema'
import { ConteudoDaPagina } from './paginas/conteudo'
import './App.css'

function App() {
  const [pagina, irPara] = usePagina()
  const [tema, trocarTema] = useTema()
  const [ultima, setUltima] = useState(pagina)
  const [direcao, setDirecao] = useState<'frente' | 'tras'>('frente')

  if (pagina !== ultima) {
    setDirecao(posicaoDaPagina(pagina) >= posicaoDaPagina(ultima) ? 'frente' : 'tras')
    setUltima(pagina)
  }

  return (
    <div className="app">
      <header className="topo">
        <Logo />
        <Pilulas atual={pagina} aoTrocar={irPara} />
        <div className="topo-direita">
          <span className="selo">
            <Icone nome="cadeado" tamanho={14} /> Dados só neste aparelho
          </span>
          <MenuPerfil nome="" tema={tema} aoTrocarTema={trocarTema} />
        </div>
      </header>

      <aside className="atalhos" aria-label="Atalhos">
        <button type="button" className={pagina === 'inicio' ? 'ativo' : undefined} aria-label="Início" onClick={() => irPara('inicio')}>
          <Icone nome="painel" tamanho={20} />
        </button>
        <button type="button" aria-label="Novo lançamento" disabled>
          <Icone nome="mais" tamanho={20} />
        </button>
        <button type="button" className={pagina === 'extrato' ? 'ativo' : undefined} aria-label="Extrato" onClick={() => irPara('extrato')}>
          <Icone nome="cartao" tamanho={20} />
        </button>
        <button type="button" className={pagina === 'metas' ? 'ativo' : undefined} aria-label="Metas" onClick={() => irPara('metas')}>
          <Icone nome="alvo" tamanho={20} />
        </button>
      </aside>

      <main className="conteudo">
        <div key={pagina} className={`troca troca-${direcao}`}>
          <ConteudoDaPagina id={pagina} />
        </div>
      </main>
    </div>
  )
}

export default App