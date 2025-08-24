import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError("Credenciales incorrectas");
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-fondoClaro font-inter">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-kamaluso p-8 w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold mb-8 text-naranja text-center font-poppins">Login Kamaluso</h1>
        <div className="mb-6">
          <label className="block font-semibold text-textoPrimario mb-2">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-300 rounded-md p-3 w-full font-poppins focus:outline-none focus:ring-2 focus:ring-naranja" required />
        </div>
        <div className="mb-6">
          <label className="block font-semibold text-textoPrimario mb-2">Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border border-gray-300 rounded-md p-3 w-full font-poppins focus:outline-none focus:ring-2 focus:ring-naranja" required />
        </div>
        {error && <div className="mb-4 text-rojo font-bold text-center">{error}</div>}
        <button type="submit" className="w-full h-12 bg-rosa text-white font-bold rounded-md shadow hover:bg-pink-600 transition-colors duration-200 flex items-center justify-center text-lg">
          Ingresar
        </button>
      </form>
    </div>
  );
}
