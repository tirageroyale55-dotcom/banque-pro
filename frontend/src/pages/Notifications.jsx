export default function Notifications({ isDesktop = false }) {
  return (
    <div className={isDesktop ? "" : "page-content"} style={{padding: isDesktop ? "0" : "30px"}}>
      <h2 className="cards-title">Notifications</h2>
      <div className="account-card">
        <p>Aucune notification pour le moment.</p>
      </div>
    </div>
  );
}