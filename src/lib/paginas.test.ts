import { describe, expect, it } from 'vitest'
import { paginaDoEndereco, posicaoDaPagina, saudacao } from './paginas'

describe('páginas', () => {
  it('lê a página pelo endereço e volta para o início se não reconhecer', () => {
    expect(paginaDoEndereco('#extrato')).toBe('extrato')
    expect(paginaDoEndereco('#/metas')).toBe('metas')
    expect(paginaDoEndereco('')).toBe('inicio')
    expect(paginaDoEndereco('#qualquer')).toBe('inicio')
  })

  it('sabe a ordem das páginas para animar a troca para o lado certo', () => {
    expect(posicaoDaPagina('inicio')).toBeLessThan(posicaoDaPagina('metas'))
  })

  it('cumprimenta conforme a hora', () => {
    expect(saudacao(5)).toBe('Bom dia')
    expect(saudacao(11)).toBe('Bom dia')
    expect(saudacao(12)).toBe('Boa tarde')
    expect(saudacao(18)).toBe('Boa noite')
    expect(saudacao(2)).toBe('Boa noite')
  })
})