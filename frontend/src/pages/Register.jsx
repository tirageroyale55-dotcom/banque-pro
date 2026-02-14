export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6">Inscription</h2>
        <input className="border p-2 w-full mb-4" placeholder="Nom" />
        <input className="border p-2 w-full mb-4" placeholder="Email" />
        <input className="border p-2 w-full mb-4" type="password" placeholder="Mot de passe" />
        <button className="bg-primary text-white w-full py-2 rounded">
          Créer un compte
        </button>
      </div>
    </div>
  );
}