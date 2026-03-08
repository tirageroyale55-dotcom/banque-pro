import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Welcome() {

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(location.state?.user || null);
  
  console.log("USER:", user);
  
  useEffect(() => {

    // si user venant du login
    if (location.state?.user) {
      localStorage.setItem("user", JSON.stringify(location.state.user));
      setUser(location.state.user);
      return;
    }

    // sinon on regarde dans le localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }

  }, [location.state, navigate]);

  if (!user) return null;

  return (
    <div className="apply-bg welcome-page">

      <div className="apply-card welcome-card">

        <h2 className="welcome-title">
          Bienvenue {user.prenom}
        </h2>

        <button
          className="btn-solid welcome-btn"
          onClick={() => navigate("/dashboard")}
        >
          Entrer
        </button>

      </div>

    </div>
  );
}