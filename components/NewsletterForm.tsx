import { useState } from 'react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setCoupon('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Algo salió mal');
      }

      setMessage(data.message);
      setCoupon(data.couponCode);
      setEmail('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold mb-4">Te regalamos 10% OFF en tu primer compra. </h2>
        <p className="text-gray-700 mb-8">¡Acceso a beneficios y regalos exclusivos, solo para suscriptores!</p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              required
              className="w-full px-4 py-3 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-pink-500 text-white px-6 py-3 rounded-r-md font-semibold hover:bg-pink-600 disabled:bg-gray-400 transition-colors flex-shrink-0"
            >
              {loading ? 'Enviando...' : 'Quiero mi cupón'}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md">
            <p>{message}</p>
            {coupon && (
              <p className="font-bold mt-2">Tu código de cupón es: <span className="bg-white px-2 py-1 rounded">{coupon}</span></p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-md">
            <p>{error}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsletterForm;
