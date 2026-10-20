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
  LogOut,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Status = "SEM_CONTAGEM" | "CRITICO" | "ATENCAO" | "OK";
type User = { id: number; nome: string; email: string; papel: "DONO" | "ESTOQUE" };
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
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"TODOS" | Status>("TODOS");
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minimumDraft, setMinimumDraft] = useState("");
  const [minimumDraftForId, setMinimumDraftForId] = useState<number | null>(null);
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
    const initialLoad = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch(`${API_URL}/auth/me`, { cache: "no-store" });
          if (response.ok) {
            setUser((await response.json()) as User);
            await loadStock();
          }
        } catch {
          setOffline(true);
        } finally {
          setCheckingSession(false);
        }
      })();
    }, 0);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => window.clearTimeout(initialLoad);
  }, []);

  const selected = items.find((item) => item.variacaoId === selectedId) ?? null;
  const minimumValue = selected
    ? minimumDraftForId === selected.variacaoId
      ? minimumDraft
      : String(selected.estoqueMinimo)
    : "";
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
        body: JSON.stringify({ variacaoId: selected.variacaoId, quantidade: Number(quantity) }),
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

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, senha: loginPassword }),
      });
      if (!response.ok) throw new Error("E-mail ou senha inválidos.");
      const result = (await response.json()) as { user: User };
      setUser(result.user);
      setLoginPassword("");
      await loadStock();
    } catch (reason) {
      setLoginError(reason instanceof Error ? reason.message : "Não foi possível entrar.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function logout() {
    await fetch(`${API_URL}/auth/logout`, { method: "POST" }).catch(() => undefined);
    setUser(null);
    setItems([]);
    setSelectedId(null);
    setQuantity("");
  }

  async function submitMinimum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || minimumValue === "") return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/variacoes/${selected.variacaoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estoqueMinimo: Number(minimumValue) }),
      });
      if (!response.ok) throw new Error("Não foi possível atualizar o mínimo.");
      setNotice(`Mínimo de ${selected.produto} ${selected.rotulo} atualizado.`);
      setMinimumDraftForId(null);
      await loadStock();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao atualizar o mínimo.");
    } finally {
      setSaving(false);
    }
  }

  if (checkingSession) {
    return <main className="auth-loading"><LoaderCircle size={22} className="spinning" /><span>Verificando sessão...</span></main>;
  }

  if (!user) {
    return (
      <main className="login-shell">
        <section className="login-panel">
          <Image className="login-logo" src="/logo-progress.png" alt="Progress Bobinas Plásticas" width={1147} height={328} priority />
          <span className="login-eyebrow">CONTROLE DE ESTOQUE</span>
          <h1>Acesse sua operação</h1>
          <p className="login-description">Entre para registrar contagens ou acompanhar a gestão do estoque.</p>
          <form className="login-form" onSubmit={submitLogin}>
            <label htmlFor="login-email">E-mail</label>
            <input id="login-email" type="email" autoComplete="username" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="seu@email.com" required />
            <label htmlFor="login-password">Senha</label>
            <input id="login-password" type="password" autoComplete="current-password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Sua senha" required />
            {loginError && <div className="form-error" role="alert">{loginError}</div>}
            <button className="primary-button login-button" disabled={loginBusy}>{loginBusy ? <LoaderCircle size={16} className="spinning" /> : <UserRound size={16} />}{loginBusy ? "Entrando..." : "Entrar"}</button>
          </form>
          <p className="login-help">Acesso individual para equipe de estoque e gestão.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Progress Bobinas Plásticas, início">
          <Image src="/logo-progress.png" alt="Progress Bobinas Plásticas" width={1147} height={328} priority />
        </a>
        <div className="workspace-label">OPERAÇÃO</div>
        <a className="nav-link active" href="#painel"><Boxes size={18} /> {user.papel === "DONO" ? "Gestão" : "Estoque"}</a>
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
          <div className="session-tools"><span className="session-user"><UserRound size={15} /><span><strong>{user.nome}</strong><small>{user.papel === "DONO" ? "Gestão" : "Estoque"}</small></span></span><button className="icon-button refresh-button" onClick={() => void loadStock()} title="Atualizar estoque" aria-label="Atualizar estoque" disabled={loading}><RefreshCw size={17} className={loading ? "spinning" : ""} /></button><button className="icon-button logout-button" onClick={() => void logout()} title="Sair" aria-label="Sair"><LogOut size={16} /></button></div>
        </header>

        <div className="content" id="painel">
          <div className="page-heading">
            <div>
              <div className="eyebrow">TERÇA-FEIRA, 20 DE OUTUBRO</div>
              <h1>Visão de estoque</h1>
              <p className="subtitle">Acompanhe os níveis e registre uma nova contagem.</p>
            </div>
            {user.papel === "ESTOQUE" && <button className="primary-button heading-action" onClick={() => document.getElementById("count-form")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
              <Plus size={17} /> Nova contagem
            </button>}
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

            {user.papel === "ESTOQUE" ? <aside className="count-panel" id="count-form">
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
            </aside> : <aside className="count-panel owner-panel" id="owner-tools">
              <div className="count-panel-head"><span className="form-icon"><AlertTriangle size={18} /></span><div><h2>Painel da gestão</h2><p>Prioridades e parâmetros do estoque.</p></div></div>
              <div className="owner-alert-heading"><span>ITENS PARA ACOMPANHAR</span><strong>{summary.critical + summary.attention}</strong></div>
              <div className="owner-alert-list">
                {items.filter((item) => item.status === "CRITICO" || item.status === "ATENCAO").map((item) => <button className={`owner-alert-item ${selectedId === item.variacaoId ? "owner-alert-selected" : ""}`} key={item.variacaoId} onClick={() => { setSelectedId(item.variacaoId); setNotice(""); }}><span className={`product-symbol ${sizeColorClass(item.rotulo)} ${isTrashBag(item.produto) ? "trash-bag-symbol" : ""}`}>{isTrashBag(item.produto) ? <ShoppingBag size={15} /> : <Package size={15} />}</span><span className="owner-alert-name"><strong>{item.produto}</strong><small>{item.rotulo} · {item.saldo ?? "Sem contagem"} {item.unidade}s</small></span><span className={`status status-${item.status.toLowerCase()}`}>{statusText[item.status]}</span></button>)}
                {summary.critical + summary.attention === 0 && <div className="owner-clear-state"><CheckCircle2 size={18} /><span>Nenhum item abaixo ou próximo do mínimo.</span></div>}
              </div>
              <form className="minimum-form" onSubmit={submitMinimum}>
                <label className="field-label" htmlFor="minimum-value">ESTOQUE MÍNIMO</label>
                {selected ? <div className="selected-stock owner-selected"><span className="selected-stock-label"><span className={`product-symbol selected-size-icon ${sizeColorClass(selected.rotulo)} ${isTrashBag(selected.produto) ? "trash-bag-symbol" : ""}`}>{isTrashBag(selected.produto) ? <ShoppingBag size={16} /> : <Package size={16} />}</span><span><small>Variação selecionada</small><strong>{selected.rotulo} · {selected.produto}</strong></span></span></div> : <p className="minimum-help">Selecione uma variação na lista para definir o mínimo.</p>}
                <div className="minimum-input-wrap"><input id="minimum-value" type="number" min="0" step="1" value={minimumValue} onChange={(event) => { if (selected) setMinimumDraftForId(selected.variacaoId); setMinimumDraft(event.target.value); }} disabled={!selected} required /><span>{selected?.unidade ?? "caixas"}</span></div>
                {notice && <div className="success-message" role="status"><CheckCircle2 size={16} />{notice}</div>}
                {error && <div className="form-error" role="alert">{error}</div>}
                <button className="primary-button submit-button" type="submit" disabled={saving || !selected || minimumValue === ""}>{saving ? <LoaderCircle size={16} className="spinning" /> : <Check size={16} />}{saving ? "Salvando..." : "Salvar estoque mínimo"}</button>
              </form>
            </aside>}
          </div>
          <footer className="page-footer"><span>Progress <span className="footer-separator">·</span> Controle de estoque</span><span>Dados sincronizados com a API <span className="footer-check"><Check size={12} /></span></span></footer>
        </div>
      </section>
    </main>
  );
}