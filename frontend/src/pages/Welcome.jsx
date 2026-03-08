import { useLocation, useNavigate } from "react-router-dom";


import { useEffect, useState } from "react";

export default function Welcome() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="welcome-page">
      <h1>Bienvenue {user.prenom}</h1>
    </div>
  );
}