import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/AdminClient.css"; 

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // État pour le formulaire de modification (tous les champs)
  const [editForm, setEditForm] = useState({
    nom: "", prenom: "", email: "", telephone: "",
    adresse: "", ville: "", codePostal: "",
    situationProfessionnelle: "", revenusMensuels: 0,
    balance: 0
  });

  useEffect(() => { loadClients(); }, []);

  const loadClients = () => api("/admin/clients").then(setClients);

  const loadFullDetails = async (id) => {
    const data = await api("/admin/client-full/" + id);
    setSelected(data);
    setEditForm({
      nom: data.user.nom,
      prenom: data.user.prenom,
      email: data.user.email,
      telephone: data.user.telephone,
      adresse: data.user.adresse,
      ville: data.user.ville,
      codePostal: data.user.codePostal,
      situationProfessionnelle: data.user.situationProfessionnelle,
      revenusMensuels: data.user.revenusMensuels,
      balance: data.account?.balance || 0
    });
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    try {
      const { balance, ...userData } = editForm;
      await api("/admin/client-update/" + selected.user._id, "PUT", { userData, balance });
      alert("Profil mis à jour !");
      loadFullDetails(selected.user._id);
    } catch (err) { alert("Erreur modification"); }
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
    <div className="admin-client-wrapper">
      {/* BARRE LATÉRALE */}
      <div className="admin-sidebar">
        <h2 className="admin-title">Gestion Clients</h2>
        <div className="admin-list-scroll">
          {clients.map(c => (
            <div key={c._id} className={`admin-item-card ${selected?.user._id === c._id ? 'active' : ''}`} onClick={() => loadFullDetails(c._id)}>
              <p><b>{c.nom}</b> {c.prenom}</p>
              <span className={`badge-status ${c.status}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ZONE PRINCIPALE */}
      <div className="admin-main-content">
        {selected ? (
          <div className="admin-detail-view">
            <div className="admin-header-flex">
              <h1>Client : {selected.user.personalId || "En attente"}</h1>
              <div className="admin-top-btns">
                <button className="btn-edit" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Annuler" : "Modifier le profil"}
                </button>
                {isEditing && <button className="btn-save" onClick={handleUpdate}>Enregistrer les changements</button>}
              </div>
            </div>

            <div className="admin-grid-layout">
              {/* SECTION 1 : IDENTITÉ & CONTACT */}
              <div className="admin-card-info">
                <h3><i className="fas fa-user"></i> Informations Personnelles</h3>
                <div className="admin-field-group">
                  <label>Nom & Prénom</label>
                  {isEditing ? (
                    <div className="input-row">
                      <input value={editForm.nom} onChange={e => setEditForm({...editForm, nom: e.target.value})} />
                      <input value={editForm.prenom} onChange={e => setEditForm({...editForm, prenom: e.target.value})} />
                    </div>
                  ) : <p>{selected.user.nom} {selected.user.prenom}</p>}
                </div>
                <div className="admin-field-group">
                  <label>Email & Téléphone</label>
                  {isEditing ? (
                    <div className="input-row">
                      <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                      <input value={editForm.telephone} onChange={e => setEditForm({...editForm, telephone: e.target.value})} />
                    </div>
                  ) : <p>{selected.user.email} | {selected.user.telephone}</p>}
                </div>
              </div>

              {/* SECTION 2 : FINANCES & ADRESSE */}
              <div className="admin-card-info">
                <h3><i className="fas fa-wallet"></i> Situation Financière</h3>
                <div className="admin-field-group">
                  <label>Profession & Revenus</label>
                  {isEditing ? (
                    <div className="input-row">
                      <input value={editForm.situationProfessionnelle} onChange={e => setEditForm({...editForm, situationProfessionnelle: e.target.value})} />
                      <input type="number" value={editForm.revenusMensuels} onChange={e => setEditForm({...editForm, revenusMensuels: e.target.value})} />
                    </div>
                  ) : <p>{selected.user.situationProfessionnelle} - {selected.user.revenusMensuels}€ / mois</p>}
                </div>
                <div className="admin-field-group">
                  <label>Adresse complète</label>
                  {isEditing ? (
                    <input value={editForm.adresse} onChange={e => setEditForm({...editForm, adresse: e.target.value})} />
                  ) : <p>{selected.user.adresse}, {selected.user.codePostal} {selected.user.ville}</p>}
                </div>
              </div>

              {/* SECTION 3 : COMPTE BANCAIRE (BOUTON ACTIVER/BLOQUER) */}
              <div className="admin-card-info highlight">
                <h3><i className="fas fa-university"></i> État du Compte</h3>
                <p><b>IBAN:</b> {selected.account?.iban || "Non assigné"}</p>
                <div className="admin-balance-box">
                  <label>Solde actuel</label>
                  {isEditing ? (
                    <input type="number" value={editForm.balance} onChange={e => setEditForm({...editForm, balance: e.target.value})} />
                  ) : <p className="price">{selected.account?.balance} €</p>}
                </div>
                <button className={`btn-toggle-status ${selected.account?.status}`} onClick={toggleAccount}>
                   {selected.account?.status === "BLOCKED" ? "ACTIVER LE COMPTE" : "BLOQUER LE COMPTE"}
                </button>
              </div>

              {/* SECTION 4 : CARTE (BOUTON ACTIVER/BLOQUER) */}
              <div className="admin-card-info highlight">
                <h3><i className="fas fa-credit-card"></i> Gestion Carte</h3>
                <div className="card-visual">
                    <p className="card-number">**** **** **** {selected.card?.last4 || "0000"}</p>
                    <p className="card-brand">{selected.card?.brand.toUpperCase()}</p>
                </div>
                <p>Statut actuel: <b>{selected.card?.status}</b></p>
                <button className="btn-toggle-card" onClick={toggleCard}>
                   {selected.card?.status === "active" ? "BLOQUER LA CARTE" : "ACTIVER LA CARTE"}
                </button>
              </div>
            </div>

            {/* TRANSACTIONS */}
            <div className="admin-transactions-section">
              <h3>Historique des Transactions</h3>
              <div className="table-wrapper">
                <table className="admin-table-style">
                  <thead>
                    <tr><th>Date</th><th>Description</th><th>Montant</th></tr>
                  </thead>
                  <tbody>
                    {selected.transactions.map(t => (
                      <tr key={t._id}>
                        <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td>{t.label}</td>
                        <td className={t.type === "CREDIT" ? "positive" : "negative"}>
                          {t.type === "CREDIT" ? "+" : "-"}{t.amount}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-placeholder">Veuillez sélectionner un client pour afficher ses informations complètes.</div>
        )}
      </div>
    </div>
  );
}