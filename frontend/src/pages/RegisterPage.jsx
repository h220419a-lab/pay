import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  name: "",
  surname: "",
  email: "",
  password: "",
  paynowIntegrationId: "",
  paynowIntegrationKey: ""
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");

    const hasEmptyField = Object.values(form).some((value) => !value.trim());
    if (hasEmptyField) {
      setError("Please fill in all registration textboxes before submitting.");
      return;
    }

    setLoading(true);

    try {
      const result = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
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
    <section className="auth-shell auth-page-layout">
      <div className="auth-feature-card">
        <p className="eyebrow">Registration</p>
        <h1>Create a customer account</h1>
        <p className="muted">
          Register with your personal details and customer PayNow credentials so your shopping and payment records remain linked to your account.
        </p>
        <div className="auth-note-card">
          <strong>Customer fields only</strong>
          <p>The PayNow integration ID and key on this page are for customer registration only, as requested.</p>
        </div>
      </div>

      <div className="auth-card auth-form-card">
        <p className="eyebrow">Registration Form</p>
        <h2>Customer details</h2>

        <form onSubmit={submit} className="auth-form">
          <div className="form-split">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <input
              placeholder="Surname"
              value={form.surname}
              onChange={(event) => setForm({ ...form, surname: event.target.value })}
              required
            />
          </div>

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
          <input
            placeholder="PayNow Integration ID"
            value={form.paynowIntegrationId}
            onChange={(event) => setForm({ ...form, paynowIntegrationId: event.target.value })}
            required
          />
          <input
            placeholder="PayNow Integration Key"
            value={form.paynowIntegrationKey}
            onChange={(event) => setForm({ ...form, paynowIntegrationKey: event.target.value })}
            required
          />

          {error && <p className="error-banner">{error}</p>}

          <button className="primary-button wide-button" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="muted">
          Already registered? <Link className="text-link" to="/login">Go to login</Link>
        </p>
      </div>
    </section>
  );
}
