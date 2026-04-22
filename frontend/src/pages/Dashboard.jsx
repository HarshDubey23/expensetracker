import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getExpenses, addExpense, deleteExpense, getTotal } from "../api";
import "../styles/dashboard.css";

const CATEGORY_META = {
  Food:     { icon: "🍜", color: "#f97316" },
  Travel:   { icon: "✈️", color: "#60a5fa" },
  Bills:    { icon: "⚡", color: "#a78bfa" },
  Shopping: { icon: "🛍️", color: "#f472b6" },
  Other:    { icon: "◆",  color: "#94a3b8" },
};

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const [expenses, setExpenses]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [form, setForm]           = useState({ title: "", amount: "", category: "Other" });
  const [formError, setFormError] = useState("");
  const [filter, setFilter]       = useState("All");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [exp, tot] = await Promise.all([getExpenses(), getTotal()]);
      setExpenses(Array.isArray(exp) ? exp : []);
      setTotal(tot.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return setFormError("Please fill all fields.");
    setAdding(true); setFormError("");
    try {
      await addExpense({ ...form, amount: parseFloat(form.amount) });
      setForm({ title: "", amount: "", category: "Other" });
      setDrawerOpen(false);
      await fetchData();
    } catch {
      setFormError("Failed to add expense.");
    }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setTimeout(async () => {
      await deleteExpense(id);
      await fetchData();
      setDeleteId(null);
    }, 400);
  };

  const filtered = filter === "All" ? expenses : expenses.filter((e) => e.category === filter);

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const userName = (() => {
    try {
      const payload = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));
      return payload.name || "User";
    } catch { return "User"; }
  })();

  return (
    <div className="dash-root">
      <div className="dash-bg">
        <div className="dash-orb dash-orb-1" />
        <div className="dash-orb dash-orb-2" />
        <div className="dash-grid" />
      </div>

      {/* ── Navbar ── */}
      <nav className="dash-nav">
        <div className="nav-brand">
          <div className="brand-icon-sm">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="url(#gn)" strokeWidth="1.5" fill="none"/>
              <path d="M14 7L21 11V17L14 21L7 17V11L14 7Z" fill="url(#gn2)" opacity="0.5"/>
              <defs>
                <linearGradient id="gn"  x1="2" y1="2" x2="26" y2="26"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient>
                <linearGradient id="gn2" x1="7" y1="7" x2="21" y2="21"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient>
              </defs>
            </svg>
          </div>
          <span className="nav-brand-name">Ledger</span>
        </div>
        <div className="nav-right">
          <button className="nav-add-btn" onClick={() => setDrawerOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span>Add Expense</span>
          </button>
          <button className="nav-logout" onClick={handleLogout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </nav>

      <main className="dash-main">
        {/* ── Hero ── */}
        <section className="dash-hero">
          <div className="hero-greeting">
            <p className="greeting-label">Good day</p>
            <h1 className="greeting-name">{userName}</h1>
          </div>
          <div className="total-card">
            <div className="total-card-inner">
              <div className="total-header">
                <span className="total-label">Total Spent</span>
                <div className="total-badge">this period</div>
              </div>
              <div className="total-amount">
                {loading ? <div className="skeleton skeleton-lg" /> : formatCurrency(total)}
              </div>
              <div className="total-sub">{expenses.length} transactions recorded</div>
              <div className="total-glow" />
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        {!loading && topCategories.length > 0 && (
          <section className="stats-section">
            <h2 className="section-label">Breakdown</h2>
            <div className="stats-grid">
              {topCategories.map(([cat, amt]) => {
                const pct  = total > 0 ? Math.round((amt / total) * 100) : 0;
                const meta = CATEGORY_META[cat] || CATEGORY_META.Other;
                return (
                  <div key={cat} className="stat-card" onClick={() => setFilter(cat === filter ? "All" : cat)}>
                    <div className="stat-icon" style={{ "--cat-color": meta.color }}>{meta.icon}</div>
                    <div className="stat-info">
                      <span className="stat-name">{cat}</span>
                      <span className="stat-amount">{formatCurrency(amt)}</span>
                    </div>
                    <div className="stat-bar-wrap">
                      <div className="stat-bar" style={{ width: `${pct}%`, background: meta.color }} />
                    </div>
                    <span className="stat-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── List ── */}
        <section className="list-section">
          <div className="list-header">
            <h2 className="section-label">Transactions</h2>
            <div className="filter-pills">
              {["All", "Food", "Travel", "Bills", "Shopping", "Other"].map((cat) => (
                <button key={cat} className={`filter-pill ${filter === cat ? "active" : ""}`}
                  onClick={() => setFilter(cat)}>{cat}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="list-skeleton">
              {[1,2,3,4].map((i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton skeleton-circle" />
                  <div className="skeleton-lines">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-sub" />
                  </div>
                  <div className="skeleton skeleton-amount" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <p className="empty-title">No transactions yet</p>
              <p className="empty-sub">Add your first expense to get started</p>
              <button className="empty-btn" onClick={() => setDrawerOpen(true)}>Add Expense</button>
            </div>
          ) : (
            <div className="expense-list">
              {filtered.map((exp, i) => {
                const meta = CATEGORY_META[exp.category] || CATEGORY_META.Other;
                return (
                  <div key={exp._id}
                    className={`expense-row ${deleteId === exp._id ? "deleting" : ""}`}
                    style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="exp-icon-wrap" style={{ "--cat-color": meta.color }}>
                      <span className="exp-icon">{meta.icon}</span>
                    </div>
                    <div className="exp-info">
                      <span className="exp-title">{exp.title}</span>
                      <span className="exp-meta">
                        <span className="exp-cat">{exp.category}</span>
                        <span className="exp-dot">·</span>
                        <span className="exp-date">
                          {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </span>
                    </div>
                    <span className="exp-amount">{formatCurrency(exp.amount)}</span>
                    <button className="exp-delete" onClick={() => handleDelete(exp._id)} title="Delete">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ── Drawer ── */}
      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div>
            <h2 className="drawer-title">New Expense</h2>
            <p className="drawer-sub">Record a transaction</p>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {formError && <div className="form-error">{formError}</div>}

        <form className="drawer-form" onSubmit={handleAdd}>
          <div className="drawer-field">
            <label className="drawer-label">What did you spend on?</label>
            <input className="drawer-input" type="text" placeholder="e.g. Dinner at Taj"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="drawer-field">
            <label className="drawer-label">Amount (₹)</label>
            <input className="drawer-input" type="number" placeholder="0.00" min="1"
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div className="drawer-field">
            <label className="drawer-label">Category</label>
            <div className="cat-grid">
              {Object.entries(CATEGORY_META).map(([cat, meta]) => (
                <button key={cat} type="button"
                  className={`cat-chip ${form.category === cat ? "active" : ""}`}
                  style={{ "--cat-color": meta.color }}
                  onClick={() => setForm({ ...form, category: cat })}>
                  <span>{meta.icon}</span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
          <button className={`drawer-submit ${adding ? "loading" : ""}`} type="submit" disabled={adding}>
            {adding ? <span className="btn-spinner" /> : "Record Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}