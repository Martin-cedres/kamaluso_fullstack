import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'
import toast from 'react-hot-toast'

interface OrderItem {
    nombre: string
    quantity: number
    precio: number
    finish?: string
}

interface Order {
    _id: string
    name: string
    email: string
    total: number
    status: string
    items: OrderItem[]
    createdAt: string
    paymentMethod: string
}

interface PaymentPageProps {
    order: Order | null
    error?: string
}

export default function PaymentPage({ order, error }: PaymentPageProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    if (!order) return null

    const handlePayment = async () => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/payments/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order._id,
                    items: order.items,
                    paymentMethod: 'mercado_pago_online',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Error al conectar con Mercado Pago')
            }

            // Flag para limpiar carrito si fuera necesario (aunque en este caso es un pago diferido)
            localStorage.setItem('mp_pending_cart_clear', 'true');

            router.push(data.init_point)
        } catch (error: any) {
            console.error('Error:', error)
            toast.error(`Error al iniciar el pago: ${error.message}`)
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head>
                <title>Completar Pago | Kamaluso</title>
            </Head>

            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            ¡Hola, {order.name.split(' ')[0]}!
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Guardamos tu pedido para que puedas completarlo cuando quieras.
                        </p>
                    </div>

                    <div className="border-t border-b border-gray-200 py-4 mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de tu pedido</h3>
                        <ul className="divide-y divide-gray-200">
                            {order.items.map((item, index) => (
                                <li key={index} className="py-3 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
                                        {item.finish && <p className="text-xs text-gray-500">Acabado: {item.finish}</p>}
                                        <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        $U {(item.precio * item.quantity).toFixed(2)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-lg">
                        <span className="text-lg font-bold text-gray-900">Total a Pagar</span>
                        <span className="text-2xl font-extrabold text-pink-600">
                            $U {order.total.toFixed(2)}
                        </span>
                    </div>

                    {order.status === 'pagado' ? (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center">
                            <strong className="font-bold">¡Este pedido ya está pagado!</strong>
                            <p className="block sm:inline"> Gracias por tu compra.</p>
                        </div>
                    ) : (
                        <button
                            onClick={handlePayment}
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Cargando Mercado Pago...' : 'Pagar Ahora con Mercado Pago'}
                        </button>
                    )}

                    <div className="mt-6 text-center">
                        <a href="/" className="text-sm font-medium text-pink-600 hover:text-pink-500">
                            Volver a la tienda
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params as { id: string }

    if (!id || !ObjectId.isValid(id)) {
        return { props: { error: 'ID de pedido inválido' } }
    }

    try {
        const client = await clientPromise
        const db = client.db()

        const order = await db.collection('orders').findOne({ _id: new ObjectId(id) })

        if (!order) {
            return { props: { error: 'Pedido no encontrado' } }
        }

        // Serialize dates and ObjectIds
        const serializedOrder = {
            ...order,
            _id: order._id.toString(),
            createdAt: order.createdAt.toString(),
        }

        return {
            props: {
                order: serializedOrder,
            },
        }
    } catch (error) {
        console.error('Error fetching order:', error)
        return { props: { error: 'Error interno del servidor' } }
    }
}
