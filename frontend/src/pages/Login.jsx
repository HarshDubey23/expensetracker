import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginUser(form);
      if (res.token) {
        localStorage.setItem("token", res.token);
        navigate("/dashboard");
      } else {
        setError(res.message || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-root">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="auth-container">
        <div className="auth-brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" stroke="url(#g1)" strokeWidth="1.5" fill="none"/>
              <path d="M14 7L21 11V17L14 21L7 17V11L14 7Z" fill="url(#g2)" opacity="0.4"/>
              <defs>
                <linearGradient id="g1" x1="2" y1="2" x2="26" y2="26">
                  <stop offset="0%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#60a5fa"/>
                </linearGradient>
                <linearGradient id="g2" x1="7" y1="7" x2="21" y2="21">
                  <stop offset="0%" stopColor="#a78bfa"/>
                  <stop offset="100%" stopColor="#60a5fa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="brand-name">Ledger</span>
        </div>

        <div className="auth-card">
          <div className="auth-card-inner">
            <div className="auth-header">
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to continue tracking</p>
            </div>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.2"/>
                  <path d="M7 4v3M7 9.5v.5" stroke="#f87171" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className={`field-group ${focused === "email" ? "active" : ""} ${form.email ? "filled" : ""}`}>
                <label className="field-label">Email address</label>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  required
                />
                <div className="field-line" />
              </div>

              <div className={`field-group ${focused === "password" ? "active" : ""} ${form.password ? "filled" : ""}`}>
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  required
                />
                <div className="field-line" />
              </div>

              <button className={`auth-btn ${loading ? "loading" : ""}`} type="submit" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : (
                  <>
                    <span>Sign In</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer-text">
              No account yet?{" "}
              <Link to="/register" className="auth-link">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}