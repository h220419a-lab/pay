import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

const pendingOrderKey = "paynow-market-pending-order";

export default function PaymentReturnPage() {
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("Refreshing the latest PayNow status...");
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "Admin") {
      loadOrder();
    }
  }, [isAuthenticated, token, user?.role]);

  async function loadOrder() {
    const pendingOrder = readPendingOrder();
    if (!pendingOrder?.orderId) {
      setMessage("No pending order was found for this payment return.");
      setLoading(false);
      return;
    }

    try {
      const refreshed = await api(`/orders/${pendingOrder.orderId}/refresh-status`, { method: "POST" }, token);
      setOrder(refreshed);
      setMessage("Payment status refreshed from PayNow.");
      clearPendingOrder();
    } catch (error) {
      try {
        const fallback = await api(`/orders/${pendingOrder.orderId}`, {}, token);
        setOrder(fallback);
        setMessage(error.message);
      } catch (fallbackError) {
        setMessage(fallbackError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function readPendingOrder() {
    const raw = sessionStorage.getItem(pendingOrderKey);
    return raw ? JSON.parse(raw) : null;
  }

  function clearPendingOrder() {
    sessionStorage.removeItem(pendingOrderKey);
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="return-shell">
      <div className="return-card">
        <p className="eyebrow">Payment Return Page</p>
        <h1>PayNow checkout completed</h1>
        <p className="muted">
          Your customer account keeps the cart, order, and payment status linked together for both you and the admin dashboard.
        </p>

        {order && (
          <>
            <div className="return-grid">
              <div className="detail-card">
                <span className="detail-label">Reference</span>
                <strong>{order.reference}</strong>
              </div>
              <div className="detail-card">
                <span className="detail-label">Order Status</span>
                <strong>{order.status}</strong>
              </div>
              <div className="detail-card">
                <span className="detail-label">Payment Status</span>
                <strong>{order.paymentStatus}</strong>
              </div>
              <div className="detail-card">
                <span className="detail-label">Amount</span>
                <strong>${order.totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            <div className="summary-box">
              <p className="eyebrow">Order Items</p>
              {order.items.map((item) => (
                <p key={`${order.reference}-${item.productName}`}>
                  {item.quantity} x {item.productName} @ ${item.unitPrice.toFixed(2)}
                </p>
              ))}
            </div>
          </>
        )}

        <div className="info-banner">{loading ? "Refreshing status..." : message}</div>

        <div className="inline-actions">
          <Link className="primary-button anchor-button" to="/">
            Back to store
          </Link>
          <Link className="ghost-button anchor-button" to="/orders">
            View orders
          </Link>
        </div>
      </div>
    </section>
  );
}
