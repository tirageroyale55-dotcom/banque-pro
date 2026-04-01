import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/AdminClient.css";

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // État local pour le formulaire de modification
  const [form, setForm] = useState({});

  useEffect(() => { loadClients(); }, []);
  const loadClients = () => api("/admin/clients").then(setClients);

  const loadFullDetails = async (id) => {
    const data = await api("/admin/client-full/" + id);
    setSelected(data);
    // Pré-remplissage du formulaire avec TOUTES les données des modèles
    setForm({
      userData: { ...data.user },
      accountData: { ...data.account },
      cardData: { ...data.card }
    });
    setIsEditing(false);
  };

  const handleGlobalUpdate = async () => {
    try {
      await api("/admin/client-update-full", "PUT", {
        userId: selected.user._id,
        accountId: selected.account?._id,
        cardId: selected.card?._id,
        userData: form.userData,
        accountData: form.accountData,
        cardData: form.cardData
      });
      alert("Mise à jour réussie ! ✅");
      loadFullDetails(selected.user._id);
    } catch (err) {
      alert("Erreur lors de la sauvegarde ❌");
    }
  };

  if (!clients) return <p>Chargement...</p>;

  return (
    <div className="admin-client-wrapper">
      {/* SIDEBAR LISTE */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">Gestion Clientèle</div>
        <div className="admin-list">
          {clients.map(c => (
            <div key={c._id} className={`client-card ${selected?.user._id === c._id ? 'active' : ''}`} onClick={() => loadFullDetails(c._id)}>
              <p><b>{c.nom.toUpperCase()}</b> {c.prenom}</p>
              <span className={`status-pill ${c.status}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ZONE DE TRAVAIL PRINCIPALE */}
      <main className="admin-content">
        {selected ? (
          <div className="detail-container">
            <header className="detail-header">
              <h1>Dossier Client : {selected.user.personalId || "N/A"}</h1>
              <div className="action-bar">
                <button className="btn-edit" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Annuler" : "Modifier tout le dossier"}
                </button>
                {isEditing && <button className="btn-save" onClick={handleGlobalUpdate}>Enregistrer les modifications</button>}
              </div>
            </header>

            <div className="sections-grid">
              
              {/* SECTION 1 : IDENTITÉ & PIÈCES (Modèle User) */}
              <section className="admin-section-box">
                <h2 className="section-title">👤 Identité & Documents</h2>
                <div className="form-grid">
                  <div className="field">
                    <label>Civilité</label>
                    {isEditing ? <select value={form.userData.civilite} onChange={e => setForm({...form, userData: {...form.userData, civilite: e.target.value}})}><option>M</option><option>Mme</option></select> : <p>{selected.user.civilite}</p>}
                  </div>
                  <div className="field">
                    <label>Nom / Prénom</label>
                    {isEditing ? <div className="flex-input"><input value={form.userData.nom} onChange={e => setForm({...form, userData: {...form.userData, nom: e.target.value}})} /><input value={form.userData.prenom} onChange={e => setForm({...form, userData: {...form.userData, prenom: e.target.value}})} /></div> : <p>{selected.user.nom} {selected.user.prenom}</p>}
                  </div>
                  <div className="field">
                    <label>Naissance</label>
                    <p>{selected.user.dateNaissance} à {selected.user.lieuNaissance}</p>
                  </div>
                  <div className="field">
                    <label>Contact</label>
                    {isEditing ? <input value={form.userData.telephone} onChange={e => setForm({...form, userData: {...form.userData, telephone: e.target.value}})} /> : <p>{selected.user.email} <br/> {selected.user.telephone}</p>}
                  </div>
                </div>
                <div className="documents-display">
                    <div className="doc-item"><span>Recto</span> {selected.user.pieceIdentiteRecto ? <a href={selected.user.pieceIdentiteRecto} target="_blank">Voir</a> : "Manquant"}</div>
                    <div className="doc-item"><span>Verso</span> {selected.user.pieceIdentiteVerso ? <a href={selected.user.pieceIdentiteVerso} target="_blank">Voir</a> : "Manquant"}</div>
                    <div className="doc-item"><span>Signature</span> {selected.user.signature ? <img src={selected.user.signature} alt="Sign" width="100"/> : "Manquante"}</div>
                </div>
              </section>

              {/* SECTION 2 : COMPTE BANCAIRE (Modèle Account) */}
              <section className="admin-section-box highlight-blue">
                <h2 className="section-title">🏦 Compte Bancaire</h2>
                <div className="form-grid">
                  <div className="field">
                    <label>IBAN</label>
                    {isEditing ? <input value={form.accountData?.iban} onChange={e => setForm({...form, accountData: {...form.accountData, iban: e.target.value}})} /> : <p>{selected.account?.iban}</p>}
                  </div>
                  <div className="field">
                    <label>Solde Actuel (€)</label>
                    {isEditing ? <input type="number" value={form.accountData?.balance} onChange={e => setForm({...form, accountData: {...form.accountData, balance: e.target.value}})} /> : <p className="balance-big">{selected.account?.balance?.toLocaleString()} €</p>}
                  </div>
                  <div className="field">
                    <label>Status Compte</label>
                    {isEditing ? (
                      <select value={form.accountData?.status} onChange={e => setForm({...form, accountData: {...form.accountData, status: e.target.value}})}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="BLOCKED">BLOCKED</option>
                      </select>
                    ) : <span className={`badge ${selected.account?.status}`}>{selected.account?.status}</span>}
                  </div>
                </div>
              </section>

              {/* SECTION 3 : CARTE BANCAIRE (Modèle Card) */}
              <section className="admin-section-box highlight-dark">
                <h2 className="section-title">💳 Carte Bancaire</h2>
                <div className="form-grid">
                  <div className="field">
                    <label>Numéro de Carte</label>
                    {isEditing ? <input value={form.cardData?.number} onChange={e => setForm({...form, cardData: {...form.cardData, number: e.target.value}})} /> : <p>**** **** **** {selected.card?.last4}</p>}
                  </div>
                  <div className="field">
                    <label>CVV / Expiration</label>
                    {isEditing ? (
                       <div className="flex-input">
                         <input placeholder="CVV" value={form.cardData?.cvv} onChange={e => setForm({...form, cardData: {...form.cardData, cvv: e.target.value}})} />
                         <input placeholder="MM" value={form.cardData?.exp_month} onChange={e => setForm({...form, cardData: {...form.cardData, exp_month: e.target.value}})} />
                         <input placeholder="YY" value={form.cardData?.exp_year} onChange={e => setForm({...form, cardData: {...form.cardData, exp_year: e.target.value}})} />
                       </div>
                    ) : <p>{selected.card?.cvv} | {selected.card?.exp_month}/{selected.card?.exp_year}</p>}
                  </div>
                  <div className="field">
                    <label>Status Carte</label>
                    {isEditing ? (
                      <select value={form.cardData?.status} onChange={e => setForm({...form, cardData: {...form.cardData, status: e.target.value}})}>
                        <option value="active">ACTIVE</option>
                        <option value="inactive">INACTIVE</option>
                        <option value="blocked">BLOCKED</option>
                      </select>
                    ) : <span className={`badge ${selected.card?.status}`}>{selected.card?.status}</span>}
                  </div>
                </div>
              </section>

              {/* SECTION 4 : TRANSACTIONS (Modèle Transaction) */}
              <section className="admin-section-box full-width">
                <h2 className="section-title">🔄 Historique des Transactions</h2>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Label</th>
                        <th>Type</th>
                        <th>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.transactions.length > 0 ? selected.transactions.map(t => (
                        <tr key={t._id}>
                          <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td>{t.label}</td>
                          <td className={t.type}>{t.type}</td>
                          <td className={t.type === 'CREDIT' ? 'txt-green' : 'txt-red'}>
                            {t.type === 'CREDIT' ? '+' : '-'}{t.amount} €
                          </td>
                        </tr>
                      )) : <tr><td colSpan="4">Aucune transaction</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          </div>
        ) : (
          <div className="empty-state">Veuillez sélectionner un client pour afficher ses données.</div>
        )}
      </main>
    </div>
  );
}