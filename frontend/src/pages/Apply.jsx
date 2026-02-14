import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Select from "react-select";
import countryList from "react-select-country-list";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ReactCountryFlag from "react-country-flag";

export default function Apply() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submittedStep, setSubmittedStep] = useState(false);

  const [hasSignature, setHasSignature] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const [contractError, setContractError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem("applyForm");
    return saved
      ? JSON.parse(saved)
      : {
          civilite: "",
          nom: "",
          prenom: "",
          dateNaissance: "",
          lieuNaissance: "",
          nationalite: "",
          adresse: "",
          codePostal: "",
          ville: "",
          pays: "",
          residenceFiscale: "",
          telephone: "",
          email: "",
          situationProfessionnelle: "",
          sourceRevenus: "",
          revenusMensuels: "",
          pieceIdentiteRecto: null,
          pieceIdentiteVerso: null,
          acceptContrat: false,
        };
  });

  /* 🔐 Accès obligatoire via intro */
  useEffect(() => {
    if (!sessionStorage.getItem("applyAllowed")) {
      navigate("/apply-intro");
    }
  }, [navigate]);

  /* 💾 Sauvegarde auto */
  useEffect(() => {
    sessionStorage.setItem("applyForm", JSON.stringify(formData));
  }, [formData]);

  const update = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const [phoneCountry, setPhoneCountry] = useState("fr");

  const getFlagEmoji = (countryCode) =>
    countryCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt())
      );

  const countries = countryList().getData().map((c) => ({
    value: c.value,
    label: `${getFlagEmoji(c.value)} ${c.label}`,
  }));

  const checkDuplicate = async (field, value) => {
    if (!value) {
      setEmailExists(false);
      setPhoneExists(false);
      return;
    }

    const res = await fetch("/api/auth/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: field === "email" ? value : formData.email,
        telephone: field === "telephone" ? value : formData.telephone,
      }),
    });

    const data = await res.json();
    setEmailExists(!!data.emailExists);
    setPhoneExists(!!data.phoneExists);
  };

  const next = async (e) => {
    e.preventDefault();
    setSubmittedStep(true);

    if (step === 2) {
      let blocked = false;

      if (!formData.pays) {
        setCountryError(true);
        blocked = true;
      } else {
        setCountryError(false);
      }

      if (!formData.telephone || formData.telephone.length < 6) {
        setPhoneError(true);
        blocked = true;
      } else {
        setPhoneError(false);
      }

      if (emailExists || phoneExists) blocked = true;
      if (blocked) return;
    }

    if (step === 5) {
      let blocked = false;

      if (!hasSignature) {
        setSignatureError(true);
        blocked = true;
      }

      if (!formData.acceptContrat) {
        setContractError(true);
        blocked = true;
      }

      if (blocked) return;
    }

    if (e.currentTarget.checkValidity()) {
      setStep((s) => s + 1);
      setSubmittedStep(false);
      setSignatureError(false);
      setContractError(false);
    }
  };

  const submit = async (e) => {
  e.preventDefault();

  try {
    const canvas = document.getElementById("signature");

    // 🔥 récupère signature
    const signatureData = canvas.toDataURL("image/png");

    const data = new FormData();

    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null) data.append(k, v);
    });

    // 👉 AJOUT SIGNATURE
    data.append("signature", signatureData);

    const res = await fetch("/api/auth/apply", {
      method: "POST",
      body: data,
    });

    const result = await res.json();

    // ❌ erreur backend
    if (!res.ok) {

      if (res.status === 409) {
        setEmailExists(true);
        setPhoneExists(true);
        alert(result.message);
        return;
      }

      alert(result.message || "Erreur serveur");
      return;
    }

    // ✅ succès
    sessionStorage.removeItem("applyAllowed");
    sessionStorage.removeItem("applyForm");

    navigate("/pending");

  } catch (err) {
    alert("Erreur réseau");
  }
};


  /* ✍️ SIGNATURE */
  useEffect(() => {
    if (step !== 5) return;

    const canvas = document.getElementById("signature");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1a4fd8";
    ctx.lineWidth = 2;

    let drawing = false;
    let hasDrawn = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    };

    const start = (e) => {
      drawing = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e) => {
      if (!drawing) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      hasDrawn = true;
    };

    const stop = () => {
      drawing = false;
      if (hasDrawn) {
        setHasSignature(true);
        setSignatureError(false);
      }
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop);
    canvas.addEventListener("touchstart", start);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", stop);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stop);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stop);
    };
  }, [step]);

  return (
    <div className="apply-bg">
      <form
        className={`apply-card ${submittedStep ? "submitted" : ""}`}
        onSubmit={step === 6 ? submit : next}
        noValidate
      >
        <button
          type="button"
          className="apply-back-btn"
          onClick={() => navigate("/apply-intro")}
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="apply-steps">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} className={step >= n ? "active" : ""}>
              {n}
            </span>
          ))}
        </div>

        <h2 className="apply-title">
          Ouverture de compte – <strong>BPER BANQUE</strong>
        </h2>

        {step === 1 && (
          <>
            <select
              name="civilite"
              value={formData.civilite}
              onChange={update}
              required
            >
              <option value="">Civilité</option>
              <option value="M">Monsieur</option>
              <option value="Mme">Madame</option>
            </select>

            <input name="nom" value={formData.nom} onChange={update} placeholder="Nom" required />
            <input name="prenom" value={formData.prenom} onChange={update} placeholder="Prénom" required />
            <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={update} required />
            <input name="lieuNaissance" value={formData.lieuNaissance} onChange={update} placeholder="Lieu de naissance" required />
            <input name="nationalite" value={formData.nationalite} onChange={update} placeholder="Nationalité" required />
          </>
        )}

        {step === 2 && (
          <>
            <Select
              options={countryList().getData()}
              placeholder="Pays"
              value={countryList().getData().find((c) => c.label === formData.pays)}
              getOptionLabel={(e) => (
                <div className="country-option">
                  <ReactCountryFlag svg countryCode={e.value} />
                  <span>{e.label}</span>
                </div>
              )}
              onChange={(option) => {
                setFormData((prev) => ({ ...prev, pays: option.label }));
                setPhoneCountry(option.value.toLowerCase());
              }}
              classNamePrefix="react-select"
              className="react-select"
            />

            {countryError && <p className="form-error">Le pays est obligatoire</p>}

            <input name="ville" value={formData.ville} onChange={update} placeholder="Ville" required />
            <input name="adresse" value={formData.adresse} onChange={update} placeholder="Adresse complète" required />
            <input name="codePostal" value={formData.codePostal} onChange={update} placeholder="Code postal" required />

            <PhoneInput
              country={phoneCountry}
              enableSearch
              value={formData.telephone}
              onChange={(value) => {
                const phone = `+${value}`;
                setFormData((prev) => ({ ...prev, telephone: phone }));
                setPhoneExists(false);
                checkDuplicate("telephone", phone);
              }}
              inputProps={{ name: "telephone", required: true }}
              containerClass="phone-container"
              inputClass="phone-input"
            />

            {phoneExists && <p className="form-error">Ce numéro de téléphone est déjà utilisé</p>}
            {phoneError && <p className="form-error">Le numéro de téléphone est obligatoire</p>}

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                update(e);
                setEmailExists(false);
                checkDuplicate("email", e.target.value);
              }}
              placeholder="Email"
              required
            />

            {emailExists && <p className="form-error">Cet email est déjà utilisé</p>}
          </>
        )}

        {step === 3 && (
          <>
            <input name="situationProfessionnelle" value={formData.situationProfessionnelle} onChange={update} placeholder="Situation professionnelle" required />
            <input name="sourceRevenus" value={formData.sourceRevenus} onChange={update} placeholder="Source de revenus" required />
            <input type="number" name="revenusMensuels" value={formData.revenusMensuels} onChange={update} placeholder="Revenus mensuels (€)" required />
          </>
        )}

        {step === 4 && (
          <>
            <label>Pièce d'identité (recto)</label>
            <input type="file" name="pieceIdentiteRecto" onChange={update} required />
            <label>Pièce d'identité (verso)</label>
            <input type="file" name="pieceIdentiteVerso" onChange={update} required />
          </>
        )}

        {step === 5 && (
          <>
            <div className="signature-box">
              <p className="signature-title">Signature électronique</p>
              <canvas
                id="signature"
                width="320"
                height="140"
                className={`signature-canvas ${signatureError ? "error" : ""}`}
              />

              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  const canvas = document.getElementById("signature");
                  const ctx = canvas.getContext("2d");
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  setHasSignature(false);
                  setSignatureError(true);
                }}
              >
                Effacer la signature
              </button>

              {signatureError && <p className="signature-error">La signature est obligatoire</p>}
            </div>

            <div className="contract-box">
              <p className="contract-advice">Merci de lire attentivement les documents contractuels avant de signer.</p>
              <ul className="legal-links">
                <li><a href="/documents/contrat.pdf" target="_blank" rel="noopener">📄 Contrat d’ouverture de compte</a></li>
                <li><a href="/documents/cgu.pdf" target="_blank" rel="noopener">📜 Conditions générales</a></li>
              </ul>

              <label className="checkbox checkbox-inline">
                <input type="checkbox" name="acceptContrat" checked={formData.acceptContrat} onChange={update} />
                <span>J’ai lu et j’accepte les documents contractuels</span>
              </label>
            </div>
          </>
        )}

        {contractError && <p className="form-error">Vous devez accepter les documents contractuels pour continuer.</p>}

        {step === 6 && (
          <div className="review-box">
            <h3>Vérification des informations</h3>
            {Object.entries(formData).map(([k, v]) => {
              if (typeof v === "object" || k === "acceptContrat") return null;
              return (
                <p key={k}>
                  <strong>{k} :</strong> {v}
                </p>
              );
            })}
          </div>
        )}

        <div className="apply-actions">
          {step > 1 && (
            <button type="button" className="btn-outline" onClick={() => setStep((s) => s - 1)}>
              Retour
            </button>
          )}

          <button className="btn-solid" disabled={step === 2 && (emailExists || phoneExists)}>
            {step === 6 ? "Envoyer ma demande" : "Continuer"}
          </button>
        </div>
      </form>
    </div>
  );
}
