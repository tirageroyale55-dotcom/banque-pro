import { Bell, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header({ data }) {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- LOGIQUE DE RÉCUPÉRATION DE LA PHOTO ---
  // On vérifie si la photo existe dans data ou data.user
  const userInfo = data?.user || data;
  const profileImage = userInfo?.profilePicture;

  return (
    <div className="header">
      {/* Avatar seulement sur mobile */}
      {!isDesktop && (
        <div className="profile" onClick={() => navigate("/profile")}>
          <div className="avatar">
            {/* ✅ MODIFICATION ICI : Priorité à l'image, sinon initiales */}
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <>
                {data.firstname?.charAt(0)}
                {data.lastname?.charAt(0)}
              </>
            )}
          </div>
        </div>
      )}

      <div className="header-icons">
        <Bell size={22} onClick={() => navigate("/notifications")} />
        <HelpCircle size={22} onClick={() => navigate("/help")} />
      </div>
    </div>
  );
}