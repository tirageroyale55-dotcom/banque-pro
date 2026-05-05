import { ChevronRight, ShieldCheck } from "lucide-react";

const BPER_CATALOG = [
  { id: "deb", name: "BPER Card Debit Online", type: "DÉBIT", price: "0,00 €/mois", color: "#005a64", feat: ["Apple/Google Pay", "Sans contact"] },
  { id: "cla", name: "BPER Card Classic", type: "CRÉDIT", price: "3,50 €/mois", color: "#1e293b", feat: ["Débit différé", "Assurance"] },
  { id: "gol", name: "BPER Card Gold", type: "PREMIUM", price: "8,00 €/mois", color: "#b59410", feat: ["Conciergerie", "Lounge VIP"] }
];

export default function CardCatalog() {
  return (
    <div className="bper-catalog-container" style={{ marginTop: '30px', padding: '0 15px' }}>
      <h3 style={{ color: '#005a64', fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Découvrir nos offres</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {BPER_CATALOG.map((item) => (
          <div key={item.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ background: item.color, height: '60px', padding: '10px 15px', color: 'white', fontWeight: 'bold' }}>BPER:</div>
            <div style={{ padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</span>
                <span style={{ color: '#005a64', fontWeight: 'bold' }}>{item.price}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                {item.feat.map((f, i) => (
                  <span key={i} style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{f}</span>
                ))}
              </div>
              <button onClick={() => alert("Indisponible")} style={{ width: '100%', padding: '10px', border: '1px solid #005a64', borderRadius: '8px', color: '#005a64', background: 'none', fontWeight: '600' }}>
                En savoir plus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}