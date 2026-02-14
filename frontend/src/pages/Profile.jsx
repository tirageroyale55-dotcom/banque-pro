import Navbar from "../components/Navbar";

export default function Profile() {
  return (
    <>
      <Navbar />
      <div className="card">
        <h2>Profil</h2>
        <p>Données personnelles sécurisées</p>
        <p><strong>Nom :</strong> Client Test</p>
        <p><strong>Email :</strong> client@test.com</p>
        <p><strong>Rôle :</strong> Client</p>
      </div>
    </>
  );
}



