import { useEffect, useState } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
  api("/client/dashboard")
    .then(setData)
    .catch(() => {
      localStorage.removeItem("token");
      window.location = "/login";
    });
}, []);


  if (!data) return null;

  return (
    <>
      <Navbar />
      <div className="card">
        <h2>Solde</h2>
        <h1>{data.balance} €</h1>
        <p>IBAN : {data.iban}</p>
      </div>
    </>
  );
}
