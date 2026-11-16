import { useState } from 'react'
import type { IdPagina } from '../lib/paginas'
import { primeiroNome } from '../lib/entrada'
import { saudacao } from '../lib/paginas'
import { Pagina } from './Pagina'

export function ConteudoDaPagina({ id, nome }: { id: IdPagina; nome: string }) {
  const [hora] = useState(() => new Date().getHours())
  if (id === 'extrato') {
    return <Pagina titulo="Extrato" descricao="Seus lançamentos, do mais recente para o mais antigo." />
  }
  if (id === 'orcamento') {
    return <Pagina titulo="Orçamento" descricao="Quanto você reservou para cada categoria neste mês." />
  }
  if (id === 'metas') {
    return <Pagina titulo="Metas" descricao="O que você está guardando e quanto falta." />
  }
  return <Pagina titulo={`${saudacao(hora)}, ${primeiroNome(nome)}`} descricao="Aqui vai aparecer quanto você pode gastar por dia até o fim do mês." />
}