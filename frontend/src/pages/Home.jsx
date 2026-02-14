import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Search,
  User,
  Menu,
  X,
  Home as HomeIcon,
  Briefcase,
  Landmark,
  BookOpen,
  Info
} from "lucide-react";

const HERO_IMAGES = [
  "/hero-visa-1.png",
  "/hero-visa-2.png",
  "/hero-visa-3.png"
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showTopbar, setShowTopbar] = useState(true);

  // HERO fade slider (lent, fantôme)
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Topbar hide/show on scroll
  useEffect(() => {
    const onScroll = () => setShowTopbar(window.scrollY === 0);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
  const carousel = document.getElementById("productsCarousel");
  if (!carousel) return;

  let index = 0;
  let intervalId;
  let isPaused = false;

  const cards = carousel.children;

  const startAutoSlide = () => {
    intervalId = setInterval(() => {
      if (isPaused || window.innerWidth > 450) return;

      index = (index + 1) % cards.length;

      carousel.scrollTo({
        left: cards[index].offsetLeft,
        behavior: "smooth"
      });
    }, 2500);
  };

  const pause = () => (isPaused = true);
  const resume = () => (isPaused = false);

  carousel.addEventListener("touchstart", pause);
  carousel.addEventListener("touchmove", pause);
  carousel.addEventListener("touchend", resume);

  startAutoSlide();

  return () => {
    clearInterval(intervalId);
    carousel.removeEventListener("touchstart", pause);
    carousel.removeEventListener("touchmove", pause);
    carousel.removeEventListener("touchend", resume);
  };
}, []);

  return (
    <div className="home">

      {/* ================= TOPBAR DESKTOP ================= */}
      <div className={`topbar-desktop ${showTopbar ? "visible" : "hidden"}`}>
        <span>Site Web institutionnel</span>
        <div className="topbar-links">
          <span><Search size={14}/> Près</span>
          <span>Contactez-nous</span>
          <span>Succursales</span>
        </div>
      </div>

      {/* ================= HEADER DESKTOP ================= */}
      <header className="header-desktop">
        <div className="logo">
          <strong>BPER BANQUE:</strong>
        </div>

        <nav className="nav-desktop">
          <Link to="/particuliers">Particuliers</Link>
          <Link to="/entreprises">Entreprises et professionnels</Link>
          <Link to="/patrimoine">Gestion de patrimoine</Link>
          <Link to="/magazine">Magazine BPER</Link>
          <Link to="/apropos">Qui sommes-nous ?</Link>
        </nav>

        <div className="actions-desktop">
          <Link to="/apply" className="btn-outline animated-btn">
            Ouvrir un compte en ligne
          </Link>
          <Link to="/login" className="btn-solid animated-btn">
            <User size={16}/> Se connecter
          </Link>
        </div>
      </header>

      {/* ================= MOBILE TOP CTA ================= */}
      <div className={`mobile-top-cta ${showTopbar ? "visible" : "hidden"}`}>
        <Link to="/apply" className="animated-btn">
          Ouvrir un compte en ligne →
        </Link>
      </div>

      {/* ================= HEADER MOBILE ================= */}
      <header className="header-mobile">
        <div className="mobile-left">
          <span className="logo-mobile">
            <strong>BPER BANQUE:</strong>
          </span>
          <Search size={20}/>
        </div>

        <div className="mobile-right">
          <Link to="/login" className="btn-solid small animated-btn">
            <User size={16}/> Se connecter
          </Link>
          <button className="burger animated-btn" onClick={() => setMenuOpen(true)}>
            <Menu size={26}/>
          </button>
        </div>
      </header>

      {/* ================= MENU MOBILE ================= */}
      {menuOpen && (
        <div className="mobile-menu fade-panel">
          <button className="close animated-btn" onClick={() => setMenuOpen(false)}>
            <X size={26}/>
          </button>

          <Link to="/particuliers"><HomeIcon/> Particuliers</Link>
          <Link to="/entreprises"><Briefcase/> Entreprises et professionnels</Link>
          <Link to="/patrimoine"><Landmark/> Gestion de patrimoine</Link>
          <Link to="/magazine"><BookOpen/> Magazine BPER</Link>
          <Link to="/apropos"><Info/> Qui sommes-nous ?</Link>
        </div>
      )}

      {/* ================= HERO IMAGE SECTION ================= */}
      <section className="hero">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img}
            className={`hero-bg ${i === heroIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="hero-overlay">
          <h1>
            Obtenez une carte VISA<br/>
            avec votre compte BPER
          </h1>
          <p>
            Obtenez une carte de débit Visa en ouvrant un compte en ligne
            avec des frais avantageux et profitez d’une expérience bancaire
            fluide et sécurisée.
          </p>
        </div>
      </section>









{/* ================= PROMO CARD BPER ================= */}
<section className="promo-card">
  <div className="promo-card-inner">

    {/* TEXTE */}
    <div className="promo-card-text">
      <span className="promo-eyebrow">
        Apporter de nouvelles liquidités à BPER Banca
      </span>

      <h2>
        Jusqu'à <strong>3 % brut par an</strong><br />
        pendant <strong>6 mois</strong>.
      </h2>

      <p>
        Avec BPER, vous avez désormais une opportunité réservée à ceux
        qui apportent de <strong>nouvelles liquidités</strong> :
        le service <strong>DiPiù</strong>, le dépôt à terme fixe qui vous
        offre <strong>jusqu'à 3 % brut par an pendant 6 mois</strong>.
      </p>

      <p className="promo-highlight">
        Choisissez la solution DiPiù qui vous convient et
        <strong> profitez-en avant le 31 mars 2026 !</strong>
      </p>

      <Link to="/dipiu" className="btn-solid animated-btn">
        En savoir plus
      </Link>
    </div>

    {/* CARTE VERTE */}
    <div className="promo-card-visual">
      <div className="promo-rate">
        <span className="promo-rate-top">
          DEPOSITO VINCOLATO<br />FINO AL
        </span>

        <div className="promo-rate-value">3,00%</div>

        <span className="promo-rate-bottom">
          TASSO LORDO (ANNUO)<br />PER 6 MESI
        </span>
      </div>
    </div>

  </div>
</section>






{/* ================= PROMO CARD – PRÊTS PERSONNELS ================= */}
<section className="promo-card">
  <div className="promo-card-inner reverse">

    {/* IMAGE GAUCHE */}
    <div className="promo-image-wrapper">
      <img
        src="/pret-velo.jpg"
        alt="Prêt personnel vélo"
        className="promo-image"
      />

      {/* BADGE TAUX */}
      <div className="promo-badge">
        <span className="badge-small">TAN fisso</span>
        <span className="badge-big">8,29%</span>
        <span className="badge-old">9,50%</span>
        <span className="badge-label">TAEG</span>
        <span className="badge-big">9,10%</span>
      </div>
    </div>

    {/* TEXTE DROITE */}
    <div className="promo-card-visual dark">
      <div className="promo-text-dark">

        <div className="promo-tag">
          <span className="promo-icon">🚲</span>
          Prêts personnels
        </div>

        <h2>
          Votre nouveau vélo,<br />
          que vous nous prêtez.
        </h2>

        <p>
          Jusqu'au <strong>27 février 2026</strong>, si vous faites une
          demande de <strong>prêt personnel</strong>, vous bénéficiez
          d'un <strong>TAEG fixe subventionné</strong> et de
          <strong> frais de traitement nuls</strong>.
        </p>

        <p>
          Par exemple, vous pouvez demander :
          <strong> 10 000 € en 72 mois</strong>,
          <strong> TAEG fixe de 8,29 %</strong>,
          <del> 9,50 %</del> ou
          <strong> 9,10 %</strong>, sans frais de dossier.
        </p>

        <Link to="/prets-personnels" className="btn-white animated-btn">
          En savoir plus
        </Link>

      </div>
    </div>

  </div>
</section>





{/* ================= SECTION OUVERTURE DE COMPTE ================= */}
<section className="account-section">
  <div className="account-inner">

    {/* COLONNE GAUCHE */}
    <div className="account-text">
      <span className="account-kicker">
        Comptes & services bancaires
      </span>

      <h2>
        Rejoignez <strong>BPER BANQUE</strong><br />
        et choisissez le compte<br />
        adapté à vos besoins.
      </h2>

      <p className="account-intro">
        Une offre simple, transparente et pensée pour gérer
        votre argent au quotidien, en toute sécurité.
      </p>
    </div>

    {/* CARTE OFFRE */}
    <div className="account-card">

      <div className="account-card-content">

        <span className="account-eyebrow">
          FORMULE LIGHT – COMPTE PRIVÉ
        </span>

        <div className="account-price">
          <span className="price-old">8,80 € / mois</span>
          <span className="price-new">0 € / mois</span>
        </div>

        <p className="account-lead">
          Profitez d’un <strong>compte courant BPER BANQUE</strong>
          avec <strong>carte Visa</strong> incluse et des services
          essentiels pour vos opérations quotidiennes.
        </p>

        <ul className="account-features">
          <li>Carte de débit Visa internationale</li>
          <li>Retraits sans frais aux distributeurs du groupe BPER</li>
          <li>Virements SEPA en ligne inclus</li>
          <li>Accès aux services digitaux et à l’assistance client</li>
        </ul>

        <div className="account-actions">
          <Link to="/ouvrir-compte" className="btn-solid animated-btn">
            Ouvrir un compte
          </Link>
        </div>

      </div>

      {/* IMAGE */}
      <div className="account-image">
        <img
          src="/compte-visa-ski.png"
          alt="Carte Visa BPER BANQUE"
        />
      </div>

    </div>

  </div>
</section>






{/* ================= SECTION COMPTE PERSONNEL / PRO ================= */}
<section className="dual-account-section">
  <div className="dual-account-inner">

    {/* TEXTE GAUCHE */}
    <div className="dual-account-text">
      <h2>
        Compte personnel<br />
        ou <strong>professionnel</strong> ?
      </h2>

      <p className="dual-account-intro">
        Choisissez la solution bancaire la plus adaptée à votre activité
        et commencez dès aujourd’hui avec <strong>BPER BANQUE</strong>.
      </p>

      <p>
        Que vous soyez particulier, entrepreneur individuel ou titulaire
        d’un compte professionnel assujetti à la TVA, BPER vous propose
        une expérience bancaire sur mesure, combinant services numériques
        performants et accompagnement personnalisé, en ligne comme en agence.
      </p>

      <p className="dual-account-note">
        Offre réservée aux nouveaux clients.
      </p>
    </div>

    {/* CARTE DROITE */}
    <div className="dual-account-card">

      <div className="dual-account-card-content">
        <p className="dual-account-highlight">
          Les frais peuvent être réduits ou éliminés en activant
          un terminal de paiement et en disposant également
          d’un compte privé BPER BANQUE.
        </p>

        <ul className="dual-account-features">
          <li>Carte de débit <strong>Visa Business</strong></li>
          <li>Retraits gratuits aux distributeurs automatiques BPER</li>
          <li>Opérations F23, F24 et SDD incluses</li>
          <li>Frais de tenue et de rédaction inclus</li>
          <li>Consultations dédiées en ligne et en agence</li>
          <li>Solutions d’assurance et de protection avec Unipol et SiSalute</li>
        </ul>

        <Link to="/ouvrir-compte-pro" className="btn-solid animated-btn">
          Ouvrir un compte
        </Link>
      </div>

      {/* IMAGE */}
      <div className="dual-account-image">
        <img
          src="/compte-professionnel-tpe.png"
          alt="Compte professionnel BPER BANQUE"
        />
      </div>

    </div>

  </div>
</section>






{/* ================= OFFRES & SERVICES ================= */}
<section className="products-section">

  <h2 className="products-title">
    Des solutions bancaires conçues pour votre quotidien
  </h2>

  <div className="products-inner mobile-carousel" id="productsCarousel">

    {/* CARTE 1 */}
    <article className="product-card animated-card">
      <div className="product-media">
        <img src="/img-pos.png" alt="Financement numérique" className="product-img" />
        <span className="product-icon">🏪</span>
      </div>

      <span className="badge badge-soft">FINANCEMENT NUMÉRIQUE</span>

      <h3>Encaissement instantané au point de vente</h3>

      <p>
        Accédez immédiatement à vos liquidités grâce à des solutions de
        financement numérique intégrées, avec un pilotage sécurisé et
        un accompagnement BPER.
      </p>

      <Link to="/financement-numerique" className="btn-link animated-btn">
        En savoir plus →
      </Link>
    </article>

    {/* CARTE 2 */}
    <article className="product-card animated-card">
      <div className="product-media">
        <img src="/img-unipolmove.png" alt="UnipolMove" className="product-img" />
        <span className="product-icon">🚗</span>
      </div>

      <span className="badge badge-promo">OFFRE EN COURS</span>

      <h3>UnipolMove – Mobilité fluide et connectée</h3>

      <p>
        Simplifiez vos déplacements grâce à une solution de télépéage
        intelligente, sans frais d’activation, intégrée à votre
        environnement bancaire BPER.
      </p>

      <Link to="/unipolmove" className="btn-link animated-btn">
        Découvrir l’offre →
      </Link>
    </article>

    {/* CARTE 3 */}
    <article className="product-card animated-card">
      <div className="product-media">
        <img src="/img-card.png" alt="Cartes de crédit BPER" className="product-img" />
        <span className="product-icon">💳</span>
      </div>

      <span className="badge badge-promo">AVANTAGE CLIENT</span>

      <h3>Cartes de crédit sans frais la première année</h3>

      <p>
        Profitez de cartes BPER Prime ou Premium avec des plafonds
        personnalisables, des assurances incluses et des frais
        annuels offerts la première année.
      </p>

      <Link to="/cartes" className="btn-link animated-btn">
        Voir les cartes →
      </Link>
    </article>

  </div>
</section>







{/* ================= SIMULATEURS ================= */}
<section className="simulators-section">

  <div className="simulators-wrapper">

    {/* BLOC 1 */}
    <div className="simulator-item">
      <div className="simulator-text">
        <h3>
          Vous souhaitez calculer vos mensualités de prêt personnel&nbsp;?
        </h3>
        <p>
          Indiquez le montant et la durée du prêt pour obtenir,
          en quelques secondes, une estimation claire et fiable
          de votre mensualité.
        </p>

        <Link to="/simulateur-pret-personnel" className="btn-solid animated-btn">
          Calcul du prêt
        </Link>
      </div>

      <div className="simulator-media">
        <span className="simulator-icon">🧮</span>
        
        <span className="euro-icon euro-2">€</span>
        <span className="euro-icon euro-3">€</span>

        <img src="/illus-calcul-1.png" alt="Simulation prêt personnel" />
      </div>
    </div>

    {/* BLOC 2 */}
    <div className="simulator-item">
      <div className="simulator-text">
        <h3>
          Calculez votre mensualité de prêt hypothécaire
          à taux fixe ou variable
        </h3>
        <p>
          Vous connaissez le prix de votre futur bien immobilier ?
          Utilisez notre simulateur pour évaluer précisément
          vos mensualités et votre capacité d’emprunt.
        </p>

        <Link to="/simulateur-pret-immobilier" className="btn-solid animated-btn">
          Calculer un prêt hypothécaire
        </Link>
      </div>

      <div className="simulator-media">
        <span className="simulator-icon">💶</span>
        
        <span className="euro-icon euro-2">€</span>
        <span className="euro-icon euro-3">€</span>

        <img src="/illus-calcul-2.png" alt="Simulation prêt immobilier" />
      </div>
    </div>

  </div>
</section>








{/* ================= AIDE & ASSISTANCE ================= */}
<section className="help-section">

  <div className="help-container">

    {/* forme décorative */}
    <span className="help-shape"></span>

    <h2 className="help-title">Besoin d’aide&nbsp;?</h2>

    <div className="help-cards">

      <article className="help-card">
        <h3>Trouver des réponses</h3>
        <p>Consultez notre centre d’aide et les questions fréquentes BPER.</p>
        <Link to="/faq" className="help-link">Accéder à la FAQ →</Link>
        <span className="help-icon">📄</span>
      </article>

      <article className="help-card">
        <h3>Nous contacter directement</h3>
        <p>Appelez-nous au <strong>059 4242</strong> pour une assistance dédiée.</p>
        <Link to="/contact" className="help-link">Nous contacter →</Link>
        <span className="help-icon">🎧</span>
      </article>

      <article className="help-card">
        <h3>Nous rendre visite</h3>
        <p>Trouvez l’agence BPER la plus proche de chez vous.</p>
        <Link to="/agences" className="help-link">Trouver une agence →</Link>
        <span className="help-icon">📍</span>
      </article>

    </div>
  </div>
</section>














{/* ================= FOOTER ================= */}
<footer className="footer">

  <div className="footer-inner">

    {/* bloc gauche arrondi */}
    <div className="footer-main">

      <div className="footer-logo">
        <strong>BPER:</strong>
      </div>

      <div className="footer-columns">

        <div className="footer-col">
          <h4>Informations utiles</h4>
          <a href="#">Travaillez avec nous</a>
          <a href="#">Signalements et plaintes</a>
          <a href="#">Chiffres utiles</a>
          <a href="#">Foire aux questions</a>
          <a href="#">Trouver des succursales</a>
        </div>

        <div className="footer-col">
          <h4>Prêts et hypothèques</h4>
          <a href="#">Hypothèques</a>
          <a href="#">Calculateur de prêt hypothécaire</a>
          <a href="#">Prêts personnels</a>
          <a href="#">Calcul du prêt</a>
          <a href="#">Prêt hypothécaire à 100 %</a>
        </div>

      </div>
    </div>

    {/* bloc droit */}
    <div className="footer-side">

      <div className="footer-col">
        <h4>Services numériques</h4>
        <a href="#">Services bancaires en ligne</a>
        <a href="#">Commerce en ligne</a>
        <a href="#">Services bancaires aux entreprises</a>
        <a href="#">Sécurité en ligne</a>
      </div>

      <div className="footer-col">
        <h4>Banque BPER</h4>
        <a href="#">Site web institutionnel</a>
        <a href="#">Le groupe BPER Banca</a>
        <a href="#">Durabilité</a>
        <a href="#">Distribution d’assurances</a>
        <a href="#">Non-respect des décisions de l’ABF et de l’ACF</a>
      </div>

    </div>
  </div>

  {/* bas footer */}
  <div className="footer-bottom">

    <div className="footer-socials">
      <span>Suivez-nous sur</span>
      <a href="#">f</a>
      <a href="#">in</a>
      <a href="#">▶</a>
      <a href="#">◎</a>
    </div>

    <div className="footer-legal">
      <span>Numéro de TVA 03830780361</span>
      <a href="#">Confidentialité</a>
      <a href="#">Politique relative aux cookies</a>
      <a href="#">Préférences relatives aux cookies</a>
      <a href="#">Transparence</a>
      <a href="#">Accessibilité</a>
    </div>

  </div>
</footer>






    </div>
  );
}












