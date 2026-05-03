import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="brand brand-block">
        <span className="brand-mark">PM</span>
        <span className="brand-copy">
          <span className="brand-name">PayNow Market</span>
          <span className="brand-tagline">Smartphone storefront and gateway</span>
        </span>
      </Link>

      <nav className="navlinks">
        <NavLink to="/">Store</NavLink>
        {isAuthenticated && user?.role !== "Admin" && <NavLink to="/orders">Orders</NavLink>}
        {user?.role === "Admin" && <NavLink to="/admin">Admin</NavLink>}
        {!isAuthenticated && <NavLink to="/login">Login</NavLink>}
        {!isAuthenticated && <NavLink to="/register">Register</NavLink>}
      </nav>

      <div className="userbox">
        {isAuthenticated ? (
          <>
            <div className="user-meta">
              <strong>{user.fullName}</strong>
              <span>{user.email}</span>
            </div>
            <span className="paynow-badge">{user.role}</span>
            <button className="ghost-button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <div className="user-meta">
              <strong>Guest access</strong>
              <span>Customer checkout requires login</span>
            </div>
            <span className="paynow-badge">PayNow Ready</span>
          </>
        )}
      </div>
    </header>
  );
}
