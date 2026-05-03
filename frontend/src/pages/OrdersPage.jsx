import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const result = await api("/orders", {}, token);
    setOrders(result);
  }

  async function refreshStatus(id) {
    setMessage("");
    try {
      const updated = await api(`/orders/${id}/refresh-status`, { method: "POST" }, token);
      setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
      setMessage(`Order ${updated.reference} status refreshed.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section className="orders-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Order History</p>
          <h1>Track your Paynow payments</h1>
        </div>
        {message && <p className="info-banner">{message}</p>}
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-top">
              <div>
                <strong>{order.reference}</strong>
                <p>{new Date(order.createdAtUtc).toLocaleString()}</p>
              </div>
              <div className="status-pills">
                <span>{order.status}</span>
                <span>{order.paymentStatus}</span>
              </div>
            </div>
            <div className="order-items">
              {order.items.map((item) => (
                <p key={`${order.id}-${item.productName}`}>{item.quantity} x {item.productName} @ ${item.unitPrice.toFixed(2)}</p>
              ))}
            </div>
            <div className="order-bottom">
              <strong>${order.totalAmount.toFixed(2)}</strong>
              <div className="inline-actions">
                {order.redirectUrl && (
                  <a className="ghost-button anchor-button" href={order.redirectUrl} target="_blank" rel="noreferrer">
                    Open payment page
                  </a>
                )}
                <button className="primary-button" onClick={() => refreshStatus(order.id)}>
                  Refresh status
                </button>
              </div>
            </div>
          </article>
        ))}
        {orders.length === 0 && <p className="muted">No orders yet. Your successful checkouts will appear here.</p>}
      </div>
    </section>
  );
}
