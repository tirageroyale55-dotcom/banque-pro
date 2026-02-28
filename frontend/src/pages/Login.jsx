import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Lock, User } from "lucide-react";

export default function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError(null);

    const data = Object.fromEntries(new FormData(e.target));

    try {
      const res = await api("/auth/login", "POST", data);

      localStorage.setItem("token", res.token);

      if (res.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    }
  };

  return (
    <div className="apply-bg">

      <form className="apply-card login-card" onSubmit={submit} noValidate>

        <h2 className="apply-title">
          Connexion sécurisée
        </h2>

        <p className="login-subtitle">
          Accédez à votre espace client en toute sécurité
        </p>

        {/* IDENTIFIANT */}
        <div className="input-group">
          <User size={18} />
          <input
            name="personalId"
            placeholder="Identifiant personnel"
            required
          />
        </div>

        {/* PIN */}
        <div className="input-group">
          <Lock size={18} />
          <input
            name="pin"
            type="password"
            placeholder="Code PIN"
            required
          />
        </div>

        {/* ERREUR */}
        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {/* ACTION */}
        <button className="btn-solid">
          Se connecter
        </button>

        {/* FOOTER */}
        <div className="login-footer">
          <span onClick={() => navigate("/apply")} className="login-link">
            Ouvrir un compte
          </span>
        </div>

      </form>

    </div>
  );
}