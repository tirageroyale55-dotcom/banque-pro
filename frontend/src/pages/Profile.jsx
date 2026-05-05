import { useState, useEffect } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, User, Globe, MapPin, 
  Phone, Mail, Camera, Briefcase, CalendarClock, Bell, Smartphone, Palette, Wallet, Languages, Accessibility, Cookie
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api"; 
import "../styles/Profile.css";

export default function Profile({ data: initialData, isDesktop = false }) {
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);
  const [view, setView] = useState("menu"); // "menu", "details", "settings"
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!data) {
      api("/client/dashboard")
        .then(res => {
          setData(res);
          const user = res.user || res;
          if (user.profilePicture) {
            setPhoto(user.profilePicture);
          }
        })
        .catch(() => navigate("/login"));
    } else {
      const user = data.user || data;
      if (user.profilePicture) {
        setPhoto(user.profilePicture);
      }
    }
  }, [data, navigate]);

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          }, "image/jpeg", 0.7);
        };
      };
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("photo", compressedFile);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/client/upload-profile-picture", {
        method: "POST",
        headers: { "Authorization": token ? `Bearer ${token}` : "" },
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        setPhoto(result.url);
        alert("Photo de profil enregistrée !");
      } else {
        alert("Erreur " + res.status + " : " + (result.message || "Échec"));
      }
    } catch (err) {
      alert("Problème de connexion au serveur.");
    }
  };

  // Fonction d'alerte unifiée
  const handleUnavailable = () => {
    alert("L'opérateur est indisponible pour le moment, veuillez réessayer plus tard.");
  };

  if (!data) {
    return (
      <div className="bper-profile-loader">
        <div className="spinner"></div>
        <p>Chargement sécurisé...</p>
      </div>
    );
  }

  const userInfo = data.user ? data.user : data; 
  const nomUser = userInfo.nom || "";
  const prenomUser = userInfo.prenom || "";
  const displayName = `${prenomUser} ${nomUser}`.trim() || "Client BPER";
  const initials = `${prenomUser.charAt(0)}${nomUser.charAt(0)}`.toUpperCase() || "BC";
  const profileImage = photo || userInfo.profilePicture || null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className={isDesktop ? "profile-desktop-view" : "bper-profile-container"}>
      {!isDesktop && (
        <div className="bper-header">
          <button 
            onClick={() => view !== "menu" ? setView("menu") : navigate(-1)} 
            className="back-btn"
          >
            ←
          </button>
          <span className="header-title">
            {view === "details" ? "Données Personnelles" : view === "settings" ? "Paramètres" : "Mon Profil"}
          </span>
        </div>
      )}

      {/* VUE 1 : MENU PRINCIPAL */}
      {view === "menu" && (
        <div className="fade-in">
          {isDesktop && <h2 className="cards-title">Mon Profil</h2>}
          <div className="bper-card-blue" onClick={() => setView("details")}>
            <div className="bper-avatar-circle">
               {profileImage ? <img src={profileImage} alt="avatar" className="avatar-img"/> : initials}
               <label className="camera-badge" onClick={(e) => e.stopPropagation()}>
                  <Camera size={10} />
                  <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
               </label>
            </div>
            <div className="profile-info-text">
              <div className="profile-label">Mon profil</div>
              <div className="profile-name">{displayName}</div>
              <div className="profile-bank-tag">BPER BANCA</div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>

          <div className="bper-menu-section">
            <div onClick={() => setView("settings")}>
              <MenuRow icon={<Settings size={20}/>} title="Paramètres et confidentialité" />
            </div>
            <div onClick={handleUnavailable}><MenuRow icon={<Shield size={20}/>} title="Sécurité" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<MessageCircle size={20}/>} title="Parlez-nous" /></div>
            
            <div className="section-divider" />
            
            <div onClick={handleUnavailable}><MenuRow icon={<TrendingUp size={20}/>} title="Opérations d'investissement" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<CreditCard size={20}/>} title="Financement" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<Umbrella size={20}/>} title="Assurance et prévoyance" /></div>
            
            <div onClick={() => setView("details")}>
                <MenuRow icon={<Edit size={20}/>} title="Détails du compte" />
            </div>
            
            <div className="section-divider" />
            
            <div onClick={handleLogout}>
              <MenuRow icon={<LogOut size={20} color="#dc2626"/>} title="Déconnecter" color="#dc2626" />
            </div>
          </div>
        </div>
      )}

      {/* VUE 2 : PARAMÈTRES ET CONFIDENTIALITÉ */}
      {view === "settings" && (
        <div className="bper-details-view fade-in">
          {isDesktop && (
            <button onClick={() => setView("menu")} className="back-to-profile-btn">
              ← Retour au profil
            </button>
          )}
          <div className="details-header-block">
            <h3>Paramètres et confidentialité</h3>
            <p>Gérez vos préférences et la configuration de l'application.</p>
          </div>
          
          <div className="bper-menu-section" style={{marginTop: '20px'}}>
            <div onClick={handleUnavailable}><MenuRow icon={<Bell size={20}/>} title="Notifications" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<Smartphone size={20}/>} title="Gestion des smartphones" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<Palette size={20}/>} title="Personnaliser l'application" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<Wallet size={20}/>} title="Paiements numériques" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<Languages size={20}/>} title="Langue de l'application" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<Accessibility size={20}/>} title="Accessibilité" /></div>
            <div onClick={handleUnavailable}><MenuRow icon={<Cookie size={20}/>} title="Cookies" /></div>
          </div>
        </div>
      )}

      {/* VUE 3 : DÉTAILS DU COMPTE */}
      {view === "details" && (
        <div className="bper-details-view fade-in">
          {isDesktop && (
            <button onClick={() => setView("menu")} className="back-to-profile-btn">
              ← Retour au profil
            </button>
          )}
          <div className="details-header-block">
            <h3>Détails du compte</h3>
            <p>Informations certifiées conformes aux documents d'identité.</p>
          </div>

          <div className="details-section-group">
            <h4 className="section-subtitle">Identité & État Civil</h4>
            <div className="info-grid">
              <InfoRow label="CIVILITÉ" value={userInfo.civilite} icon={<User size={16}/>} />
              <InfoRow label="NOM" value={userInfo.nom} icon={<User size={16}/>} />
              <InfoRow label="PRÉNOM" value={userInfo.prenom} icon={<User size={16}/>} />
              <InfoRow label="DATE DE NAISSANCE" value={userInfo.dateNaissance} icon={<CalendarClock size={16}/>} />
              <InfoRow label="LIEU DE NAISSANCE" value={userInfo.lieuNaissance} icon={<MapPin size={16}/>} />
              <InfoRow label="NATIONALITÉ" value={userInfo.nationalite} icon={<Globe size={16}/>} />
            </div>
          </div>

          <div className="details-section-group">
            <h4 className="section-subtitle">Coordonnées & Adresse</h4>
            <div className="info-grid">
              <InfoRow label="E-MAIL" value={userInfo.email} icon={<Mail size={16}/>} />
              <InfoRow label="TÉLÉPHONE" value={userInfo.telephone} icon={<Phone size={16}/>} />
              <InfoRow label="ADRESSE" value={userInfo.adresse} icon={<MapPin size={16}/>} />
              <InfoRow label="CODE POSTAL" value={userInfo.codePostal} icon={<MapPin size={16}/>} />
              <InfoRow label="VILLE" value={userInfo.ville} icon={<MapPin size={16}/>} />
              <InfoRow label="PAYS" value={userInfo.pays} icon={<Globe size={16}/>} />
            </div>
          </div>

          <div className="details-section-group">
            <h4 className="section-subtitle">Profil Professionnel & Financier</h4>
            <div className="info-grid">
              <InfoRow label="PROFESSION" value={userInfo.situationProfessionnelle} icon={<Briefcase size={16}/>} />
              <InfoRow label="SOURCE DES REVENUS" value={userInfo.sourceRevenus} icon={<TrendingUp size={16}/>} />
              <InfoRow label="REVENUS MENSUELS" value={`${userInfo.revenusMensuels} €`} icon={<CreditCard size={16}/>} />
              <InfoRow label="RÉSIDENCE FISCALE" value={userInfo.residenceFiscale} icon={<Shield size={16}/>} />
            </div>
          </div>

          <div className="client-footer">
            <div className="status-badge-certified">COMPTE {userInfo.status || "ACTIVE"}</div>
            <p className="ref-client">ID Client : {userInfo.personalId || userInfo._id?.slice(-8).toUpperCase()}</p>
            <p>Certifié par BPER Banca le {new Date(userInfo.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuRow({ icon, title, color = "#1e293b" }) {
  return (
    <div className="bper-row" style={{cursor: 'pointer'}}>
      <div className="row-icon" style={{ color: color }}>{icon}</div>
      <div className="row-title" style={{ color: color }}>{title}</div>
      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="info-row">
        <div className="info-icon">{icon}</div>
        <div className="info-content">
            <div className="info-label">{label}</div>
            <div className="info-value">{value || "Non renseigné"}</div>
        </div>
    </div>
  );
}