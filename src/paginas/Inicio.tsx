import { useState } from 'react'
import type { DadosFluxo } from '../tipos'
import { GraficoSaldo } from '../components/GraficoSaldo'
import { Icone } from '../components/Icone'
import { diasNoMes, nomeDoMes } from '../lib/datas'
import { formatarReais } from '../lib/dinheiro'
import { primeiroNome } from '../lib/entrada'
import { saudacao } from '../lib/paginas'
import { resumirMes } from '../lib/resumo'
import './Inicio.css'

function dataCurta(dataISO: string) {
  const [, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}`
}

function quando(diasAte: number) {
  if (diasAte < 0) {
    return `Venceu há ${-diasAte} ${diasAte === -1 ? 'dia' : 'dias'}`
  }
  if (diasAte === 0) {
    return 'Vence hoje'
  }
  if (diasAte === 1) {
    return 'Vence amanhã'
  }
  return `Vence em ${diasAte} dias`
}

export function Inicio({ dados }: { dados: DadosFluxo }) {
  const [agora] = useState(() => new Date())
  const resumo = resumirMes(dados, agora)
  const maiorGasto = Math.max(1, ...resumo.categorias.map((item) => Math.max(item.gasto, item.limite ?? 0)))
  const ano = resumo.mes.slice(0, 4)
  const vazio = dados.lancamentos.length === 0 && dados.compras.length === 0

  return (
    <div className="inicio">
      <section className="inicio-destaque">
        <p className="inicio-ola">
          {saudacao(agora.getHours())}, {primeiroNome(dados.nome)}
          <span>
            {nomeDoMes(resumo.mes)} de {ano}
          </span>
        </p>
        <p className="inicio-pergunta">Você pode gastar</p>
        <p className="inicio-valor numero">
          {formatarReais(resumo.porDia)}
          <span>por dia</span>
        </p>
        <p className="inicio-explica">
          {vazio
            ? 'Anote sua primeira entrada para o Fluxo calcular quanto sobra por dia.'
            : resumo.livre > 0
              ? `Sobram ${formatarReais(resumo.livre)} para os ${resumo.diasRestantes} dias até o fim do mês.`
              : `Os gastos do mês já passaram do que entrou em ${formatarReais(-resumo.livre)}.`}
        </p>
        <div className="inicio-chips">
          <span className="chip chip-entrada numero">Entradas {formatarReais(resumo.entradas)}</span>
          <span className="chip chip-saida numero">Saídas {formatarReais(resumo.saidas)}</span>
          {resumo.faturaDoMes > 0 && <span className="chip numero">Fatura do mês {formatarReais(resumo.faturaDoMes)}</span>}
        </div>
        <GraficoSaldo valores={resumo.saldoPorDia} totalDias={diasNoMes(resumo.mes)} />
      </section>

      <aside className="inicio-lado">
        <article className="cartao-vidro inicio-fatura">
          <header>
            <h2>Fatura aberta</h2>
            <Icone nome="cartao" />
          </header>
          <p className="inicio-fatura-valor numero">{formatarReais(resumo.faturaAberta.total)}</p>
          <p className="inicio-sub">
            Vence em {dataCurta(resumo.faturaAberta.vencimento)} · fecha dia {dados.cartao.fechamento}
          </p>
        </article>

        <article className="cartao-vidro">
          <header>
            <h2>Próximas contas</h2>
            <span className="inicio-sub">{resumo.proximasContas.length || 'Nenhuma'}</span>
          </header>
          {resumo.proximasContas.length === 0 ? (
            <p className="inicio-sub">Tudo pago neste mês.</p>
          ) : (
            <ul className="inicio-lista">
              {resumo.proximasContas.slice(0, 4).map((conta) => (
                <li key={conta.id}>
                  <span className="inicio-dia numero">{conta.vencimento.slice(8)}</span>
                  <span>
                    {conta.nome}
                    <small className={conta.diasAte <= 2 ? 'urgente' : undefined}>{quando(conta.diasAte)}</small>
                  </span>
                  <b className="numero">{formatarReais(conta.valor)}</b>
                </li>
              ))}
            </ul>
          )}
        </article>
      </aside>

      <article className="cartao-vidro inicio-categorias">
        <header>
          <h2>Gastos por categoria</h2>
          <span className="inicio-sub">{nomeDoMes(resumo.mes)}</span>
        </header>
        {resumo.categorias.length === 0 ? (
          <p className="inicio-sub">Seus gastos do mês aparecem aqui.</p>
        ) : (
          <ul>
            {resumo.categorias.slice(0, 6).map((item, indice) => {
              const passou = item.limite !== undefined && item.gasto > item.limite
              return (
                <li key={item.categoria} className={passou ? 'passou' : undefined}>
                  <span>{item.categoria}</span>
                  <i>
                    <span style={{ width: `${(item.gasto / maiorGasto) * 100}%`, animationDelay: `${300 + indice * 70}ms` }} />
                    {item.limite !== undefined && <em style={{ left: `${(item.limite / maiorGasto) * 100}%` }} title="Limite" />}
                  </i>
                  <b className="numero">{formatarReais(item.gasto)}</b>
                </li>
              )
            })}
          </ul>
        )}
      </article>

      <article className="cartao-vidro inicio-ultimos">
        <header>
          <h2>Últimos lançamentos</h2>
        </header>
        {resumo.ultimos.length === 0 ? (
          <p className="inicio-sub">Nada por aqui ainda.</p>
        ) : (
          <ul className="inicio-lista">
            {resumo.ultimos.map((item) => (
              <li key={item.id}>
                <span className="inicio-dia numero">{item.data.slice(8)}</span>
                <span>
                  {item.descricao}
                  <small>{item.categoria}</small>
                </span>
                <b className={item.tipo === 'entrada' ? 'numero valor-entrada' : 'numero'}>
                  {item.tipo === 'entrada' ? '+ ' : '− '}
                  {formatarReais(item.valor)}
                </b>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  )
}