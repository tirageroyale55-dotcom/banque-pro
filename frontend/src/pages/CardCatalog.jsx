import { ChevronRight, ShieldCheck, Zap, Globe } from "lucide-react";

const BPER_CATALOG = [
  {
    id: "debit-online",
    name: "BPER Card Debit Online",
    type: "DÉBIT",
    price: "0,00 €",
    period: "/ mois",
    color: "linear-gradient(135deg, #005a64 0%, #003d44 100%)",
    desc: "La solution gratuite pour vos achats quotidiens et paiements en ligne sécurisés.",
    features: ["Paiements sans contact", "Apple & Google Pay"]
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CRÉDIT",
    price: "3,50 €",
    period: "/ mois",
    color: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    desc: "Une carte de crédit polyvalente avec débit différé pour plus de liberté.",
    features: ["Débit différé", "Assurance achats"]
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    price: "8,00 €",
    period: "/ mois",
    color: "linear-gradient(135deg, #b59410 0%, #8a6d0d 100%)",
    desc: "Le prestige BPER : plafonds élevés et services exclusifs d'assistance.",
    features: ["Conciergerie 24/7", "Accès Lounge VIP"]
  }
];

export default function CardCatalog() {
  const handleRequest = (cardName) => {
    alert(`Demande pour la ${cardName} : Votre conseiller BPER vous contactera sous 24h.`);
  };

  return (
    <div className="bper-catalog-section" style={{ marginTop: '40px', paddingBottom: '40px' }}>
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <h3 style={{ color: '#005a64', fontSize: '22px', fontWeight: '800', margin: 0 }}>Découvrir nos offres</h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>Trouvez la carte BPER adaptée à votre style de vie.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 15px' }}>
        {BPER_CATALOG.map((item) => (
          <div key={item.id} style={{
            background: 'white',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9'
          }}>
            {/* Visuel de la Carte BPER */}
            <div style={{ 
              background: item.color, 
              height: '140px', 
              padding: '20px', 
              color: 'white', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>BPER:</span>
                <Globe size={20} style={{ opacity: 0.6 }} />
              </div>
              
              <div style={{ width: '40px', height: '30px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.3)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.type}</span>
                <img src="/mastercard_w.svg" alt="MC" style={{ height: '24px', opacity: 0.9 }} onError={(e) => e.target.style.display='none'}/>
              </div>
            </div>

            {/* Détails de l'offre */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>{item.name}</h4>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#005a64', fontWeight: '800', fontSize: '18px' }}>{item.price}</span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>{item.period}</span>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '20px' }}>{item.desc}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {item.features.map((feat, idx) => (
                  <span key={idx} style={{
                    fontSize: '11px',
                    color: '#334155',
                    background: '#f8fafc',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <ShieldCheck size={14} color="#005a64" /> {feat}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => handleRequest(item.name)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#005a64',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 12px rgba(0, 90, 100, 0.2)'
                }}
              >
                Demander cette carte <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}