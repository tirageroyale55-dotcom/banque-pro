import { Outlet } from "react-router-dom";

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