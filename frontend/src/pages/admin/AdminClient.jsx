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
    // On pré-remplit le formulaire avec TOUTES les données reçues
    setFormData({ 
        userData: { ...data.user }, 
        accountData: { ...data.account }, 
        cardData: { ...data.card } 
    });
    setIsEditing(false);
  };

  const handleGlobalSave = async () => {
    try {
      await api("/admin/client-master-update/" + selected.user._id, "PUT", formData);
      alert("✅ Toutes les modifications ont été enregistrées avec succès.");
      selectClient(selected.user._id); // Recharger les données fraîches
    } catch (e) { alert("❌ Erreur lors de la sauvegarde globale."); }
  };

  // Fonction générique pour mettre à jour le state local du formulaire
  const updateField = (category, field, value) => {
    setFormData({
      ...formData,
      [category]: { ...formData[category], [field]: value }
    });
  };

  return (
    <div className="admin-master-container">
      {/* SIDEBAR */}
      <div className="master-sidebar">
        <div className="sidebar-brand">PANNEAU DE CONTRÔLE</div>
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
              <h2>Édition Dossier : {selected.user.nom} {selected.user.prenom}</h2>
              <div className="btn-group">
                <button onClick={() => setIsEditing(!isEditing)} className="btn-edit">
                    {isEditing ? "❌ Annuler" : "📝 Mode Édition"}
                </button>
                {isEditing && <button onClick={handleGlobalSave} className="btn-save">💾 Sauvegarder tout</button>}
              </div>
            </div>

            <div className="master-grid">
              
              {/* SECTION 1: USER.JS (MODIFIABLE LIGNE PAR LIGNE) */}
              <section className="data-card full-width">
                <h3><i className="fas fa-user-edit"></i> Informations Utilisateur (User.js)</h3>
                <div className="edit-grid">
                  
                  <div className="edit-box">
                    <label>Civilité</label>
                    {isEditing ? (
                      <select value={formData.userData.civilite} onChange={e => updateField('userData', 'civilite', e.target.value)}>
                        <option value="M">M</option><option value="Mme">Mme</option>
                      </select>
                    ) : <p>{selected.user.civilite}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Nom</label>
                    {isEditing ? <input value={formData.userData.nom} onChange={e => updateField('userData', 'nom', e.target.value)} /> : <p>{selected.user.nom}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Prénom</label>
                    {isEditing ? <input value={formData.userData.prenom} onChange={e => updateField('userData', 'prenom', e.target.value)} /> : <p>{selected.user.prenom}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Date de Naissance</label>
                    {isEditing ? <input value={formData.userData.dateNaissance} onChange={e => updateField('userData', 'dateNaissance', e.target.value)} /> : <p>{selected.user.dateNaissance}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Lieu de Naissance</label>
                    {isEditing ? <input value={formData.userData.lieuNaissance} onChange={e => updateField('userData', 'lieuNaissance', e.target.value)} /> : <p>{selected.user.lieuNaissance}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Nationalité</label>
                    {isEditing ? <input value={formData.userData.nationalite} onChange={e => updateField('userData', 'nationalite', e.target.value)} /> : <p>{selected.user.nationalite}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Résidence Fiscale</label>
                    {isEditing ? <input value={formData.userData.residenceFiscale} onChange={e => updateField('userData', 'residenceFiscale', e.target.value)} /> : <p>{selected.user.residenceFiscale}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Téléphone</label>
                    {isEditing ? <input value={formData.userData.telephone} onChange={e => updateField('userData', 'telephone', e.target.value)} /> : <p>{selected.user.telephone}</p>}
                  </div>

                  <div className="edit-box full-span">
                    <label>Adresse Complète</label>
                    {isEditing ? (
                      <div className="flex-row">
                        <input placeholder="Rue" value={formData.userData.adresse} onChange={e => updateField('userData', 'adresse', e.target.value)} />
                        <input placeholder="CP" style={{width:'80px'}} value={formData.userData.codePostal} onChange={e => updateField('userData', 'codePostal', e.target.value)} />
                        <input placeholder="Ville" value={formData.userData.ville} onChange={e => updateField('userData', 'ville', e.target.value)} />
                        <input placeholder="Pays" value={formData.userData.pays} onChange={e => updateField('userData', 'pays', e.target.value)} />
                      </div>
                    ) : <p>{selected.user.adresse}, {selected.user.codePostal} {selected.user.ville} ({selected.user.pays})</p>}
                  </div>

                  <div className="edit-box">
                    <label>Situation Pro</label>
                    {isEditing ? <input value={formData.userData.situationProfessionnelle} onChange={e => updateField('userData', 'situationProfessionnelle', e.target.value)} /> : <p>{selected.user.situationProfessionnelle}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Source Revenus</label>
                    {isEditing ? <input value={formData.userData.sourceRevenus} onChange={e => updateField('userData', 'sourceRevenus', e.target.value)} /> : <p>{selected.user.sourceRevenus}</p>}
                  </div>

                  <div className="edit-box">
                    <label>Revenus Mensuels (€)</label>
                    {isEditing ? <input type="number" value={formData.userData.revenusMensuels} onChange={e => updateField('userData', 'revenusMensuels', e.target.value)} /> : <p>{selected.user.revenusMensuels} €</p>}
                  </div>

                  <div className="edit-box">
                    <label>Statut Dossier</label>
                    {isEditing ? (
                      <select value={formData.userData.status} onChange={e => updateField('userData', 'status', e.target.value)}>
                        <option value="PENDING">PENDING</option><option value="ACTIVE">ACTIVE</option><option value="REJECTED">REJECTED</option><option value="BLOCKED">BLOCKED</option>
                      </select>
                    ) : <span className={`status-badge ${selected.user.status}`}>{selected.user.status}</span>}
                  </div>
                </div>
              </section>

              {/* SECTION 2: ACCOUNT.JS (MODIFIABLE) */}
              <section className="data-card account-style">
                <h3><i className="fas fa-university"></i> Paramètres Compte (Account.js)</h3>
                <div className="edit-box">
                   <label>IBAN</label>
                   {isEditing ? <input value={formData.accountData?.iban} onChange={e => updateField('accountData', 'iban', e.target.value)} /> : <p className="mono">{selected.account?.iban}</p>}
                </div>
                <div className="edit-box">
                   <label>RIB</label>
                   {isEditing ? <input value={formData.accountData?.rib} onChange={e => updateField('accountData', 'rib', e.target.value)} /> : <p className="mono">{selected.account?.rib}</p>}
                </div>
                <div className="edit-box">
                   <label>Solde Actuel (€)</label>
                   {isEditing ? <input type="number" value={formData.accountData?.balance} onChange={e => updateField('accountData', 'balance', e.target.value)} /> : <p className="balance-text">{selected.account?.balance} €</p>}
                </div>
              </section>

              {/* SECTION 3: CARD.JS (MODIFIABLE) */}
              <section className="data-card card-style">
                <h3><i className="fas fa-credit-card"></i> Paramètres Carte (Card.js)</h3>
                <div className="edit-box">
                   <label>Numéro de Carte</label>
                   {isEditing ? <input value={formData.cardData?.number} onChange={e => updateField('cardData', 'number', e.target.value)} /> : <p className="mono">{selected.card?.number}</p>}
                </div>
                <div className="flex-row">
                    <div className="edit-box">
                        <label>Expiration (M/Y)</label>
                        {isEditing ? <div className="flex-row"><input style={{width:'40px'}} value={formData.cardData?.exp_month} onChange={e => updateField('cardData', 'exp_month', e.target.value)} /> / <input style={{width:'40px'}} value={formData.cardData?.exp_year} onChange={e => updateField('cardData', 'exp_year', e.target.value)} /></div> : <p>{selected.card?.exp_month}/{selected.card?.exp_year}</p>}
                    </div>
                    <div className="edit-box">
                        <label>CVV</label>
                        {isEditing ? <input style={{width:'60px'}} value={formData.cardData?.cvv} onChange={e => updateField('cardData', 'cvv', e.target.value)} /> : <p>{selected.card?.cvv}</p>}
                    </div>
                </div>
              </section>

            </div>
          </div>
        ) : <div className="no-select">Sélectionnez un client dans la liste à gauche.</div>}
      </div>
    </div>
  );
}