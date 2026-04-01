import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/AdminClient.css"; 

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api("/admin/clients").then(setClients);
  }, []);

  const loadClient = (id) => {
    api("/admin/client-full/" + id).then(setSelected);
  };

  return (
    <div className="bper-admin-wrapper"> {/* TOUT EST ENFERMÉ ICI */}
      <aside className="sidebar-admin">
        <div className="admin-title">Gestion Clients</div>
        {clients.map(c => (
          <div 
            key={c._id} 
            className={`client-item-admin ${selected?.user._id === c._id ? 'active-client' : ''}`}
            onClick={() => loadClient(c._id)}
          >
            <b>{c.nom} {c.prenom}</b>
            <div style={{fontSize: '0.8em', color: '#666'}}>{c.status}</div>
          </div>
        ))}
      </aside>

      <main className="main-admin-content">
        {selected ? (
          <div>
            <h1>Dossier Client</h1>
            <div className="admin-grid">
              <section className="admin-card-info">
                <h3>Identité</h3>
                <p><b>Nom:</b> {selected.user.nom} {selected.user.prenom}</p>
                <p><b>Email:</b> {selected.user.email}</p>
              </section>

              <section className="admin-card-info">
                <h3>Compte & Solde</h3>
                <p><b>IBAN:</b> {selected.account?.iban}</p>
                <p><b>Solde:</b> {selected.account?.balance} €</p>
                <button className={`btn-admin-action ${selected.account?.status === 'ACTIVE' ? 'btn-block' : 'btn-activate'}`}>
                   {selected.account?.status === "BLOCKED" ? "Activer" : "Bloquer"}
                </button>
              </section>
            </div>

            <section className="admin-card-info" style={{marginTop: '20px'}}>
              <h3>Transactions récentes</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.transactions?.map(t => (
                    <tr key={t._id}>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>{t.label}</td>
                      <td style={{color: t.type === 'CREDIT' ? 'green' : 'red'}}>
                        {t.type === 'CREDIT' ? '+' : '-'}{t.amount}€
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        ) : (
          <div className="empty-state-admin">Sélectionnez un client dans la liste de gauche.</div>
        )}
      </main>
    </div>
  );
}