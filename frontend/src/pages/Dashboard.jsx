import { useEffect, useState } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";
import { FaLock, FaKey, FaPauseCircle, FaEllipsisH } from "react-icons/fa";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        window.location = "/login";
      });
  }, []);

  if (!data) return null;

  const spent = 200;
  const remaining = 2800;
  const spentPercentage = (spent / (spent + remaining)) * 100;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-4 max-w-md mx-auto">
        {/* Carte bancaire */}
        <div className="relative bg-green-600 text-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-xl">BPER</span>
            <span className="text-sm uppercase">Débit</span>
          </div>
          <h2 className="text-sm mb-1">Carte de Crédit</h2>
          <h1 className="text-2xl font-bold mb-2">**** {data.cardLast4}</h1>
          <p className="text-sm mb-4">IBAN : {data.iban}</p>

          {/* Boutons de contrôle */}
          <div className="flex justify-between mt-4">
            <button className="flex flex-col items-center text-white hover:text-gray-200">
              <FaLock size={20} />
              <span className="text-xs mt-1">PIN</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-gray-200">
              <FaKey size={20} />
              <span className="text-xs mt-1">KEY6</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-gray-200">
              <FaPauseCircle size={20} />
              <span className="text-xs mt-1">SUSPENDI</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-gray-200">
              <FaEllipsisH size={20} />
              <span className="text-xs mt-1">AUTRE</span>
            </button>
          </div>
        </div>

        {/* Prélèvements et paiements */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="text-gray-700 font-semibold mb-2">Prélèvements et paiements mensuels</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Dépensé</span>
              <span className="font-bold text-lg">{spent} €</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Restant</span>
              <span className="font-bold text-lg">{remaining} €</span>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle
                  className="text-gray-200"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="16"
                  cx="18"
                  cy="18"
                />
                <circle
                  className="text-green-600"
                  strokeWidth="4"
                  strokeDasharray={`${spentPercentage}, 100`}
                  stroke="currentColor"
                  fill="transparent"
                  r="16"
                  cx="18"
                  cy="18"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                {Math.round(spentPercentage)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}