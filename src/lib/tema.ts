export type Tema = 'claro' | 'escuro'
export type PreferenciaTema = Tema | 'sistema'

export const CHAVE_TEMA = 'fluxo:tema'

export function lerPreferencia(valor: string | null): PreferenciaTema {
  return valor === 'claro' || valor === 'escuro' ? valor : 'sistema'
}

export function resolverTema(preferencia: PreferenciaTema, sistemaEscuro: boolean): Tema {
  if (preferencia === 'sistema') {
    return sistemaEscuro ? 'escuro' : 'claro'
  }
  return preferencia
}

export function raioDaTransicao(x: number, y: number, largura: number, altura: number) {
  return Math.hypot(Math.max(x, largura - x), Math.max(y, altura - y))
}