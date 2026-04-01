import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/AdminClient.css";

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // État ultra-complet pour refléter tes modèles Mongoose
  const [editForm, setEditForm] = useState({});

  useEffect(() => { loadClients(); }, []);

  const loadClients = () => api("/admin/clients").then(setClients);

  const loadFullDetails = async (id) => {
    try {
      const data = await api("/admin/client-full/" + id);
      setSelected(data);
      // Pré-remplissage du formulaire avec TOUTES les données du modèle
      setEditForm({
        // User fields
        nom: data.user.nom,
        prenom: data.user.prenom,
        email: data.user.email,
        telephone: data.user.telephone,
        civilite: data.user.civilite,
        dateNaissance: data.user.dateNaissance,
        lieuNaissance: data.user.lieuNaissance,
        nationalite: data.user.nationalite,
        adresse: data.user.adresse,
        ville: data.user.ville,
        codePostal: data.user.codePostal,
        pays: data.user.pays,
        situationProfessionnelle: data.user.situationProfessionnelle,
        sourceRevenus: data.user.sourceRevenus,
        revenusMensuels: data.user.revenusMensuels,
        // Account & Card fields
        balance: data.account?.balance || 0,
        cardNumber: data.card?.number || ""
      });
      setIsEditing(false);
    } catch (err) { alert("Erreur de chargement"); }
  };

  const handleUpdate = async () => {
    try {
      const { balance, cardNumber, ...userData } = editForm;
      await api("/admin/client-update/" + selected.user._id, "PUT", { userData, balance, cardNumber });
      alert("Mise à jour réussie ✅");
      loadFullDetails(selected.user._id);
    } catch (err) { alert("Erreur lors de l'enregistrement"); }
  };

  // --- ACTIONS BOUTONS ---
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
      <div className="admin-sidebar">
        <h2 className="admin-title">Panel Administrateur</h2>
        <div className="admin-list-scroll">
          {clients.map(c => (
            <div key={c._id} className={`admin-item-card ${selected?.user._id === c._id ? 'active' : ''}`} onClick={() => loadFullDetails(c._id)}>
              <div className="item-info">
                <p className="item-name">{c.nom.toUpperCase()} {c.prenom}</p>
                <p className="item-email">{c.email}</p>
              </div>
              <span className={`status-pill ${c.status}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-main-content">
        {selected ? (
          <div className="admin-detail-view">
            <header className="detail-header">
              <div className="header-text">
                <h1>Fiche Client : {selected.user.personalId || "Non assigné"}</h1>
                <p>Inscrit le : {new Date(selected.user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="header-actions">
                <button className={`btn-mode ${isEditing ? 'cancel' : 'edit'}`} onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Annuler" : "Modifier le Dossier"}
                </button>
                {isEditing && <button className="btn-save-main" onClick={handleUpdate}>Sauvegarder</button>}
              </div>
            </header>

            <div className="admin-sections-grid">
              {/* SECTION 1: IDENTITÉ RÉGLEMENTAIRE */}
              <section className="admin-card">
                <h3><i className="fas fa-id-card"></i> Identité & État Civil</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Civilité</label>
                    {isEditing ? (
                      <select value={editForm.civilite} onChange={e => setEditForm({...editForm, civilite: e.target.value})}>
                        <option value="M">M.</option>
                        <option value="Mme">Mme</option>
                      </select>
                    ) : <p>{selected.user.civilite}</p>}
                  </div>
                  <div className="form-group">
                    <label>Nom complet</label>
                    {isEditing ? (
                      <div className="flex-row">
                        <input value={editForm.nom} onChange={e => setEditForm({...editForm, nom: e.target.value})} />
                        <input value={editForm.prenom} onChange={e => setEditForm({...editForm, prenom: e.target.value})} />
                      </div>
                    ) : <p>{selected.user.nom} {selected.user.prenom}</p>}
                  </div>
                  <div className="form-group">
                    <label>Naissance</label>
                    {isEditing ? (
                      <div className="flex-row">
                        <input type="text" value={editForm.dateNaissance} onChange={e => setEditForm({...editForm, dateNaissance: e.target.value})} />
                        <input type="text" value={editForm.lieuNaissance} onChange={e => setEditForm({...editForm, lieuNaissance: e.target.value})} />
                      </div>
                    ) : <p>Le {selected.user.dateNaissance} à {selected.user.lieuNaissance}</p>}
                  </div>
                  <div className="form-group">
                    <label>Nationalité</label>
                    {isEditing ? <input value={editForm.nationalite} onChange={e => setEditForm({...editForm, nationalite: e.target.value})} /> : <p>{selected.user.nationalite}</p>}
                  </div>
                </div>
              </section>

              {/* SECTION 2: CONTACT & ADRESSE */}
              <section className="admin-card">
                <h3><i className="fas fa-map-marker-alt"></i> Coordonnées</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Email & Téléphone</label>
                    {isEditing ? (
                      <div className="flex-row">
                        <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                        <input value={editForm.telephone} onChange={e => setEditForm({...editForm, telephone: e.target.value})} />
                      </div>
                    ) : <p>{selected.user.email} / {selected.user.telephone}</p>}
                  </div>
                  <div className="form-group">
                    <label>Adresse Résidentielle</label>
                    {isEditing ? (
                      <>
                        <input value={editForm.adresse} onChange={e => setEditForm({...editForm, adresse: e.target.value})} placeholder="Rue" />
                        <div className="flex-row">
                          <input value={editForm.codePostal} onChange={e => setEditForm({...editForm, codePostal: e.target.value})} placeholder="CP" />
                          <input value={editForm.ville} onChange={e => setEditForm({...editForm, ville: e.target.value})} placeholder="Ville" />
                        </div>
                      </>
                    ) : <p>{selected.user.adresse}, {selected.user.codePostal} {selected.user.ville} ({selected.user.pays})</p>}
                  </div>
                </div>
              </section>

              {/* SECTION 3: FINANCES & KYC */}
              <section className="admin-card highlight">
                <h3><i className="fas fa-coins"></i> Profil Financier</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Profession & Source</label>
                    {isEditing ? (
                      <div className="flex-row">
                        <input value={editForm.situationProfessionnelle} onChange={e => setEditForm({...editForm, situationProfessionnelle: e.target.value})} />
                        <input value={editForm.sourceRevenus} onChange={e => setEditForm({...editForm, sourceRevenus: e.target.value})} />
                      </div>
                    ) : <p>{selected.user.situationProfessionnelle} (Source: {selected.user.sourceRevenus})</p>}
                  </div>
                  <div className="form-group">
                    <label>Revenus Mensuels & Solde Compte</label>
                    {isEditing ? (
                      <div className="flex-row">
                        <input type="number" value={editForm.revenusMensuels} onChange={e => setEditForm({...editForm, revenusMensuels: e.target.value})} />
                        <input type="number" value={editForm.balance} onChange={e => setEditForm({...editForm, balance: e.target.value})} />
                      </div>
                    ) : (
                      <div className="balance-display">
                        <p>Revenus: <b>{selected.user.revenusMensuels}€</b></p>
                        <p>Solde actuel: <b className="text-blue">{selected.account?.balance}€</b></p>
                      </div>
                    )}
                  </div>
                  <button className={`btn-action-account ${selected.account?.status}`} onClick={toggleAccount}>
                    {selected.account?.status === "BLOCKED" ? "DÉBLOQUER LE COMPTE" : "BLOQUER LE COMPTE"}
                  </button>
                </div>
              </section>

              {/* SECTION 4: CARTE BANCAIRE */}
              <section className="admin-card highlight">
                <h3><i className="fas fa-credit-card"></i> Moyens de Paiement</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Numéro de Carte (Full)</label>
                    {isEditing ? (
                      <input value={editForm.cardNumber} onChange={e => setEditForm({...editForm, cardNumber: e.target.value})} />
                    ) : <p className="card-mask">**** **** **** {selected.card?.last4}</p>}
                  </div>
                  <div className="card-info-mini">
                    <p><b>Statut:</b> {selected.card?.status}</p>
                    <p><b>Expire:</b> {selected.card?.exp_month}/{selected.card?.exp_year}</p>
                  </div>
                  <button className="btn-action-card" onClick={toggleCard}>
                    {selected.card?.status === "active" ? "SUSPENDRE LA CARTE" : "ACTIVER LA CARTE"}
                  </button>
                </div>
              </section>
            </div>

            {/* TRANSACTIONS */}
            <section className="admin-transactions">
              <h3><i className="fas fa-exchange-alt"></i> Dernières Transactions</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th>Type</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.transactions.length > 0 ? selected.transactions.map(t => (
                    <tr key={t._id}>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>{t.label}</td>
                      <td><span className={`badge-type ${t.type}`}>{t.type}</span></td>
                      <td className={t.type === "CREDIT" ? "text-success" : "text-danger"}>
                        {t.type === "CREDIT" ? "+" : "-"}{t.amount}€
                      </td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-center">Aucune transaction</td></tr>}
                </tbody>
              </table>
            </section>
          </div>
        ) : (
          <div className="empty-state-wrapper">
            <i className="fas fa-user-shield"></i>
            <p>Sélectionnez un client pour gérer son compte et ses informations.</p>
          </div>
        )}
      </div>
    </div>
  );
}