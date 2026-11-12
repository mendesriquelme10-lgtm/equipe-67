import { describe, expect, it } from 'vitest';
import { rankingState, rankProjects, weightedScore } from './domain';
describe('regras de avaliação', () => {
 it('calcula média ponderada',()=>expect(weightedScore([4,5,4,3])).toBeCloseTo(4.15));
 it('rejeita notas inválidas',()=>{expect(()=>weightedScore([4,5,4])).toThrow();expect(()=>weightedScore([4,5,4,6])).toThrow();});
 it('exige cinco votos',()=>{expect(rankingState(4)).toBe('pending');expect(rankingState(5)).toBe('ranked');});
 it('ordena por média, votos e título',()=>{const r=rankProjects([{title:'B',average:4.5,votes:8},{title:'C',average:4.5,votes:9},{title:'A',average:4.5,votes:9},{title:'D',average:4.4,votes:20}]);expect(r.map(x=>x.title)).toEqual(['A','C','B','D']);});
});