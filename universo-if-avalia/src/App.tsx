import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, BookOpen, CalendarDays, MapPin, Star, Info, Trophy, LockKeyhole } from 'lucide-react';
import type { Catalog, Project, Modality } from './domain';
import { weightedScore } from './domain';

const modalities: Array<'Todas' | Modality> = ['Todas', 'Mostra Nacional', 'Mostra de Extensão'];
const criteria = [
  { label: 'Critério 1', weight: '30%' },
  { label: 'Critério 2', weight: '30%' },
  { label: 'Critério 3', weight: '25%' },
  { label: 'Critério 4', weight: '15%' }
];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [modality, setModality] = useState<'Todas' | Modality>('Todas');
  const [area, setArea] = useState('Todas');
  const [day, setDay] = useState('Todas');
  const [selected, setSelected] = useState<Project | null>(null);
  const [scores, setScores] = useState<Array<number | null>>([null, null, null, null]);

  useEffect(() => {
    fetch('./catalogo.json')
      .then(r => { if (!r.ok) throw new Error('Catálogo não encontrado.'); return r.json(); })
      .then((data: Catalog) => {
        if (!Array.isArray(data.projetos) || data.projetos.length !== 46) throw new Error('O catálogo precisa conter os 46 projetos validados.');
        const ids = new Set(data.projetos.map(p => p.id));
        if (ids.size !== 46) throw new Error('O catálogo contém identificadores duplicados.');
        setCatalog(data);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Falha ao carregar catálogo.'));
  }, []);

  const areas = useMemo(() => ['Todas', ...Array.from(new Set(catalog?.projetos.map(p => p.area_tematica) ?? [])).sort((a,b) => a.localeCompare(b, 'pt-BR'))], [catalog]);
  const days = useMemo(() => ['Todas', ...Array.from(new Set(catalog?.projetos.map(p => p.data) ?? [])).sort()], [catalog]);
  const projects = useMemo(() => (catalog?.projetos ?? []).filter(p => {
    const searchable = normalize([p.id, p.titulo, p.area_tematica].join(' '));
    return (modality === 'Todas' || p.modalidade === modality) && (area === 'Todas' || p.area_tematica === area) && (day === 'Todas' || p.data === day) && searchable.includes(normalize(query));
  }), [catalog, modality, area, day, query]);
  const counts = useMemo(() => ({
    all: catalog?.projetos.length ?? 0,
    national: catalog?.projetos.filter(p => p.modalidade === 'Mostra Nacional').length ?? 0,
    extension: catalog?.projetos.filter(p => p.modalidade === 'Mostra de Extensão').length ?? 0
  }), [catalog]);
  const complete = scores.every((n): n is number => n !== null);
  const preview = complete ? weightedScore(scores as number[]) : null;

  function openProject(project: Project) {
    setSelected(project);
    setScores([null, null, null, null]);
  }

  return <main>
    <header className="hero">
      <nav><span className="brand">UNIVERSO <b>IF</b></span><span className="nav-tag">AVALIA 2026</span></nav>
      <section className="hero-copy">
        <p className="eyebrow">CIÊNCIA • INOVAÇÃO • EXTENSÃO</p>
        <h1>Ideias que transformam.<br/><em>Projetos que inspiram.</em></h1>
        <p>Conheça os trabalhos apresentados no Universo IF 2026 e explore o catálogo da participação popular.</p>
        <a className="scroll-link" href="#projetos">Explorar projetos ↓</a>
      </section>
      <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
    </header>

    <section className="stats" aria-label="Resumo do catálogo">
      <div><strong>{counts.all || '—'}</strong><span>Projetos</span></div>
      <div><strong>{counts.national || '—'}</strong><span>Mostra Nacional</span></div>
      <div><strong>{counts.extension || '—'}</strong><span>Mostra de Extensão</span></div>
    </section>

    <section id="projetos" className="content">
      <div className="section-heading"><div><p className="eyebrow dark">DESCUBRA E PARTICIPE</p><h2>Projetos em destaque</h2><p>Encontre um trabalho por título, área, modalidade ou dia.</p></div><span className="section-icon"><BookOpen size={24}/></span></div>
      <div className="filters">
        <label className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título, área ou código..." /></label>
        <label className="select-wrap"><Filter size={17}/><select aria-label="Filtrar por modalidade" value={modality} onChange={e => setModality(e.target.value as typeof modality)}>{modalities.map(m => <option key={m}>{m}</option>)}</select></label>
        <label className="select-wrap"><select aria-label="Filtrar por área temática" value={area} onChange={e => setArea(e.target.value)}>{areas.map(a => <option key={a}>{a}</option>)}</select></label>
        <label className="select-wrap"><select aria-label="Filtrar por dia" value={day} onChange={e => setDay(e.target.value)}>{days.map(d => <option key={d} value={d}>{d === 'Todas' ? d : new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')}</option>)}</select></label>
      </div>
      {error && <div className="notice"><Info size={18}/><div><b>Não foi possível carregar o catálogo</b><p>{error} Verifique o arquivo oficial em <code>public/catalogo.json</code>. Nenhum projeto fictício será exibido.</p></div></div>}
      {!error && !catalog && <p className="results">Carregando os 46 projetos…</p>}
      {!error && catalog && <p className="results">{projects.length} de {counts.all} projeto(s) encontrado(s)</p>}
      <div className="project-grid">
        {projects.map(p => <article className="project-card" key={p.id}>
          <div className="card-top"><span>{p.modalidade}</span><small>{p.id}</small></div>
          <p className="area">{p.area_tematica}</p><h3>{p.titulo}</h3>
          <div className="meta"><span><CalendarDays size={15}/>{new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')} • {p.inicio}–{p.fim}</span><span><MapPin size={15}/>{p.local}</span></div>
          <button className="details" onClick={() => openProject(p)}>Ver detalhes e avaliar <span>→</span></button>
        </article>)}
      </div>
      {catalog && projects.length === 0 && <p className="empty">Nenhum projeto corresponde aos filtros selecionados.</p>}
    </section>

    <section id="ranking" className="content ranking-section">
      <div className="section-heading"><div><p className="eyebrow dark">RESULTADO DA PARTICIPAÇÃO</p><h2>Ranking popular</h2><p>As classificações serão separadas por modalidade.</p></div><span className="section-icon"><Trophy size={24}/></span></div>
      <div className="ranking-grid">{(['Mostra Nacional', 'Mostra de Extensão'] as Modality[]).map(name => <article className="ranking-card" key={name}><h3>{name}</h3><div className="ranking-empty"><LockKeyhole size={22}/><b>Ranking ainda não disponível</b><span>Aguardando integração segura com a planilha.</span></div></article>)}</div>
      <p className="ranking-rule">Projetos com menos de 5 avaliações válidas aparecerão como “Aguardando amostra mínima”. Nenhuma nota ou colocação é simulada.</p>
    </section>

    <section className="how"><div><p className="eyebrow">AVALIAÇÃO POPULAR</p><h2>Sua opinião valoriza a pesquisa.</h2><p>Você já pode conhecer os critérios e visualizar a nota ponderada. O envio ficará bloqueado até a configuração e os testes do serviço seguro de votação.</p></div><div className="how-icon"><Star size={34}/></div></section>
    <footer><b>UNIVERSO IF AVALIA</b><span>Protótipo acadêmico • Universo IF 2026</span><small>Esta avaliação é participativa e não substitui a avaliação oficial do evento.</small></footer>

    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)} aria-label="Fechar">×</button><span className="pill">{selected.modalidade} · {selected.id}</span><p className="area">{selected.area_tematica}</p><h2 id="modal-title">{selected.titulo}</h2><p><CalendarDays size={16}/> {new Date(selected.data + 'T12:00:00').toLocaleDateString('pt-BR')} • {selected.inicio} às {selected.fim}</p><p><MapPin size={16}/> {selected.local} · {selected.formato}</p>
      <div className="evaluation"><h3><Star size={18}/> Prévia da avaliação</h3><p className="evaluation-help">Atribua uma nota de 1 a 5 em cada critério. A prévia não é enviada nem registrada.</p>
        {criteria.map((criterion, i) => <label className="criterion" key={criterion.label}><span>{criterion.label} <small>({criterion.weight})</small></span><select aria-label={criterion.label} value={scores[i] ?? ''} onChange={e => setScores(old => old.map((v, index) => index === i ? (e.target.value ? Number(e.target.value) : null) : v))}><option value="">Selecione</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? '— Insuficiente' : n === 5 ? '— Excelente' : ''}</option>)}</select></label>)}
        <div className="score-preview"><span>Nota ponderada</span><strong>{preview === null ? '—' : preview.toFixed(2).replace('.', ',')}</strong><small>{complete ? 'Prévia calculada. Ainda não registrada.' : 'Preencha os quatro critérios para calcular.'}</small></div>
        <button className="submit-disabled" disabled><LockKeyhole size={16}/> Envio indisponível nesta etapa</button>
      </div>
      <p className="source-note">O envio só será liberado após integração e homologação do backend. Esta prévia não gera voto.</p></section></div>}
  </main>;
}
