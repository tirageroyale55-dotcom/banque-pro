import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/AdminClient.css";

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { api("/admin/clients").then(setClients); }, []);

  const loadClient = async (id) => {
    const data = await api("/admin/client/" + id);
    setSelected(data);
    setFormData({
      userData: { ...data.user },
      accountData: { ...data.account },
      cardData: { ...data.card }
    });
    setIsEditing(false);
    if (data.account) {
      const tx = await api("/admin/transactions/" + data.account._id);
      setTransactions(tx);
    }
  };

  const handleSave = async () => {
    try {
      await api("/admin/update-full/" + selected.user._id, "PUT", formData);
      alert("Données enregistrées !");
      loadClient(selected.user._id);
    } catch (err) { alert("Erreur sauvegarde"); }
  };

  const toggleStatus = async (type, currentStatus, id) => {
    const action = (currentStatus === "BLOCKED" || currentStatus === "blocked" || currentStatus === "inactive") ? "activate" : "block";
    await api(`/admin/${type}/${action}/${id}`, "POST");
    loadClient(selected.user._id);
  };

  return (
    <div className="admin-pro-container">
      <aside className="client-list-sidebar">
        <div className="sidebar-header">Portefeuille Clients</div>
        {clients.map(c => (
          <div key={c._id} className={`client-item ${selected?.user._id === c._id ? 'active' : ''}`} onClick={() => loadClient(c._id)}>
            <span>{c.nom} {c.prenom}</span>
            <small className={c.status}>{c.status}</small>
          </div>
        ))}
      </aside>

      <main className="client-details-main">
        {selected ? (
          <div className="pro-details-wrapper">
            <header className="details-header">
              <h1>Dossier : {selected.user.nom} {selected.user.prenom}</h1>
              <div className="header-actions">
                <button className="btn-edit" onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Annuler" : "Modifier"}</button>
                {isEditing && <button className="btn-save" onClick={handleSave}>Enregistrer</button>}
              </div>
            </header>

            <div className="details-grid">
              {/* SECTION IDENTITÉ */}
              <section className="info-card">
                <h3><i className="fas fa-user-shield"></i> Informations Client</h3>
                <div className="input-group">
                  <label>Civilité / Nom / Prénom</label>
                  {isEditing ? (
                    <div className="flex-row">
                      <select value={formData.userData.civilite} onChange={e => setFormData({...formData, userData: {...formData.userData, civilite: e.target.value}})}><option>M</option><option>Mme</option></select>
                      <input value={formData.userData.nom} onChange={e => setFormData({...formData, userData: {...formData.userData, nom: e.target.value}})} />
                      <input value={formData.userData.prenom} onChange={e => setFormData({...formData, userData: {...formData.userData, prenom: e.target.value}})} />
                    </div>
                  ) : <p>{selected.user.civilite} {selected.user.nom} {selected.user.prenom}</p>}
                </div>
                <div className="input-group">
                  <label>Contact & Profession</label>
                  {isEditing ? (
                    <div className="flex-row">
                      <input value={formData.userData.telephone} onChange={e => setFormData({...formData, userData: {...formData.userData, telephone: e.target.value}})} />
                      <input value={formData.userData.situationProfessionnelle} onChange={e => setFormData({...formData, userData: {...formData.userData, situationProfessionnelle: e.target.value}})} />
                    </div>
                  ) : <p>{selected.user.email} | {selected.user.telephone} | {selected.user.situationProfessionnelle}</p>}
                </div>
                <div className="doc-preview">
                  <p><b>Signature :</b> {selected.user.signature ? <img src={selected.user.signature} alt="sig" /> : "N/A"}</p>
                </div>
              </section>

              {/* SECTION COMPTE */}
              <section className="info-card account-style">
                <h3><i className="fas fa-university"></i> Gestion du Compte</h3>
                <div className="input-group">
                  <label>IBAN & Solde</label>
                  {isEditing ? (
                    <div className="flex-row">
                      <input value={formData.accountData.iban} onChange={e => setFormData({...formData, accountData: {...formData.accountData, iban: e.target.value}})} />
                      <input type="number" value={formData.accountData.balance} onChange={e => setFormData({...formData, accountData: {...formData.accountData, balance: e.target.value}})} />
                    </div>
                  ) : <p><b>{selected.account?.iban}</b><br/><span className="balance">{selected.account?.balance} €</span></p>}
                </div>
                <button className={`btn-status ${selected.account?.status}`} onClick={() => toggleStatus('account', selected.account.status, selected.account._id)}>
                  {selected.account?.status === "BLOCKED" ? "DÉBLOQUER COMPTE" : "BLOQUER COMPTE"}
                </button>
              </section>

              {/* SECTION CARTE */}
              <section className="info-card card-style">
                <h3><i className="fas fa-credit-card"></i> Paramètres Carte</h3>
                <div className="input-group">
                  <label>Numéro / Exp / CVV</label>
                  {isEditing ? (
                    <div className="flex-row">
                      <input value={formData.cardData.number} onChange={e => setFormData({...formData, cardData: {...formData.cardData, number: e.target.value}})} />
                      <input value={formData.cardData.exp_month} style={{width: '40px'}} onChange={e => setFormData({...formData, cardData: {...formData.cardData, exp_month: e.target.value}})} />
                      <input value={formData.cardData.exp_year} style={{width: '40px'}} onChange={e => setFormData({...formData, cardData: {...formData.cardData, exp_year: e.target.value}})} />
                      <input value={formData.cardData.cvv} style={{width: '60px'}} onChange={e => setFormData({...formData, cardData: {...formData.cardData, cvv: e.target.value}})} />
                    </div>
                  ) : <p>{selected.card?.number} ({selected.card?.exp_month}/{selected.card?.exp_year}) CVV: {selected.card?.cvv}</p>}
                </div>
                <button className={`btn-status ${selected.card?.status}`} onClick={() => toggleStatus('card', selected.card.status, selected.card._id)}>
                  {selected.card?.status === "active" ? "BLOQUER CARTE" : "ACTIVER CARTE"}
                </button>
              </section>
            </div>

            {/* TRANSACTIONS */}
            <section className="tx-history">
              <h3>Historique Transactions</h3>
              <table>
                <thead><tr><th>Date</th><th>Label</th><th>Montant</th></tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id}>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>{t.label}</td>
                      <td className={t.type}>{t.type === "CREDIT" ? "+" : "-"}{t.amount}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        ) : <div className="no-selection">Sélectionnez un client pour voir son dossier complet.</div>}
      </main>
    </div>
  );
}