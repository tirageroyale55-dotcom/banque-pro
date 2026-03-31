import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../styles/AdminClient.css"; // Voir le CSS plus bas

export default function AdminClient() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadAllClients();
  }, []);

  const loadAllClients = () => api("/admin/clients").then(setClients);

  const loadClientDetails = async (id) => {
    const data = await api("/admin/client-full/" + id);
    setSelected(data);
    setFormData({
      nom: data.user.nom,
      prenom: data.user.prenom,
      email: data.user.email,
      balance: data.account?.balance || 0,
      telephone: data.user.telephone
    });
    setEditMode(false);
  };

  const handleUpdate = async () => {
    try {
      await api("/admin/client-update/" + selected.user._id, "PUT", {
        userData: { 
            nom: formData.nom, 
            prenom: formData.prenom, 
            email: formData.email,
            telephone: formData.telephone 
        },
        accountData: { balance: formData.balance }
      });
      alert("Profil mis à jour ! ✅");
      loadClientDetails(selected.user._id);
    } catch (err) {
      alert("Erreur mise à jour ❌");
    }
  };

  // Vos fonctions toggleAccount et toggleCard restent identiques...
  // (Appelez simplement loadClientDetails à la fin)

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>Clients BPER</h2>
        <div className="client-list">
          {clients.map((c) => (
            <div key={c._id} className={`client-item ${selected?.user._id === c._id ? 'active' : ''}`} onClick={() => loadClientDetails(c._id)}>
              <p>{c.nom.toUpperCase()} {c.prenom}</p>
              <span className={`badge ${c.status}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="content">
        {selected ? (
          <div className="profile-card">
            <header className="profile-header">
              <h1>Dossier : {selected.user.personalId || "Nouveau"}</h1>
              <button className="btn-edit" onClick={() => setEditMode(!editMode)}>
                {editMode ? "Annuler" : "Modifier Infos"}
              </button>
            </header>

            <div className="grid-details">
              {/* SECTION IDENTITÉ */}
              <section className="card-box">
                <h3><i className="fas fa-user"></i> Identité</h3>
                {editMode ? (
                  <div className="form-group">
                    <input value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} placeholder="Nom" />
                    <input value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} placeholder="Prénom" />
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" />
                  </div>
                ) : (
                  <>
                    <p><b>Nom :</b> {selected.user.nom} {selected.user.prenom}</p>
                    <p><b>Email :</b> {selected.user.email}</p>
                    <p><b>Tél :</b> {selected.user.telephone}</p>
                  </>
                )}
              </section>

              {/* SECTION COMPTE */}
              <section className="card-box">
                <h3><i className="fas fa-university"></i> Compte Bancaire</h3>
                <p><b>IBAN :</b> {selected.account?.iban || "Non généré"}</p>
                {editMode ? (
                  <div className="form-group">
                    <label>Solde (€)</label>
                    <input type="number" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} />
                  </div>
                ) : (
                  <p className="balance-text"><b>Solde :</b> {selected.account?.balance.toLocaleString()} €</p>
                )}
                <button className={`btn-status ${selected.account?.status}`} onClick={() => {/* votre fonction toggleAccount */}}>
                  {selected.account?.status === "BLOCKED" ? "Débloquer" : "Bloquer"}
                </button>
              </section>

              {/* SECTION CARTE */}
              <section className="card-box card-viz">
                <h3><i className="fas fa-credit-card"></i> Carte</h3>
                <div className="bank-card">
                  <p className="card-num">**** **** **** {selected.card?.last4 || "0000"}</p>
                  <p className="card-status">{selected.card?.status.toUpperCase()}</p>
                </div>
                <button className="btn-action" onClick={() => {/* votre fonction toggleCard */}}>
                  Changer Statut Carte
                </button>
              </section>
            </div>

            {editMode && <button className="btn-save" onClick={handleUpdate}>Enregistrer les modifications</button>}

            {/* SECTION TRANSACTIONS */}
            <section className="transactions-area">
              <h3>Historique Transactions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th>Type</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.transactions.map(t => (
                    <tr key={t._id}>
                      <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td>{t.label}</td>
                      <td className={t.type}>{t.type}</td>
                      <td className={t.type === 'CREDIT' ? 'plus' : 'minus'}>
                        {t.type === 'CREDIT' ? '+' : '-'}{t.amount} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        ) : (
          <div className="empty-state">Sélectionnez un client pour voir les détails</div>
        )}
      </main>
    </div>
  );
}