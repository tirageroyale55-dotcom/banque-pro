import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Welcome() {

  const navigate = useNavigate();
  const location = useLocation();

  console.log("location.state:", location.state);
  
  const user =
    location.state?.user ||
    JSON.parse(localStorage.getItem("user"));
    
    console.log("user:", user);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

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