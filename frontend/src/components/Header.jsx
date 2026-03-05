import { Bell, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({ data }) {

  const navigate = useNavigate();

  return (

    <div className="header">

      <div
        className="profile"
        onClick={() => navigate("/profile")}
      >

        <div className="avatar">
          {data.firstname?.charAt(0)}
          {data.lastname?.charAt(0)}
        </div>

      </div>

      <div className="header-icons">

        <Bell
          size={22}
          onClick={() => navigate("/notifications")}
        />

        <HelpCircle
          size={22}
          onClick={() => navigate("/help")}
        />

      </div>

    </div>

  );
}