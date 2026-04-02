export default function Aide() {
  return (
    <div className="page-content">
      <h2 className="cards-title">Besoin d'aide ?</h2>
      <div className="account-card">
        <div className="item">
          <p><b>📞 Service Client</b></p>
          <p>Disponible 24h/7j au +39 059 4242</p>
        </div>
        <hr style={{margin: '15px 0', opacity: 0.1}} />
        <div className="item">
          <p><b>📧 Email</b></p>
          <p>support@bper.it</p>
        </div>
      </div>
    </div>
  );
}