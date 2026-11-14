export interface PublicRankingItem {
  projectId: string;
  votes: number;
  average: number | null;
  criteriaAverage: number[] | null;
  status: 'ranked' | 'pending';
}
interface PublicRankingResponse { ok: boolean; ranking?: PublicRankingItem[]; error?: string; }

export function loadPublicRanking(endpoint: string): Promise<PublicRankingItem[]> {
  return new Promise((resolve, reject) => {
    const callbackName = '__universoRanking_' + Date.now() + '_' + Math.floor(Math.random() * 1_000_000);
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => finish(new Error('Tempo esgotado ao carregar o ranking.')), 12000);
    const globalWindow = window as unknown as Record<string, unknown>;

    function finish(error?: Error, result?: PublicRankingItem[]) {
      window.clearTimeout(timeout);
      delete globalWindow[callbackName];
      script.remove();
      if (error) reject(error);
      else resolve(result ?? []);
    }

    globalWindow[callbackName] = (payload: PublicRankingResponse) => {
      if (!payload || payload.ok !== true || !Array.isArray(payload.ranking)) {
        finish(new Error(payload?.error || 'Resposta inválida do serviço de ranking.'));
        return;
      }
      finish(undefined, payload.ranking);
    };
    script.onerror = () => finish(new Error('Não foi possível acessar o serviço de ranking.'));
    const separator = endpoint.includes('?') ? '&' : '?';
    script.src = endpoint + separator + 'callback=' + encodeURIComponent(callbackName);
    document.head.appendChild(script);
  });
}
