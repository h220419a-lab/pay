import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

const initialProductForm = {
  id: "",
  name: "",
  description: "",
  category: "",
  imageUrl: "",
  price: ""
};

export default function AdminPage() {
  const { token, user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [removeId, setRemoveId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadDashboard(), loadProducts()]).finally(() => setLoading(false));
  }, []);

  async function loadDashboard() {
    try {
      const result = await api("/admin/dashboard", {}, token);
      setDashboard(result);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadProducts() {
    try {
      const result = await api("/admin/products", {}, token);
      setProducts(result);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function refreshAll() {
    setMessage("");
    await Promise.all([loadDashboard(), loadProducts()]);
  }

  async function submitProduct(event) {
    event.preventDefault();
    setMessage("");

    try {
      await api(
        "/admin/products",
        {
          method: "POST",
          body: JSON.stringify({
            id: Number(productForm.id),
            name: productForm.name,
            description: productForm.description,
            category: productForm.category,
            imageUrl: productForm.imageUrl,
            price: Number(productForm.price)
          })
        },
        token
      );

      setProductForm(initialProductForm);
      setMessage("Product saved successfully.");
      await refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeProduct(event) {
    event.preventDefault();
    setMessage("");

    try {
      await api(`/admin/products/${Number(removeId)}`, { method: "DELETE" }, token);
      setRemoveId("");
      setMessage("Product removed from the customer catalog.");
      await refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteCustomer(customerId, customerName) {
    const confirmed = window.confirm(`Delete customer ${customerName}? This will remove the account, cart items, and order history.`);
    if (!confirmed) {
      return;
    }

    setMessage("");
    try {
      await api(`/admin/customers/${customerId}`, { method: "DELETE" }, token);
      setMessage("Customer deleted successfully.");
      await refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="admin-shell admin-page-layout">
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Administrator Main Page</p>
          <h1>Welcome, {user.fullName}</h1>
          <p className="muted">
            Add products, remove products, and monitor customer logins, carts, and payments from one place.
          </p>
        </div>
        <button className="primary-button" onClick={refreshAll}>Refresh all data</button>
      </section>

      {message && <p className="info-banner">{message}</p>}

      <section className="admin-tools-grid">
        <form className="admin-tool-card" onSubmit={submitProduct}>
          <p className="eyebrow">Add Or Update Product</p>
          <div className="form-split">
            <input
              placeholder="Id"
              value={productForm.id}
              onChange={(event) => setProductForm({ ...productForm, id: event.target.value })}
              required
            />
            <input
              placeholder="Price"
              value={productForm.price}
              onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
              required
            />
          </div>
          <input
            placeholder="Name"
            value={productForm.name}
            onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={productForm.description}
            onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
            rows="4"
            required
          />
          <input
            placeholder="Category"
            value={productForm.category}
            onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
            required
          />
          <input
            placeholder="Image URL"
            value={productForm.imageUrl}
            onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
            required
          />
          <button className="primary-button wide-button">Save product</button>
        </form>

        <form className="admin-tool-card" onSubmit={removeProduct}>
          <p className="eyebrow">Remove Product</p>
          <input
            placeholder="Enter product id"
            value={removeId}
            onChange={(event) => setRemoveId(event.target.value)}
            required
          />
          <button className="ghost-button wide-button">Remove from catalog</button>
          <p className="muted">
            Removing a product hides it from the customer catalog while keeping past order history intact.
          </p>
        </form>
      </section>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Total customers</span>
          <strong>{dashboard?.totalUsers ?? 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Active carts</span>
          <strong>{dashboard?.activeCarts ?? 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Total orders</span>
          <strong>{dashboard?.totalOrders ?? 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Paid amount</span>
          <strong>${dashboard ? dashboard.totalPayments.toFixed(2) : "0.00"}</strong>
        </article>
      </section>

      <section className="admin-tool-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Product Catalog</p>
            <h2>Current products</h2>
          </div>
        </div>

        <div className="product-admin-list">
          {products.map((product) => (
            <div className="product-admin-row" key={product.id}>
              <strong>{product.id}</strong>
              <span>{product.name}</span>
              <span>{product.category}</span>
              <span>${product.price.toFixed(2)}</span>
              <span>{product.inStock ? "Active" : "Removed"}</span>
            </div>
          ))}
          {!loading && products.length === 0 && <p className="muted">No products found.</p>}
        </div>
      </section>

      <div className="admin-users">
        {dashboard?.users.map((customer) => (
          <article className="admin-user-card" key={customer.id}>
            <div className="admin-user-header">
              <div>
                <strong>{customer.fullName}</strong>
                <p className="muted">{customer.email}</p>
              </div>
              <div className="admin-header-actions">
                <div className="status-pills">
                  <span>{customer.role}</span>
                  <span>
                    {customer.lastLoginAtUtc
                      ? new Date(customer.lastLoginAtUtc).toLocaleString()
                      : "Not logged in yet"}
                  </span>
                </div>
                {customer.role === "Customer" && (
                  <button
                    className="ghost-button danger-button"
                    onClick={() => deleteCustomer(customer.id, customer.fullName)}
                  >
                    Delete customer
                  </button>
                )}
              </div>
            </div>

            <div className="admin-columns">
              <section className="admin-section-card">
                <p className="eyebrow">Items Added To Cart</p>
                {customer.cartItems.length === 0 ? (
                  <p className="muted">No cart items.</p>
                ) : (
                  customer.cartItems.map((item) => (
                    <p key={item.id}>
                      {item.quantity} x {item.productName} @ ${item.unitPrice.toFixed(2)}
                    </p>
                  ))
                )}
              </section>

              <section className="admin-section-card">
                <p className="eyebrow">Payments Made</p>
                {customer.orders.length === 0 ? (
                  <p className="muted">No orders yet.</p>
                ) : (
                  customer.orders.map((order) => (
                    <div className="admin-order-row" key={order.id}>
                      <strong>{order.reference}</strong>
                      <p className="muted">
                        {order.status} / {order.paymentStatus} / ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </section>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
