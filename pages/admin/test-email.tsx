import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-hot-toast';

export default function TestEmail() {
    const [testEmail, setTestEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/admin/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testEmail }),
            });

            const data = await res.json();
            setResult(data);

            if (data.email?.sent) {
                toast.success('Email de prueba enviado correctamente');
            } else {
                toast.error('Error al enviar email de prueba');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al ejecutar prueba');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Diagnóstico de Email</h1>

                <form onSubmit={handleTest} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email de Prueba
                        </label>
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            required
                            placeholder="tu-email@ejemplo.com"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Se enviará un email de prueba a esta dirección
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Probando...' : 'Ejecutar Prueba'}
                    </button>
                </form>

                {result && (
                    <div className="space-y-4">
                        {/* Configuración */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 text-gray-700">Configuración</h2>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {result.config.hasEmailUser ? (
                                        <span className="text-green-600">✅</span>
                                    ) : (
                                        <span className="text-red-600">❌</span>
                                    )}
                                    <span className="text-sm">
                                        EMAIL_SERVER_USER: <code className="bg-gray-100 px-2 py-1 rounded">{result.config.emailUserValue}</code>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {result.config.hasEmailPass ? (
                                        <span className="text-green-600">✅</span>
                                    ) : (
                                        <span className="text-red-600">❌</span>
                                    )}
                                    <span className="text-sm">EMAIL_SERVER_PASSWORD configurado</span>
                                </div>
                            </div>
                        </div>

                        {/* Conexión SMTP */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 text-gray-700">Conexión SMTP</h2>
                            {result.smtp.verified ? (
                                <div className="flex items-start gap-2 text-green-600">
                                    <span>✅</span>
                                    <span className="text-sm">Conexión SMTP verificada correctamente</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-start gap-2 text-red-600 mb-2">
                                        <span>❌</span>
                                        <span className="text-sm font-semibold">Error de conexión SMTP</span>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <code className="text-xs text-red-800">{result.smtp.error}</code>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Envío de Email */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4 text-gray-700">Envío de Email</h2>
                            {result.email.sent ? (
                                <div className="flex items-start gap-2 text-green-600">
                                    <span>✅</span>
                                    <span className="text-sm">Email de prueba enviado correctamente a {testEmail}</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-start gap-2 text-red-600 mb-2">
                                        <span>❌</span>
                                        <span className="text-sm font-semibold">Error al enviar email</span>
                                    </div>
                                    {result.email.error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <code className="text-xs text-red-800">{result.email.error}</code>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Instrucciones de solución */}
                        {(!result.config.hasEmailUser || !result.config.hasEmailPass || !result.smtp.verified) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <h3 className="font-semibold text-blue-900 mb-3">📋 Pasos para Solucionar</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                    <li>Ve a tu cuenta de Google (gmail.com)</li>
                                    <li>Accede a "Gestionar tu cuenta de Google" → Seguridad</li>
                                    <li>Activa la verificación en dos pasos</li>
                                    <li>Ve a "Contraseñas de aplicación"</li>
                                    <li>Genera una nueva contraseña para "Correo"</li>
                                    <li>Copia la contraseña generada (16 caracteres)</li>
                                    <li>En tu archivo .env.local agrega:
                                        <div className="bg-white p-3 rounded mt-2 font-mono text-xs">
                                            EMAIL_SERVER_USER=tu-email@gmail.com<br />
                                            EMAIL_SERVER_PASSWORD=la-contraseña-de-aplicación
                                        </div>
                                    </li>
                                    <li>Reinicia el servidor de desarrollo (npm run dev)</li>
                                </ol>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
