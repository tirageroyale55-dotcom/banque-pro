import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/AdminClient.css";

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { api("/admin/clients").then(setClients); }, []);

  const selectClient = async (id) => {
    const data = await api("/admin/client-master-data/" + id);
    setSelected(data);
    setFormData({ userData: data.user, accountData: data.account, cardData: data.card });
    setIsEditing(false);
  };

  const handleGlobalSave = async () => {
    try {
      await api("/admin/client-master-update/" + selected.user._id, "PUT", formData);
      alert("Modifications enregistrées");
      selectClient(selected.user._id);
    } catch (e) { alert("Erreur de sauvegarde"); }
  };

  const runAction = async (path, method = "POST") => {
    await api(path, method);
    selectClient(selected.user._id);
  };

  return (
    <div className="admin-master-container">
      {/* SIDEBAR */}
      <div className="master-sidebar">
        <div className="sidebar-brand">BPER ADMIN v2</div>
        <div className="client-list">
          {clients.map(c => (
            <div key={c._id} className={`client-row ${selected?.user._id === c._id ? 'active' : ''}`} onClick={() => selectClient(c._id)}>
              <p><b>{c.nom}</b> {c.prenom}</p>
              <span className={`status-tag ${c.status}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="master-content">
        {selected ? (
          <div className="profile-scroll">
            <div className="sticky-header">
              <h2>Dossier : {selected.user.personalId || "Nouveau"}</h2>
              <div className="btn-group">
                <button onClick={() => setIsEditing(!isEditing)} className="btn-edit">{isEditing ? "Annuler" : "Modifier tout"}</button>
                {isEditing && <button onClick={handleGlobalSave} className="btn-save">Enregistrer les changements</button>}
              </div>
            </div>

            <div className="master-grid">
              {/* BLOC 1: IDENTITÉ (USER.JS) */}
              <section className="data-card">
                <h3><i className="fas fa-id-card"></i> Identité & Documents</h3>
                <div className="field-grid">
                  <div className="item">
                    <label>Civilité / Nom / Prénom</label>
                    {isEditing ? (
                      <div className="input-row">
                        <select value={formData.userData.civilite} onChange={e => setFormData({...formData, userData: {...formData.userData, civilite: e.target.value}})}><option>M</option><option>Mme</option></select>
                        <input value={formData.userData.nom} onChange={e => setFormData({...formData, userData: {...formData.userData, nom: e.target.value}})} />
                        <input value={formData.userData.prenom} onChange={e => setFormData({...formData, userData: {...formData.userData, prenom: e.target.value}})} />
                      </div>
                    ) : <p>{selected.user.civilite} {selected.user.nom} {selected.user.prenom}</p>}
                  </div>
                  <div className="item"><label>Date & Lieu de Naissance</label><p>{selected.user.dateNaissance} à {selected.user.lieuNaissance}</p></div>
                  <div className="item"><label>Nationalité</label><p>{selected.user.nationalite}</p></div>
                  <div className="item">
                    <label>Contact (Email/Tel)</label>
                    {isEditing ? (
                      <div className="input-row">
                         <input value={formData.userData.email} onChange={e => setFormData({...formData, userData: {...formData.userData, email: e.target.value}})} />
                         <input value={formData.userData.telephone} onChange={e => setFormData({...formData, userData: {...formData.userData, telephone: e.target.value}})} />
                      </div>
                    ) : <p>{selected.user.email} <br/> {selected.user.telephone}</p>}
                  </div>
                </div>
                <div className="docs-preview">
                   <div className="doc-box"><span>Recto</span><img src={selected.user.pieceIdentiteRecto} alt="Recto" /></div>
                   <div className="doc-box"><span>Verso</span><img src={selected.user.pieceIdentiteVerso} alt="Verso" /></div>
                   <div className="doc-box signature"><span>Signature</span><img src={selected.user.signature} alt="Signature" /></div>
                </div>
              </section>

              {/* BLOC 2: COMPTE (ACCOUNT.JS) */}
              <section className="data-card account-card">
                <h3><i className="fas fa-university"></i> Informations Compte</h3>
                <div className="field-grid">
                  <div className="item"><label>IBAN</label>{isEditing ? <input value={formData.accountData?.iban} onChange={e => setFormData({...formData, accountData: {...formData.accountData, iban: e.target.value}})} /> : <p className="mono">{selected.account?.iban}</p>}</div>
                  <div className="item"><label>Solde (€)</label>{isEditing ? <input type="number" value={formData.accountData?.balance} onChange={e => setFormData({...formData, accountData: {...formData.accountData, balance: e.target.value}})} /> : <p className="balance-text">{selected.account?.balance} €</p>}</div>
                </div>
                <div className="actions-footer">
                  <p>Statut : <b>{selected.account?.status}</b></p>
                  <button className={`btn-status ${selected.account?.status}`} onClick={() => runAction(`/admin/account/${selected.account?.status === "ACTIVE" ? "block" : "activate"}/${selected.account?._id}`)}>
                    {selected.account?.status === "ACTIVE" ? "Bloquer Compte" : "Activer Compte"}
                  </button>
                </div>
              </section>

              {/* BLOC 3: CARTE (CARD.JS) */}
              <section className="data-card card-card">
                <h3><i className="fas fa-credit-card"></i> Détails Carte</h3>
                <div className="field-grid">
                  <div className="item"><label>Numéro de carte</label>{isEditing ? <input value={formData.cardData?.number} onChange={e => setFormData({...formData, cardData: {...formData.cardData, number: e.target.value}})} /> : <p>**** **** **** {selected.card?.last4}</p>}</div>
                  <div className="item"><label>Expiration / CVV</label>{isEditing ? <div className="input-row"><input value={formData.cardData?.exp_month} /><input value={formData.cardData?.exp_year} /><input value={formData.cardData?.cvv} /></div> : <p>{selected.card?.exp_month}/{selected.card?.exp_year} - CVV: {selected.card?.cvv}</p>}</div>
                </div>
                <div className="actions-footer">
                   <p>Statut Carte : <b>{selected.card?.status}</b></p>
                   <button className="btn-card-toggle" onClick={() => runAction(`/admin/card/${selected.card?.status === "active" ? "block" : "activate"}/${selected.card?._id}`)}>
                     Basculer Statut Carte
                   </button>
                </div>
              </section>

              {/* BLOC 4: TRANSACTIONS (TRANSACTION.JS) */}
              <section className="data-card full-width">
                <h3><i className="fas fa-exchange-alt"></i> Historique des flux</h3>
                <table className="master-table">
                  <thead><tr><th>Date</th><th>Libellé</th><th>Type</th><th>Montant</th></tr></thead>
                  <tbody>
                    {selected.transactions.map(t => (
                      <tr key={t._id}>
                        <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td>{t.label}</td>
                        <td className={t.type}>{t.type}</td>
                        <td className={t.type === "CREDIT" ? "txt-green" : "txt-red"}>{t.type === "CREDIT" ? "+" : "-"}{t.amount} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        ) : <div className="no-select">Veuillez sélectionner un client pour gérer son dossier.</div>}
      </div>
    </div>
  );
}