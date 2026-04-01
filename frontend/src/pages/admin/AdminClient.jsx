import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/AdminClient.css"; 

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nom: "", prenom: "", email: "", balance: 0 });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    api("/admin/clients").then(setClients).catch(console.error);
  };

  const loadFullDetails = async (id) => {
    try {
      const data = await api("/admin/client-full/" + id);
      setSelected(data);
      setEditForm({
        nom: data.user.nom,
        prenom: data.user.prenom,
        email: data.user.email,
        balance: data.account?.balance || 0
      });
      setIsEditing(false);
    } catch (err) {
      alert("Erreur chargement détails");
    }
  };

  const handleUpdate = async () => {
    try {
      await api("/admin/client-update/" + selected.user._id, "PUT", editForm);
      alert("Données mises à jour !");
      loadFullDetails(selected.user._id);
    } catch (err) {
      alert("Erreur lors de la modification");
    }
  };

  const toggleAccount = async () => {
    const action = selected.account.status === "BLOCKED" ? "activate" : "block";
    await api(`/admin/account/${action}/${selected.account._id}`, "POST");
    loadFullDetails(selected.user._id);
  };

  const toggleCard = async () => {
    const action = selected.card.status === "active" ? "block" : "activate";
    await api(`/admin/card/${action}/${selected.card._id}`, "POST");
    loadFullDetails(selected.user._id);
  };

  return (
    <div className="admin-client-wrapper"> {/* Classe isolante */}
      <div className="admin-sidebar">
        <h2 className="admin-title">Clients</h2>
        <div className="admin-list-scroll">
          {clients.map(c => (
            <div 
              key={c._id} 
              className={`admin-item-card ${selected?.user._id === c._id ? 'active' : ''}`}
              onClick={() => loadFullDetails(c._id)}
            >
              <p>{c.nom} {c.prenom}</p>
              <span className={`status-dot ${c.status}`}></span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-main-content">
        {selected ? (
          <div className="admin-detail-view">
            <div className="admin-header-actions">
              <h1>Dossier : {selected.user.nom}</h1>
              <button className="btn-edit-mode" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Annuler" : "Modifier Infos"}
              </button>
            </div>

            <div className="admin-grid">
              {/* Infos Personnelles */}
              <div className="admin-box">
                <h3>Identité</h3>
                {isEditing ? (
                  <div className="admin-form">
                    <input type="text" value={editForm.nom} onChange={e => setEditForm({...editForm, nom: e.target.value})} />
                    <input type="text" value={editForm.prenom} onChange={e => setEditForm({...editForm, prenom: e.target.value})} />
                    <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                ) : (
                  <div className="admin-info-text">
                    <p><b>Email:</b> {selected.user.email}</p>
                    <p><b>Status:</b> {selected.user.status}</p>
                    <p><b>Tél:</b> {selected.user.telephone}</p>
                  </div>
                )}
              </div>

              {/* Compte Bancaire */}
              <div className="admin-box">
                <h3>Compte & Solde</h3>
                <p className="admin-iban">{selected.account?.iban || "Pas d'IBAN"}</p>
                {isEditing ? (
                  <input type="number" value={editForm.balance} onChange={e => setEditForm({...editForm, balance: e.target.value})} />
                ) : (
                  <p className="admin-balance">{selected.account?.balance} €</p>
                )}
                <button className={`btn-status ${selected.account?.status}`} onClick={toggleAccount}>
                  {selected.account?.status === "BLOCKED" ? "Débloquer Compte" : "Bloquer Compte"}
                </button>
              </div>
              
              {/* Carte */}
              <div className="admin-box">
                <h3>Carte Bancaire</h3>
                <p>Numéro : **** {selected.card?.last4}</p>
                <p>Statut : <span className={`card-status-${selected.card?.status}`}>{selected.card?.status}</span></p>
                <button className="btn-card-action" onClick={toggleCard}>Changer Statut</button>
              </div>
            </div>

            {isEditing && <button className="btn-save-changes" onClick={handleUpdate}>Enregistrer</button>}

            {/* Transactions */}
            <div className="admin-transactions">
              <h3>Historique des flux</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.transactions.map(t => (
                    <tr key={t._id}>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>{t.label}</td>
                      <td className={t.type === "CREDIT" ? "txt-green" : "txt-red"}>
                        {t.type === "CREDIT" ? "+" : "-"}{t.amount} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="admin-empty">Sélectionnez un client dans la liste de gauche.</div>
        )}
      </div>
    </div>
  );
}