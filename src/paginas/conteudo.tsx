import type { DadosFluxo } from '../tipos'
import type { IdPagina } from '../lib/paginas'
import { Inicio } from './Inicio'
import { Pagina } from './Pagina'

export function ConteudoDaPagina({ id, dados }: { id: IdPagina; dados: DadosFluxo }) {
  if (id === 'extrato') {
    return <Pagina titulo="Extrato" descricao="Seus lançamentos, do mais recente para o mais antigo." />
  }
  if (id === 'orcamento') {
    return <Pagina titulo="Orçamento" descricao="Quanto você reservou para cada categoria neste mês." />
  }
  if (id === 'metas') {
    return <Pagina titulo="Metas" descricao="O que você está guardando e quanto falta." />
  }
  return <Inicio dados={dados} />
}