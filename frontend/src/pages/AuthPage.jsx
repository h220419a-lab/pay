import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

const initialForm = { fullName: "", email: "", password: "" };

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const result = await api(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      login(result);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Buyer Access</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">Register or sign in before checkout so your cart and orders can be linked to your account.</p>

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <input
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <p className="error-banner">{error}</p>}

          <button className="primary-button" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <button className="link-button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Register" : "Already registered? Login"}
        </button>
      </div>
    </section>
  );
}
