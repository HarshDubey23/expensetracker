import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api";
import "../styles/auth.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await registerUser(form);
      if (res.message === "User Registered") {
        setSuccess("Account created! Redirecting…");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.message || "Registration failed");
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
              <h1 className="auth-title">Create account</h1>
              <p className="auth-subtitle">Start your financial clarity journey</p>
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

            {success && (
              <div className="auth-success">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#34d399" strokeWidth="1.2"/>
                  <path d="M4.5 7l2 2 3-3" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {success}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className={`field-group ${focused === "name" ? "active" : ""} ${form.name ? "filled" : ""}`}>
                <label className="field-label">Full name</label>
                <input className="field-input" type="text" name="name" value={form.name}
                  onChange={handleChange} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} required />
                <div className="field-line" />
              </div>

              <div className={`field-group ${focused === "email" ? "active" : ""} ${form.email ? "filled" : ""}`}>
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" name="email" value={form.email}
                  onChange={handleChange} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} required />
                <div className="field-line" />
              </div>

              <div className={`field-group ${focused === "password" ? "active" : ""} ${form.password ? "filled" : ""}`}>
                <label className="field-label">Password</label>
                <input className="field-input" type="password" name="password" value={form.password}
                  onChange={handleChange} onFocus={() => setFocused("password")} onBlur={() => setFocused("")} required />
                <div className="field-line" />
              </div>

              <button className={`auth-btn ${loading ? "loading" : ""}`} type="submit" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : (
                  <>
                    <span>Create Account</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}