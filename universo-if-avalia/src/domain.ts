export type Modality = 'Mostra Nacional' | 'Mostra de Extensão';
export interface Project {
  id: string; titulo: string; modalidade: Modality; area_tematica: string;
  data: string; inicio: string; fim: string; formato: string; local: string;
  fontes?: Array<{ arquivo: string; pagina: number }>;
}
export interface Catalog { schema: string; evento: string; total: number; projetos: Project[]; }

export const weights = [0.30, 0.30, 0.25, 0.15] as const;
export function weightedScore(scores: number[]): number {
  if (scores.length !== 4 || scores.some(n => !Number.isInteger(n) || n < 1 || n > 5)) {
    throw new Error('Informe quatro notas inteiras de 1 a 5.');
  }
  return scores.reduce((sum, n, i) => sum + n * weights[i], 0);
}
export function rankingState(votes: number): 'ranked' | 'pending' {
  return votes >= 5 ? 'ranked' : 'pending';
}
export function rankProjects<T extends { average: number; votes: number; title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    b.average - a.average || b.votes - a.votes || a.title.localeCompare(b.title, 'pt-BR')
  );
}