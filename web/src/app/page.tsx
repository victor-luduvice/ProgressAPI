"use client";

import Image from "next/image";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  LoaderCircle,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "SEM_CONTAGEM" | "CRITICO" | "ATENCAO" | "OK";
type StockItem = {
  variacaoId: number;
  produto: string;
  rotulo: string;
  unidade: string;
  saldo: number | null;
  estoqueMinimo: number;
  status: Status;
  ultimaContagemEm: string | null;
};

const API_URL = "/api";
const USER_ID = Number(process.env.NEXT_PUBLIC_USER_ID ?? 2);
const statusText: Record<Status, string> = {
  SEM_CONTAGEM: "Sem contagem",
  CRITICO: "Crítico",
  ATENCAO: "Atenção",
  OK: "Em dia",
};

function formatTime(value: string | null) {
  if (!value) return "Ainda não contado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function sizeColorClass(rotulo: string) {
  const normalized = rotulo.trim().toLocaleUpperCase("pt-BR");
  if (normalized === "P") return "size-color-p";
  if (normalized === "M") return "size-color-m";
  if (normalized === "G") return "size-color-g";
  if (normalized === "GG" || normalized === "XG") return "size-color-xg";
  return "size-color-other";
}

function isTrashBag(product: string) {
  return product.toLocaleLowerCase("pt-BR").includes("saco de lixo");
}

export default function Home() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"TODOS" | Status>("TODOS");
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [offline, setOffline] = useState(false);

  async function loadStock() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/estoque`, { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível carregar o estoque.");
      setItems((await response.json()) as StockItem[]);
      setOffline(false);
    } catch {
      setError("Não conseguimos acessar a API. Confira se ela está rodando.");
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadStock(), 0);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => window.clearTimeout(initialLoad);
  }, []);

  const selected = items.find((item) => item.variacaoId === selectedId) ?? null;
  const summary = useMemo(
    () => ({
      total: items.length,
      critical: items.filter((item) => item.status === "CRITICO").length,
      attention: items.filter((item) => item.status === "ATENCAO").length,
      counted: items.filter((item) => item.saldo !== null).length,
    }),
    [items],
  );
  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "TODOS" || item.status === filter;
    const matchesSearch = `${item.produto} ${item.rotulo}`
      .toLocaleLowerCase("pt-BR")
      .includes(search.toLocaleLowerCase("pt-BR"));
    return matchesFilter && matchesSearch;
  });

  async function submitCount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || quantity === "") return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/contagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variacaoId: selected.variacaoId,
          quantidade: Number(quantity),
          usuarioId: USER_ID,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { message?: string | string[] }
          | null;
        throw new Error(
          Array.isArray(body?.message)
            ? body.message.join(" ")
            : body?.message || "Não foi possível registrar a contagem.",
        );
      }
      const result = (await response.json()) as { status: Status };
      setNotice(`Contagem salva. Status: ${statusText[result.status]}.`);
      setQuantity("");
      await loadStock();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Falha ao salvar a contagem.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Progress Bobinas Plásticas, início">
          <Image src="/logo-progress.png" alt="Progress Bobinas Plásticas" width={1147} height={328} priority />
        </a>
        <div className="workspace-label">OPERAÇÃO</div>
        <a className="nav-link active" href="#painel"><Boxes size={18} /> Estoque</a>
        <div className="sidebar-bottom">
          <span className="connection"><span className={offline ? "dot dot-off" : "dot"} />{offline ? "API desconectada" : "API conectada"}</span>
          <span className="workspace-name">Controle de estoque</span>
          <span className="workspace-meta">MVP · versão 0.1</span>
        </div>
      </aside>

      <section className="main-column" id="inicio">
        <header className="topbar">
          <a className="mobile-brand" href="#inicio" aria-label="Progress Bobinas Plásticas, início">
            <Image src="/logo-progress.png" alt="Progress Bobinas Plásticas" width={1147} height={328} priority />
          </a>
          <div className="breadcrumb"><span>Operação</span><span className="crumb-divider">/</span><strong>Estoque</strong></div>
          <button className="icon-button refresh-button" onClick={() => void loadStock()} title="Atualizar estoque" aria-label="Atualizar estoque" disabled={loading}>
            <RefreshCw size={17} className={loading ? "spinning" : ""} />
          </button>
        </header>

        <div className="content" id="painel">
          <div className="page-heading">
            <div>
              <div className="eyebrow">TERÇA-FEIRA, 20 DE OUTUBRO</div>
              <h1>Visão de estoque</h1>
              <p className="subtitle">Acompanhe os níveis e registre uma nova contagem.</p>
            </div>
            <button className="primary-button heading-action" onClick={() => document.getElementById("count-form")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
              <Plus size={17} /> Nova contagem
            </button>
          </div>

          <section className="summary-grid" aria-label="Resumo do estoque">
            <article className="summary-item"><span className="summary-label">VARIAÇÕES ATIVAS</span><div className="summary-value">{loading ? "—" : summary.total}<span className="summary-icon neutral"><Boxes size={17} /></span></div><span className="summary-foot">no catálogo</span></article>
            <article className="summary-item"><span className="summary-label">EM NÍVEL CRÍTICO</span><div className="summary-value">{loading ? "—" : summary.critical}<span className="summary-icon danger"><AlertTriangle size={17} /></span></div><span className="summary-foot">abaixo do mínimo</span></article>
            <article className="summary-item"><span className="summary-label">PRECISAM DE ATENÇÃO</span><div className="summary-value">{loading ? "—" : summary.attention}<span className="summary-icon warning"><Clock3 size={17} /></span></div><span className="summary-foot">perto do mínimo</span></article>
            <article className="summary-item"><span className="summary-label">JÁ CONTADAS</span><div className="summary-value">{loading ? "—" : summary.counted}<span className="summary-icon success"><PackageCheck size={17} /></span></div><span className="summary-foot">de {loading ? "—" : summary.total} variações</span></article>
          </section>

          <div className="work-grid">
            <section className="inventory-panel" aria-labelledby="inventory-title">
              <div className="panel-heading">
                <div><h2 id="inventory-title">Variações</h2><p>Posição atual por produto e tamanho</p></div>
                <span className="item-count">{filteredItems.length} itens</span>
              </div>
              <div className="toolbar">
                <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto..." aria-label="Buscar produto" />{search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Limpar busca"><X size={14} /></button>}</label>
                <label className="filter-box"><span className="sr-only">Filtrar por status</span><select value={filter} onChange={(event) => setFilter(event.target.value as "TODOS" | Status)}><option value="TODOS">Todos os status</option><option value="CRITICO">Crítico</option><option value="ATENCAO">Atenção</option><option value="OK">Em dia</option><option value="SEM_CONTAGEM">Sem contagem</option></select><ChevronDown size={15} /></label>
              </div>
              {error && <div className="inline-alert" role="alert"><CircleHelp size={17} /><span>{error}</span><button onClick={() => void loadStock()}>Tentar novamente</button></div>}
              <div className="table-wrap">
                <table>
                  <thead><tr><th>PRODUTO</th><th>ÚLTIMO SALDO</th><th>MÍNIMO</th><th>STATUS</th><th>ATUALIZADO</th><th aria-label="Ação" /></tr></thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.variacaoId} className={selectedId === item.variacaoId ? "selected-row" : ""} onClick={() => { setSelectedId(item.variacaoId); setNotice(""); }}>
                        <td><div className="product-cell"><span className={`product-symbol ${sizeColorClass(item.rotulo)} ${isTrashBag(item.produto) ? "trash-bag-symbol" : ""}`} aria-hidden="true">{isTrashBag(item.produto) ? <ShoppingBag size={17} strokeWidth={1.8} /> : <Package size={17} strokeWidth={1.8} />}</span><span><strong>{item.produto}</strong><small>{item.rotulo} <span className="size-separator">·</span> {item.unidade}</small></span></div></td>
                        <td><strong className={item.saldo === null ? "muted-value" : "stock-value"}>{item.saldo === null ? "—" : item.saldo}</strong><span className="cell-unit">{item.saldo === null ? "aguardando" : item.unidade + "s"}</span></td>
                        <td className="minimum-cell">{item.estoqueMinimo > 0 ? `${item.estoqueMinimo} ${item.unidade}s` : "—"}</td>
                        <td><span className={`status status-${item.status.toLowerCase()}`}><span className="status-dot" />{statusText[item.status]}</span></td>
                        <td className="updated-cell">{formatTime(item.ultimaContagemEm)}</td>
                        <td><button className="row-action" title={`Contar ${item.produto} ${item.rotulo}`} aria-label={`Contar ${item.produto} ${item.rotulo}`} onClick={(event) => { event.stopPropagation(); setSelectedId(item.variacaoId); setNotice(""); document.getElementById("count-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><ArrowUpRight size={16} /></button></td>
                      </tr>
                    ))}
                    {!loading && filteredItems.length === 0 && <tr><td colSpan={6} className="empty-state">Nenhuma variação encontrada.</td></tr>}
                    {loading && items.length === 0 && <tr><td colSpan={6} className="empty-state"><LoaderCircle size={17} className="spinning" /> Carregando estoque...</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-footer"><span><span className="live-dot" /> Atualizado agora</span><button onClick={() => void loadStock()}><RefreshCw size={13} /> Recarregar lista</button></div>
            </section>

            <aside className="count-panel" id="count-form">
              <div className="count-panel-head"><span className="form-icon"><PackageCheck size={18} /></span><div><h2>Nova contagem</h2><p>O registro entra no histórico.</p></div></div>
              <form onSubmit={submitCount}>
                <label className="field-label" htmlFor="variation">PRODUTO E VARIAÇÃO</label>
                <div className="select-wrap"><select id="variation" value={selectedId ?? ""} onChange={(event) => setSelectedId(event.target.value ? Number(event.target.value) : null)} required><option value="" disabled>Selecione uma variação</option>{items.map((item) => <option key={item.variacaoId} value={item.variacaoId}>{item.produto} · {item.rotulo}</option>)}</select><ChevronDown size={16} /></div>
                {selected && <div className="selected-stock"><span className="selected-stock-label"><span className={`product-symbol selected-size-icon ${sizeColorClass(selected.rotulo)} ${isTrashBag(selected.produto) ? "trash-bag-symbol" : ""}`} aria-hidden="true">{isTrashBag(selected.produto) ? <ShoppingBag size={16} strokeWidth={1.8} /> : <Package size={16} strokeWidth={1.8} />}</span><span><small>Variação selecionada</small><strong>{selected.rotulo} · {selected.produto}</strong></span></span><span className="selected-stock-balance"><small>Saldo anterior</small><strong>{selected.saldo === null ? "Sem contagem" : `${selected.saldo} ${selected.unidade}s`}</strong></span></div>}
                <label className="field-label quantity-label" htmlFor="quantity">QUANTIDADE CONTADA</label>
                <div className="quantity-input-wrap"><input id="quantity" type="number" min="0" step="1" inputMode="numeric" placeholder="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /><span>{selected?.unidade ?? "unidades"}</span></div>
                <div className="form-hint"><CircleHelp size={14} /> Use números inteiros. A contagem anterior será mantida no histórico.</div>
                {notice && <div className="success-message" role="status"><CheckCircle2 size={16} />{notice}</div>}
                {error && <div className="form-error" role="alert">{error}</div>}
                <button className="primary-button submit-button" type="submit" disabled={saving || !selected || quantity === ""}>{saving ? <LoaderCircle size={16} className="spinning" /> : <Check size={16} />}{saving ? "Salvando..." : "Salvar contagem"}</button>
              </form>
              <div className="count-footnote"><ArrowDownToLine size={14} /><span>Seu registro atualiza o painel imediatamente.</span></div>
            </aside>
          </div>
          <footer className="page-footer"><span>Progress <span className="footer-separator">·</span> Controle de estoque</span><span>Dados sincronizados com a API <span className="footer-check"><Check size={12} /></span></span></footer>
        </div>
      </section>
    </main>
  );
}