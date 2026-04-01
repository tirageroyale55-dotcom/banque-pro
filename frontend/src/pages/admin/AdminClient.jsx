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
    {/* SOUS-SECTION : IDENTITÉ LIGNE PAR LIGNE */}
    <div className="sub-section">
      <h4><i className="fas fa-user"></i> État Civil</h4>
      <div className="field-list">
        <div className="item"><label>Civilité :</label> <p>{selected.user.civilite}</p></div>
        <div className="item"><label>Nom :</label> <p>{selected.user.nom}</p></div>
        <div className="item"><label>Prénom :</label> <p>{selected.user.prenom}</p></div>
        <div className="item"><label>Né(e) le :</label> <p>{selected.user.dateNaissance}</p></div>
        <div className="item"><label>À :</label> <p>{selected.user.lieuNaissance}</p></div>
        <div className="item"><label>Nationalité :</label> <p>{selected.user.nationalite}</p></div>
        <div className="item"><label>Résidence Fiscale :</label> <p>{selected.user.residenceFiscale || "N/A"}</p></div>
      </div>
    </div>

    {/* SOUS-SECTION : CONTACT & ADRESSE */}
    <div className="sub-section">
      <h4><i className="fas fa-map-marker-alt"></i> Coordonnées & Localisation</h4>
      <div className="field-list">
        <div className="item"><label>Email :</label> <p>{selected.user.email} {selected.user.emailVerified ? "✅" : "❌"}</p></div>
        <div className="item"><label>Téléphone :</label> <p>{selected.user.telephone}</p></div>
        <div className="item"><label>Adresse :</label> <p>{selected.user.adresse}</p></div>
        <div className="item"><label>Ville :</label> <p>{selected.user.codePostal} {selected.user.ville}</p></div>
        <div className="item"><label>Pays :</label> <p>{selected.user.pays}</p></div>
      </div>
    </div>

    {/* SOUS-SECTION : FINANCIER */}
    <div className="sub-section">
      <h4><i className="fas fa-briefcase"></i> Profil Professionnel & Financier</h4>
      <div className="field-list">
        <div className="item"><label>Situation Pro :</label> <p>{selected.user.situationProfessionnelle}</p></div>
        <div className="item"><label>Source Revenus :</label> <p>{selected.user.sourceRevenus}</p></div>
        <div className="item"><label>Revenus Mensuels :</label> <p className="txt-bold">{selected.user.revenusMensuels} €</p></div>
        <div className="item"><label>Contrat Accepté :</label> <p>{selected.user.acceptContrat ? "OUI ✅" : "NON ❌"}</p></div>
      </div>
    </div>

    {/* SOUS-SECTION : SÉCURITÉ & IDS */}
    <div className="sub-section">
      <h4><i className="fas fa-shield-alt"></i> Sécurité Admin</h4>
      <div className="field-list">
        <div className="item"><label>Personal ID :</label> <p className="mono">{selected.user.personalId}</p></div>
        <div className="item"><label>Tentatives Login :</label> <p>{selected.user.loginAttempts}</p></div>
        <div className="item"><label>Rôle :</label> <p>{selected.user.role}</p></div>
        <div className="item"><label>Créé le :</label> <p>{new Date(selected.user.createdAt).toLocaleString()}</p></div>
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