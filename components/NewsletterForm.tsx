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
    <section className="bg-slate-50 py-20 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold tracking-widest uppercase mb-6">
          Beneficio Exclusivo
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-6 tracking-tighter">Te regalamos <span className="text-amber-600">10% OFF</span> en tu primer compra</h2>
        <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">Únete a nuestra comunidad y recibe un cupón de regalo inmediato, además de acceso a preventas y diseños nuevos.</p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Escribe tu mejor email..."
              required
              className="w-full px-6 py-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white shadow-sm transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-black disabled:bg-slate-400 transition-all shadow-lg hover:shadow-xl flex-shrink-0"
            >
              {loading ? 'Enviando...' : 'Obtener mi 10% OFF'}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-8 p-6 bg-white border border-green-100 shadow-sm rounded-2xl animate-in fade-in zoom-in duration-300">
            <p className="text-green-800 font-medium">✓ {message}</p>
            {coupon && (
              <div className="mt-4 flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Código de Cupón</span>
                <span className="bg-slate-900 text-white px-6 py-2 rounded-lg font-mono text-xl font-bold tracking-widest shadow-inner">{coupon}</span>
                <p className="text-xs text-slate-500 mt-2">Úsalo al finalizar tu compra</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            <p>{error}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsletterForm;
