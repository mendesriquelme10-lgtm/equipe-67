import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, BookOpen, CalendarDays, MapPin, Star, Info } from 'lucide-react';
import type { Catalog, Project, Modality } from './domain';

const modalities: Array<'Todas' | Modality> = ['Todas', 'Mostra Nacional', 'Mostra de Extensão'];

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [modality, setModality] = useState<'Todas' | Modality>('Todas');
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    fetch('./catalogo.json')
      .then(r => { if (!r.ok) throw new Error('Catálogo não encontrado.'); return r.json(); })
      .then((data: Catalog) => {
        if (!Array.isArray(data.projetos) || data.projetos.length !== 46) throw new Error('O catálogo precisa conter os 46 projetos validados.');
        setCatalog(data);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Falha ao carregar catálogo.'));
  }, []);

  const projects = useMemo(() => (catalog?.projetos ?? []).filter(p => {
    const text = [p.id, p.titulo, p.area_tematica].join(' ').toLocaleLowerCase('pt-BR');
    return (modality === 'Todas' || p.modalidade === modality) && text.includes(query.toLocaleLowerCase('pt-BR'));
  }), [catalog, modality, query]);

  const counts = useMemo(() => ({
    all: catalog?.projetos.length ?? 0,
    national: catalog?.projetos.filter(p => p.modalidade === 'Mostra Nacional').length ?? 0,
    extension: catalog?.projetos.filter(p => p.modalidade === 'Mostra de Extensão').length ?? 0
  }), [catalog]);

  return <main>
    <header className="hero">
      <nav><span className="brand">UNIVERSO <b>IF</b></span><span className="nav-tag">AVALIA 2026</span></nav>
      <section className="hero-copy">
        <p className="eyebrow">CIÊNCIA • INOVAÇÃO • EXTENSÃO</p>
        <h1>Ideias que transformam.<br/><em>Projetos que inspiram.</em></h1>
        <p>Conheça os trabalhos apresentados no Universo IF 2026 e participe da avaliação popular.</p>
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
      <div className="section-heading"><div><p className="eyebrow dark">DESCUBRA E PARTICIPE</p><h2>Projetos em destaque</h2><p>Encontre um trabalho e conheça sua proposta.</p></div><span className="section-icon"><BookOpen size={24}/></span></div>
      <div className="filters">
        <label className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título, área ou código..." /></label>
        <label className="select-wrap"><Filter size={17}/><select value={modality} onChange={e => setModality(e.target.value as typeof modality)}>{modalities.map(m => <option key={m}>{m}</option>)}</select></label>
      </div>
      {error && <div className="notice"><Info size={18}/><div><b>Catálogo aguardando inclusão</b><p>{error} Adicione o arquivo <code>public/catalogo.json</code> usando o JSON validado recebido no kit do projeto. Nenhum projeto fictício será exibido.</p></div></div>}
      {!error && catalog && <p className="results">{projects.length} projeto(s) encontrado(s)</p>}
      <div className="project-grid">
        {projects.map(p => <article className="project-card" key={p.id}>
          <div className="card-top"><span>{p.modalidade}</span><small>{p.id}</small></div>
          <p className="area">{p.area_tematica}</p><h3>{p.titulo}</h3>
          <div className="meta"><span><CalendarDays size={15}/>{new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')} • {p.inicio}–{p.fim}</span><span><MapPin size={15}/>{p.local}</span></div>
          <button className="details" onClick={() => setSelected(p)}>Ver detalhes <span>→</span></button>
        </article>)}
      </div>
      {catalog && projects.length === 0 && <p className="empty">Nenhum projeto corresponde à sua busca.</p>}
    </section>

    <section className="how"><div><p className="eyebrow">AVALIAÇÃO POPULAR</p><h2>Sua opinião valoriza a pesquisa.</h2><p>A etapa de envio de avaliações será liberada após a configuração segura do serviço de votação e validação dos códigos de participação.</p></div><div className="how-icon"><Star size={34}/></div></section>
    <footer><b>UNIVERSO IF AVALIA</b><span>Protótipo acadêmico • Universo IF 2026</span><small>Esta avaliação é participativa e não substitui a avaliação oficial do evento.</small></footer>

    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)} aria-label="Fechar">×</button><span className="pill">{selected.modalidade} · {selected.id}</span><p className="area">{selected.area_tematica}</p><h2 id="modal-title">{selected.titulo}</h2><p><CalendarDays size={16}/> {new Date(selected.data + 'T12:00:00').toLocaleDateString('pt-BR')} • {selected.inicio} às {selected.fim}</p><p><MapPin size={16}/> {selected.local} · {selected.formato}</p><p className="source-note">Dados transcritos do catálogo do evento. A avaliação ficará disponível após a integração do backend.</p></section></div>}
  </main>;
}