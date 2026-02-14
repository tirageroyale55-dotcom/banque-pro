import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="nav">
      <h2>BPER BANQUE</h2>
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/profile">Profil</Link>
        <button onClick={logout}>Déconnexion</button>
      </div>
    </nav>
  );
}
