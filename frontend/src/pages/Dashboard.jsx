import { useEffect, useState } from "react";
import { Bell, HelpCircle, User, Home, CreditCard, Grid, Heart } from "lucide-react";

export default function Dashboard() {

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {

    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  const balance = "5 421,76 €";

  return (

    <div className="bg-[#f5f6fa] min-h-screen pb-24">

      {/* HEADER */}

      <header
        className={`
        sticky top-0 z-50
        backdrop-blur-md
        transition-all duration-300
        ${scrolled ? "bg-white/70 shadow-sm" : "bg-white/40"}
        `}
      >

        {/* TOP BAR */}

        <div className="flex justify-between items-center px-4 pt-4">

          <button>
            <User size={22} />
          </button>

          <div className="flex gap-3">

            <button>
              <Bell size={22}/>
            </button>

            <button>
              <HelpCircle size={22}/>
            </button>

          </div>

        </div>

        {/* GROS SOLDE */}

        <div
          className={`
          text-center transition-all duration-300
          ${scrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100 py-4"}
          `}
        >

          <p className="text-xs text-gray-500">
            Solde disponible
          </p>

          <h1 className="text-3xl font-bold">
            {balance}
          </h1>

        </div>

      </header>

      {/* TABS */}

      <div className="sticky top-[60px] z-40 bg-white">

        <div className="flex justify-between items-center px-4 pt-2">

          <div className="flex gap-6 text-sm font-medium">

            <button className="border-b-2 border-black pb-2">
              Comptes
            </button>

            <button className="pb-2 text-gray-500">
              Cartes
            </button>

            <button className="pb-2 text-gray-500">
              Financement
            </button>

          </div>

          {/* SOLDE QUI ENTRE DANS LES TABS */}

          <div
            className={`
            transition-all duration-300
            ${scrolled ? "opacity-100" : "opacity-0"}
            `}
          >
            <span className="font-semibold">
              {balance}
            </span>
          </div>

        </div>

      </div>

      {/* CONTENU */}

      <div className="p-4 space-y-4">

        {[1,2,3,4,5,6,7,8].map((item)=>(
          <div
            key={item}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            Transaction exemple
          </div>
        ))}

      </div>

      {/* BOTTOM NAVIGATION */}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">

        <div className="flex justify-around py-2 text-xs">

          <button className="flex flex-col items-center">
            <Home size={20}/>
            Accueil
          </button>

          <button className="flex flex-col items-center">
            <CreditCard size={20}/>
            Payer
          </button>

          <button className="flex flex-col items-center">
            <Grid size={20}/>
            Produits
          </button>

          <button className="flex flex-col items-center">
            <Heart size={20}/>
            Lifestyle
          </button>

          <button className="flex flex-col items-center">
            <HelpCircle size={20}/>
            Aide
          </button>

        </div>

      </nav>

    </div>

  );
}