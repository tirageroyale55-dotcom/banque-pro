import { useEffect, useState } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

export default function Transactions() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api("/transactions", "GET", null, localStorage.getItem("token"))
      .then(setList);
  }, []);

  return (
    <>
      <Navbar />
      <div className="card">
        <h2>Transactions</h2>
        {list.map(t => (
          <div key={t._id}>
            {t.label} — {t.amount} €
          </div>
        ))}
      </div>
    </>
  );
}


