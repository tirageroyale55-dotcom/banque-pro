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
              
              {/* BLOC 1: DOSSIER COMPLET UTILISATEUR (USER.JS) */}
<section className="data-card user-full-dossier">
  <div className="section-header">
    <h3><i className="fas fa-id-card"></i> Dossier Complet Identité & Documents</h3>
    <span className={`status-badge ${selected.user.status}`}>{selected.user.status}</span>
  </div>

  <div className="master-grid-sub">
    {/* SOUS-SECTION : ÉTAT CIVIL */}
    <div className="sub-section">
      <h4><i className="fas fa-user"></i> État Civil</h4>
      <div className="field-list">
        <div className="item">
          <label>Civilité :</label> 
          {isEditing ? (
            <select value={formData.userData.civilite} onChange={e => setFormData({...formData, userData: {...formData.userData, civilite: e.target.value}})}>
              <option value="M">M</option>
              <option value="Mme">Mme</option>
            </select>
          ) : <p>{selected.user.civilite}</p>}
        </div>
        <div className="item">
          <label>Nom :</label> 
          {isEditing ? <input value={formData.userData.nom} onChange={e => setFormData({...formData, userData: {...formData.userData, nom: e.target.value}})} /> : <p>{selected.user.nom}</p>}
        </div>
        <div className="item">
          <label>Prénom :</label> 
          {isEditing ? <input value={formData.userData.prenom} onChange={e => setFormData({...formData, userData: {...formData.userData, prenom: e.target.value}})} /> : <p>{selected.user.prenom}</p>}
        </div>
        <div className="item">
          <label>Né(e) le :</label> 
          {isEditing ? <input type="date" value={formData.userData.dateNaissance} onChange={e => setFormData({...formData, userData: {...formData.userData, dateNaissance: e.target.value}})} /> : <p>{selected.user.dateNaissance}</p>}
        </div>
        <div className="item">
          <label>À :</label> 
          {isEditing ? <input value={formData.userData.lieuNaissance} onChange={e => setFormData({...formData, userData: {...formData.userData, lieuNaissance: e.target.value}})} /> : <p>{selected.user.lieuNaissance}</p>}
        </div>
        <div className="item">
          <label>Nationalité :</label> 
          {isEditing ? <input value={formData.userData.nationalite} onChange={e => setFormData({...formData, userData: {...formData.userData, nationalite: e.target.value}})} /> : <p>{selected.user.nationalite}</p>}
        </div>
        <div className="item">
          <label>Résidence Fiscale :</label> 
          {isEditing ? <input value={formData.userData.residenceFiscale} onChange={e => setFormData({...formData, userData: {...formData.userData, residenceFiscale: e.target.value}})} /> : <p>{selected.user.residenceFiscale || "N/A"}</p>}
        </div>
      </div>
    </div>

    {/* SOUS-SECTION : CONTACT & ADRESSE */}
    <div className="sub-section">
      <h4><i className="fas fa-map-marker-alt"></i> Coordonnées & Localisation</h4>
      <div className="field-list">
        <div className="item">
          <label>Email :</label> 
          {isEditing ? <input value={formData.userData.email} onChange={e => setFormData({...formData, userData: {...formData.userData, email: e.target.value}})} /> : <p>{selected.user.email}</p>}
        </div>
        <div className="item">
          <label>Téléphone :</label> 
          {isEditing ? <input value={formData.userData.telephone} onChange={e => setFormData({...formData, userData: {...formData.userData, telephone: e.target.value}})} /> : <p>{selected.user.telephone}</p>}
        </div>
        <div className="item">
          <label>Adresse :</label> 
          {isEditing ? <input value={formData.userData.adresse} onChange={e => setFormData({...formData, userData: {...formData.userData, adresse: e.target.value}})} /> : <p>{selected.user.adresse}</p>}
        </div>
        <div className="item">
          <label>Code Postal :</label> 
          {isEditing ? <input value={formData.userData.codePostal} onChange={e => setFormData({...formData, userData: {...formData.userData, codePostal: e.target.value}})} /> : <p>{selected.user.codePostal}</p>}
        </div>
        <div className="item">
          <label>Ville :</label> 
          {isEditing ? <input value={formData.userData.ville} onChange={e => setFormData({...formData, userData: {...formData.userData, ville: e.target.value}})} /> : <p>{selected.user.ville}</p>}
        </div>
        <div className="item">
          <label>Pays :</label> 
          {isEditing ? <input value={formData.userData.pays} onChange={e => setFormData({...formData, userData: {...formData.userData, pays: e.target.value}})} /> : <p>{selected.user.pays}</p>}
        </div>
      </div>
    </div>

    {/* SOUS-SECTION : FINANCIER */}
    <div className="sub-section">
      <h4><i className="fas fa-briefcase"></i> Profil Professionnel & Financier</h4>
      <div className="field-list">
        <div className="item">
          <label>Situation Pro :</label> 
          {isEditing ? <input value={formData.userData.situationProfessionnelle} onChange={e => setFormData({...formData, userData: {...formData.userData, situationProfessionnelle: e.target.value}})} /> : <p>{selected.user.situationProfessionnelle}</p>}
        </div>
        <div className="item">
          <label>Source Revenus :</label> 
          {isEditing ? <input value={formData.userData.sourceRevenus} onChange={e => setFormData({...formData, userData: {...formData.userData, sourceRevenus: e.target.value}})} /> : <p>{selected.user.sourceRevenus}</p>}
        </div>
        <div className="item">
          <label>Revenus Mensuels :</label> 
          {isEditing ? <input type="number" value={formData.userData.revenusMensuels} onChange={e => setFormData({...formData, userData: {...formData.userData, revenusMensuels: e.target.value}})} /> : <p className="txt-bold">{selected.user.revenusMensuels} €</p>}
        </div>
      </div>
    </div>

    {/* SOUS-SECTION : SÉCURITÉ ADMIN (NON ÉDITABLE POUR SÉCURITÉ) */}
    <div className="sub-section">
      <h4><i className="fas fa-shield-alt"></i> Sécurité Admin</h4>
      <div className="field-list">
        <div className="item"><label>Personal ID :</label> <p className="mono">{selected.user.personalId}</p></div>
        <div className="item"><label>Rôle :</label> <p>{selected.user.role}</p></div>
        <div className="item"><label>Statut Dossier :</label> 
          {isEditing ? (
            <select value={formData.userData.status} onChange={e => setFormData({...formData, userData: {...formData.userData, status: e.target.value}})}>
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="REJECTED">REJECTED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          ) : <p>{selected.user.status}</p>}
        </div>
      </div>
    </div>
  </div>

  

  {/* SECTION DOCUMENTS : VISUALISATION ET TÉLÉCHARGEMENT */}
  <div className="documents-grid">
    <h4><i className="fas fa-file-download"></i> Pièces Justificatives</h4>
    <div className="doc-items-container">
      
      {/* Recto */}
      <div className="doc-card-admin">
        <p>Pièce d'Identité (Recto)</p>
        <div className="img-container">
          {selected.user.pieceIdentiteRecto ? <img src={selected.user.pieceIdentiteRecto} alt="Recto" /> : "Aucun fichier"}
        </div>
        {selected.user.pieceIdentiteRecto && (
          <div className="doc-actions">
            <a href={selected.user.pieceIdentiteRecto} target="_blank" rel="noreferrer" className="btn-view">Voir</a>
            <a href={selected.user.pieceIdentiteRecto} download={`recto_${selected.user.nom}`} className="btn-download">Télécharger</a>
          </div>
        )}
      </div>

      {/* Verso */}
      <div className="doc-card-admin">
        <p>Pièce d'Identité (Verso)</p>
        <div className="img-container">
          {selected.user.pieceIdentiteVerso ? <img src={selected.user.pieceIdentiteVerso} alt="Verso" /> : "Aucun fichier"}
        </div>
        {selected.user.pieceIdentiteVerso && (
          <div className="doc-actions">
            <a href={selected.user.pieceIdentiteVerso} target="_blank" rel="noreferrer" className="btn-view">Voir</a>
            <a href={selected.user.pieceIdentiteVerso} download={`verso_${selected.user.nom}`} className="btn-download">Télécharger</a>
          </div>
        )}
      </div>

      {/* Signature */}
      <div className="doc-card-admin signature-card">
        <p>Signature Numérique</p>
        <div className="img-container">
          {selected.user.signature ? <img src={selected.user.signature} alt="Signature" className="sig-img" /> : "Aucune signature"}
        </div>
        {selected.user.signature && (
          <div className="doc-actions">
            <a href={selected.user.signature} download={`signature_${selected.user.nom}`} className="btn-download">Télécharger la signature</a>
          </div>
        )}
      </div>

    </div>
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
      <td data-label="Date">{new Date(t.createdAt).toLocaleDateString()}</td>
      <td data-label="Libellé">{t.label}</td>
      <td data-label="Type" className={t.type}>{t.type}</td>
      <td data-label="Montant" className={t.type === "CREDIT" ? "txt-green" : "txt-red"}>
        {t.type === "CREDIT" ? "+" : "-"}{t.amount} €
      </td>
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