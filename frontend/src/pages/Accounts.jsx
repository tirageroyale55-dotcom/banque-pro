import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Accounts({ data }) {

  return (

    <div className="content">

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

    </div>

  );

}