import type { ReactNode } from 'react'

export function Pagina({ titulo, descricao, children }: { titulo: string; descricao: string; children?: ReactNode }) {
  return (
    <section className="pagina">
      <h1>{titulo}</h1>
      <p className="pagina-descricao">{descricao}</p>
      {children}
    </section>
  )
}