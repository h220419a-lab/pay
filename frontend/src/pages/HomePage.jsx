import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";

const pendingOrderKey = "paynow-market-pending-order";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [message, setMessage] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCart, setLoadingCart] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role === "Admin") {
      setCart({ items: [], total: 0 });
      return;
    }

    loadCart();
  }, [isAuthenticated, token, user?.role]);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = cart.total > 0 ? 6 : 0;
  const checkoutTotal = cart.total + deliveryFee;

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const result = await api("/products");
      setProducts(result);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadCart() {
    setLoadingCart(true);
    try {
      const result = await api("/cart", {}, token);
      setCart(result);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingCart(false);
    }
  }

  async function addToCart(productId) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role === "Admin") {
      setMessage("Admin accounts can review activity, but only customer accounts can shop.");
      return;
    }

    try {
      const result = await api(
        "/cart",
        {
          method: "POST",
          body: JSON.stringify({ productId, quantity: 1 })
        },
        token
      );
      setCart(result);
      setMessage("Item added to your cart.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateQuantity(id, quantity) {
    try {
      const result = await api(
        `/cart/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ quantity })
        },
        token
      );
      setCart(result);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeItem(id) {
    try {
      const result = await api(`/cart/${id}`, { method: "DELETE" }, token);
      setCart(result);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function checkout(event) {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (cart.items.length === 0) {
      setMessage("Add at least one product before starting checkout.");
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const result = await api(
        "/orders/checkout",
        {
          method: "POST",
          body: JSON.stringify({ notes })
        },
        token
      );

      sessionStorage.setItem(
        pendingOrderKey,
        JSON.stringify({
          orderId: result.orderId,
          reference: result.reference
        })
      );

      window.location.href = result.redirectUrl;
    } catch (error) {
      setMessage(error.message);
      setProcessing(false);
    }
  }

  return (
    <div className="storefront">
      <section className="hero-panel">
        <div className="hero-copy-block">
          <p className="eyebrow">PayNow Mobile Store</p>
          <div className="hero-stats">
            <div className="stat-chip">
              <strong>{products.length}</strong>
              <span>Products</span>
            </div>
            <div className="stat-chip">
              <strong>{itemCount}</strong>
              <span>Cart Items</span>
            </div>
            <div className="stat-chip">
              <strong>${checkoutTotal.toFixed(2)}</strong>
              <span>Checkout Total</span>
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid three-column-layout">
        <section className="catalog-column">
          <div className="section-header">
            <div>
              <p className="eyebrow">Store Catalog</p>
              <h2 id="catalog">Featured items</h2>
            </div>
          </div>

          {loadingProducts ? (
            <div className="cart-panel">
              <p className="muted">Loading products...</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="product-body">
                    <p className="eyebrow">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p className="accent-copy">
                      {product.inStock ? "Available for checkout" : "Out of stock"}
                    </p>
                    <p className="muted">{product.description}</p>
                    <div className="product-footer">
                      <strong>${product.price.toFixed(2)}</strong>
                      <button
                        className="primary-button"
                        disabled={!product.inStock}
                        onClick={() => addToCart(product.id)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="cart-column">
          <section className="cart-panel" id="cart">
            <div className="section-header compact">
              <div>
                <p className="eyebrow">Cart Summary</p>
                <h2>Your basket</h2>
              </div>
              <span className="paynow-badge">{itemCount} items</span>
            </div>

            {isAuthenticated && user?.role !== "Admin" ? (
              <>
                <div className="cart-list">
                  {loadingCart && <p className="muted">Loading your cart...</p>}
                  {!loadingCart && cart.items.length === 0 && (
                    <p className="muted">Your cart is empty. Add products from the catalog to continue.</p>
                  )}

                  {cart.items.map((item) => (
                    <div className="cart-row" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p className="muted">${item.price.toFixed(2)} each</p>
                      </div>

                      <div className="cart-actions">
                        <button
                          className="ghost-button icon-button"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <span className="qty-pill">{item.quantity}</span>
                        <button
                          className="ghost-button icon-button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button className="link-button" onClick={() => removeItem(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="totals-card">
                  <div className="cart-total">
                    <span>Subtotal</span>
                    <strong>${cart.total.toFixed(2)}</strong>
                  </div>
                  <div className="cart-total">
                    <span>Delivery</span>
                    <strong>${deliveryFee.toFixed(2)}</strong>
                  </div>
                  <div className="cart-total grand-total">
                    <span>Total</span>
                    <strong>${checkoutTotal.toFixed(2)}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state-card">
                <p className="muted">
                  {user?.role === "Admin"
                    ? "Admin accounts do not maintain a shopping cart."
                    : "Login as a customer to build a cart and check out."}
                </p>
                {!isAuthenticated && (
                  <Link className="primary-button anchor-button" to="/login">
                    Login
                  </Link>
                )}
              </div>
            )}
          </section>
        </aside>

        <aside className="paynow-column">
          <section className="checkout-panel" id="checkout">
            <div className="section-header compact">
              <div>
                <p className="eyebrow">Checkout Access</p>
                <h2>{isAuthenticated ? "Customer checkout" : "Sign in required"}</h2>
              </div>
            </div>

            {isAuthenticated ? (
              user?.role === "Admin" ? (
                <div className="empty-state-card">
                  <p className="muted">
                    You are signed in as an admin. Open the admin dashboard to review customer carts and payments.
                  </p>
                  <Link className="primary-button anchor-button" to="/admin">
                    Open admin dashboard
                  </Link>
                </div>
              ) : (
                <form className="checkout-form" onSubmit={checkout}>
                  <div className="gateway-card">
                    <p className="eyebrow">Logged In Customer</p>
                    <strong>{user.fullName}</strong>
                    <p className="muted">{user.email}</p>
                  </div>

                  <textarea
                    placeholder="Order notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows="5"
                  />

                  <div className="gateway-card">
                    <p className="eyebrow">Payment Gateway</p>
                    <strong>PayNow redirect checkout</strong>
                    <p className="muted">
                      Your cart and payment record will be linked to your customer account for admin review.
                    </p>
                  </div>

                  {message && <p className="info-banner">{message}</p>}

                  <button className="primary-button wide-button" disabled={processing || loadingCart}>
                    {processing ? "Preparing PayNow payment..." : "Proceed to PayNow"}
                  </button>
                </form>
              )
            ) : (
              <div className="empty-state-card">
                <p className="muted">
                  Customers must sign in before adding products to cart and checking out with PayNow.
                </p>
                <Link className="primary-button anchor-button" to="/login">
                  Customer login
                </Link>
              </div>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}
