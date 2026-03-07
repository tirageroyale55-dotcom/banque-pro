import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="nav">
      
      <div>
        <Link to="/dashboard">Dashboard</Link>
        
      </div>
    </nav>
  );
}
