export default function Lifestyle({ isDesktop = false }) {
  return (
    <div className={isDesktop ? "" : "page-content"}>
      <h2 className="cards-title">Lifestyle & Avantages</h2>
      <div className="account-card" style={{background: 'linear-gradient(135deg, #005a64, #008c99)', color: 'white'}}>
        <h3 style={{color: 'white'}}>Programme Premium</h3>
        <p>Accédez à des offres exclusives chez nos partenaires commerçants.</p>
      </div>
    </div>
  );
}