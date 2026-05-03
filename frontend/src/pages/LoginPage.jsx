import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });

      login(result);
      navigate(result.user.role === "Admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-shell auth-page-layout">
      <div className="auth-feature-card">
        <p className="eyebrow">System Login</p>
        <h1>Sign in to continue</h1>
        <p className="muted">
          Customers can manage carts and PayNow purchases. Administrators can manage products and monitor user activity.
        </p>
        <div className="auth-feature-list">
          <div className="feature-pill">Customer cart and checkout</div>
          <div className="feature-pill">Administrator monitoring</div>
          <div className="feature-pill">PayNow order tracking</div>
        </div>
      </div>

      <div className="auth-card auth-form-card">
        <p className="eyebrow">Login Page</p>
        <h2>Account access</h2>

        <form onSubmit={submit} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />

          {error && <p className="error-banner">{error}</p>}

          <button className="primary-button wide-button" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="muted">
          Need a customer account? <Link className="text-link" to="/register">Create one here</Link>
        </p>
      </div>
    </section>
  );
}
