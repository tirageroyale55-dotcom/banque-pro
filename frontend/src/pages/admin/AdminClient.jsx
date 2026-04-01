import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/AdminClient.css"; 

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // État local pour le formulaire (copie du modèle User + solde)
  const [editForm, setEditForm] = useState({});

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
      // On initialise le formulaire avec TOUTES les données du user
      setEditForm({
        ...data.user,
        balance: data.account?.balance || 0
      });
      setIsEditing(false);
    } catch (err) {
      alert("Erreur chargement détails");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      // On sépare la balance du reste des données User pour le backend
      const { balance, ...userData } = editForm;
      await api("/admin/client-update/" + selected.user._id, "PUT", {
        userData,
        accountData: { balance }
      });
      alert("Dossier mis à jour ! ✅");
      loadFullDetails(selected.user._id);
    } catch (err) {
      alert("Erreur lors de la sauvegarde ❌");
    }
  };

  return (
    <div className="admin-client-wrapper">
      <div className="admin-sidebar">
        <h2 className="admin-title">Gestion Clients</h2>
        <div className="admin-list-scroll">
          {clients.map(c => (
            <div 
              key={c._id} 
              className={`admin-item-card ${selected?.user._id === c._id ? 'active' : ''}`}
              onClick={() => loadFullDetails(c._id)}
            >
              <div>
                <b>{c.nom.toUpperCase()} {c.prenom}</b>
                <p style={{fontSize: '0.8em', margin: 0}}>{c.email}</p>
              </div>
              <span className={`status-dot ${c.status}`}></span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-main-content">
        {selected ? (
          <div className="admin-detail-view">
            <div className="admin-header-actions">
              <h1>Client : {selected.user.personalId || "En attente"}</h1>
              <div className="admin-btns-top">
                <button className="btn-edit-mode" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Annuler" : "Modifier Dossier"}
                </button>
                {isEditing && <button className="btn-save-top" onClick={handleUpdate}>Sauvegarder</button>}
              </div>
            </div>

            <div className="admin-grid">
              {/* SECTION 1 : IDENTITÉ */}
              <div className="admin-box">
                <h3><i className="fas fa-id-card"></i> Identité</h3>
                <div className="admin-form">
                  <label>Civilité</label>
                  <select name="civilite" value={editForm.civilite} onChange={handleInputChange} disabled={!isEditing}>
                    <option value="M">M.</option>
                    <option value="Mme">Mme</option>
                  </select>

                  <label>Nom</label>
                  <input name="nom" value={editForm.nom} onChange={handleInputChange} readOnly={!isEditing} />
                  
                  <label>Prénom</label>
                  <input name="prenom" value={editForm.prenom} onChange={handleInputChange} readOnly={!isEditing} />

                  <label>Date de Naissance</label>
                  <input name="dateNaissance" value={editForm.dateNaissance} onChange={handleInputChange} readOnly={!isEditing} />
                  
                  <label>Nationalité</label>
                  <input name="nationalite" value={editForm.nationalite} onChange={handleInputChange} readOnly={!isEditing} />
                </div>
              </div>

              {/* SECTION 2 : CONTACT & ADRESSE */}
              <div className="admin-box">
                <h3><i className="fas fa-map-marker-alt"></i> Contact & Adresse</h3>
                <div className="admin-form">
                  <label>Email</label>
                  <input name="email" value={editForm.email} onChange={handleInputChange} readOnly={!isEditing} />
                  
                  <label>Téléphone</label>
                  <input name="telephone" value={editForm.telephone} onChange={handleInputChange} readOnly={!isEditing} />

                  <label>Adresse</label>
                  <input name="adresse" value={editForm.adresse} onChange={handleInputChange} readOnly={!isEditing} />
                  
                  <label>Ville / CP</label>
                  <div style={{display:'flex', gap:'5px'}}>
                    <input name="codePostal" value={editForm.codePostal} onChange={handleInputChange} readOnly={!isEditing} style={{width:'30%'}} />
                    <input name="ville" value={editForm.ville} onChange={handleInputChange} readOnly={!isEditing} />
                  </div>
                </div>
              </div>

              {/* SECTION 3 : FINANCIER & COMPTE */}
              <div className="admin-box">
                <h3><i className="fas fa-wallet"></i> Situation Financière</h3>
                <div className="admin-form">
                  <label>Profession</label>
                  <input name="situationProfessionnelle" value={editForm.situationProfessionnelle} onChange={handleInputChange} readOnly={!isEditing} />
                  
                  <label>Revenus Mensuels (€)</label>
                  <input type="number" name="revenusMensuels" value={editForm.revenusMensuels} onChange={handleInputChange} readOnly={!isEditing} />

                  <label>Solde Compte BPER (€)</label>
                  <input type="number" name="balance" value={editForm.balance} onChange={handleInputChange} readOnly={!isEditing} className="highlight-input" />
                  
                  <p className="admin-iban-display"><b>IBAN:</b> {selected.account?.iban || "Non assigné"}</p>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS RECENTES */}
            <div className="admin-transactions">
              <h3>Dernières Transactions</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.transactions.length > 0 ? selected.transactions.map(t => (
                    <tr key={t._id}>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>{t.label}</td>
                      <td className={t.type === "CREDIT" ? "txt-green" : "txt-red"}>
                        {t.type === "CREDIT" ? "+" : "-"}{t.amount} €
                      </td>
                    </tr>
                  )) : <tr><td colSpan="3">Aucune transaction</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="admin-empty">Sélectionnez un client pour gérer son dossier complet.</div>
        )}
      </div>
    </div>
  );
}