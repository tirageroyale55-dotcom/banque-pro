import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ClientLayout() {

  return (

    <div className="bank-layout">

      {/* HEADER / NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <div className="page-content">
        <Outlet />
      </div>

    </div>

  );

}