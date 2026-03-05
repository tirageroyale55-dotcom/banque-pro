import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";

import "./dashboard.css";

export default function Dashboard() {

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");

  const [showBalanceBar, setShowBalanceBar] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {

    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

  }, []);

  useEffect(() => {

    const handleScroll = () => {

      const currentScroll = window.scrollY;

      if (currentScroll < lastScroll && currentScroll > 120) {
        setShowBalanceBar(true);
      } else {
        setShowBalanceBar(false);
      }

      setLastScroll(currentScroll);

    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, [lastScroll]);

  if (!data) return null;

  return (

    <div className="bank-app">

      <Header data={data}/>

      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <BalanceBar
        balance={data.balance}
        visible={showBalanceBar}
      />

      <div className="content">

        {activeTab === "accounts" && (

          <div className="account-card">

            <div className="account-header">
              Compte principal
            </div>

            <div className="balance">
              {data.balance} €
            </div>

            <div className="balance-date">
              Solde disponible
            </div>

            <div className="owner">
              {data.firstname} {data.lastname}
            </div>

            <div className="iban">
              {data.iban}
            </div>

          </div>

        )}

      </div>

      <BottomNav/>

    </div>

  );

}