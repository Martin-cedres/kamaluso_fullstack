import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface SublimationAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const SublimationAccessModal: React.FC<SublimationAccessModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/leads/register-sublimator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrarse');
            }

            // Éxito - cerrar modal y redirigir
            onClose();

            if (onSuccess) {
                onSuccess();
            } else {
                // Redirigir a la categoría de sublimación
                router.push('/productos/papeleria-sublimable');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                {/* Header con gradiente cálido */}
                <div className="bg-gradient-to-r from-naranja to-amarillo p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">🔥</span>
                        <h2 className="text-2xl font-bold">Acceso Mayorista</h2>
                    </div>
                    <p className="text-white/90 text-sm">
                        Regístrate para ver precios exclusivos para sublimadores
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-textoPrimario mb-1"
                        >
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Tu nombre"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-naranja focus:border-naranja outline-none transition"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-textoPrimario mb-1"
                        >
                            WhatsApp
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="099 123 456"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-naranja focus:border-naranja outline-none transition"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-textoPrimario mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="tu@email.com"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-naranja focus:border-naranja outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-naranja to-amarillo text-white font-bold rounded-xl hover:shadow-kamalusoWarm hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Registrando...
                            </span>
                        ) : (
                            'Desbloquear Precios'
                        )}
                    </button>

                    <p className="text-xs text-textoSecundario text-center">
                        Al registrarte, accedés inmediatamente a todos los precios mayoristas.
                        <br />
                        Sin compromiso.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SublimationAccessModal;
