export default function Produits({ isDesktop = false }) {
  return (
    <div className={isDesktop ? "" : "page-content"}>
      <h2 className="cards-title">Nos Produits</h2>
      <div className="account-card">
        <h3>Prêts et Financements</h3>
        <p>Découvrez nos solutions de crédit adaptés à vos projets.</p>
        <button className="btn-light" style={{marginTop: '10px'}}>En savoir plus</button>
      </div>
      <div className="account-card" style={{marginTop: '15px'}}>
        <h3>Épargne</h3>
        <p>Optimisez vos économies avec nos livrets à taux préférentiels.</p>
      </div>
    </div>
  );
}