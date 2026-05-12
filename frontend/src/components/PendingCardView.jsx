import React from 'react';
import { Wifi } from 'lucide-react';

export default function PendingCardView({ card }) {
  if (!card) return null;

  return (
    <div className="pending-card-wrapper">
      <div className="card-body-pending" style={{ background: card.bg }}>
        <div className="card-gloss-pending"></div>
        
        <div className="card-top-row-pending">
          <div className="bper-logo-pending" style={{ color: card.logoColor }}>
            BPER<span>:</span> <small>Banca</small>
          </div>
          <Wifi size={20} className="nfc-icon-pending" strokeWidth={1.5} />
        </div>

        <div className="emv-chip-pending">
          <div className="chip-line-pending horizontal-1"></div>
          <div className="chip-line-pending horizontal-2"></div>
          <div className="chip-line-pending vertical"></div>
        </div>

        <div className="card-bottom-row-pending">
          <div className="card-label-pending">{card.name}</div>
          <div className="mc-symbol-pending">
            <div className="circle-pending red"></div>
            <div className="circle-pending yellow"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pending-card-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 10px 0;
        }
        .card-body-pending {
          width: 280px; 
          aspect-ratio: 1.58 / 1; 
          border-radius: 14px;
          position: relative; 
          padding: 20px; 
          overflow: hidden;
          box-shadow: 0 15px 30px rgba(0,0,0,0.2);
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
        }
        .card-gloss-pending {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
        }
        .card-top-row-pending { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo-pending { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; color: white; }
        .bper-logo-pending span { color: #a3e635; }
        .bper-logo-pending small { font-size: 11px; font-weight: 400; opacity: 0.8; }
        .nfc-icon-pending { opacity: 0.8; transform: rotate(90deg); color: white; }

        .emv-chip-pending {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.15);
        }
        .chip-line-pending { position: absolute; background: rgba(0,0,0,0.2); }
        .horizontal-1 { width: 100%; height: 1px; top: 33%; }
        .horizontal-2 { width: 100%; height: 1px; top: 66%; }
        .vertical { height: 100%; width: 1px; left: 50%; }

        .card-bottom-row-pending { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-label-pending { font-size: 11px; font-weight: 800; opacity: 0.9; color: white; letter-spacing: 1px; text-transform: uppercase; }

        .mc-symbol-pending { display: flex; position: relative; width: 36px; height: 22px; }
        .circle-pending { width: 22px; height: 22px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }
      `}</style>
    </div>
  );
}