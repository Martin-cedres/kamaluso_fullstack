import React from 'react';

interface CartItem {
    _id: string;
    nombre: string;
    quantity: number;
    precio: number;
    finish?: string;
}

interface Order {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    shippingDetails: {
        method: string;
        address: string;
        notes?: string;
    };
    items: CartItem[];
    total: number;
    paymentMethod: string;
    createdAt: string;
}

interface OrderReceiptProps {
    order: Order;
}

export default function OrderReceipt({ order }: OrderReceiptProps) {
    const date = new Date(order.createdAt).toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return (
        <div className="order-receipt-print-root">
            {/* Contenedor A4 - Diseño Clásico y Sobrio */}
            <div className="order-receipt-container bg-white text-black font-serif shadow-none border-0 flex flex-col"
                style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm' }}>

                {/* 1. ENCABEZADO: IDENTIDAD (IZQ) Y DOCUMENTO (DER - DISCRETO) */}
                <div className="flex justify-between items-start mb-8 border-b pb-6">
                    <div className="flex items-center gap-6">
                        <img
                            src="/logo.webp"
                            alt="Kamaluso"
                            style={{ width: '48mm', height: 'auto', display: 'block' }}
                        />
                        <div className="text-[11px] leading-tight text-gray-700 border-l border-gray-200 pl-6">
                            <p className="font-bold uppercase text-[12px] text-black">Papelería Personalizada Kamaluso</p>
                            <p>Calle Massini Nro. 136, San José de Mayo</p>
                            <p>RUT: 150754350013 | Cel: 098615074</p>
                            <p className="mt-2 font-bold text-black lowercase text-[10px]">www.papeleriapersonalizada.uy — www.kamaluso.com</p>
                        </div>
                    </div>

                    <div className="text-right pt-2">
                        <h1 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Nota de Pedido</h1>
                        <p className="text-[11px] font-medium text-gray-500 italic pb-1 border-b border-gray-100 px-2 inline-block">Fecha: {date}</p>
                    </div>
                </div>

                {/* 2. SECCIÓN DE DATOS (MÁS PEQUEÑOS Y SOBRIOS) */}
                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-bold uppercase border-b border-gray-200 pb-1 mb-2">Datos del Cliente</h2>
                        <p className="text-sm font-bold uppercase">{order.name}</p>
                        <p className="text-xs text-gray-600">{order.email || ''}</p>
                        <p className="text-xs font-bold">{order.phone || ''}</p>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-[10px] font-bold uppercase border-b border-gray-200 pb-1 mb-2">Detalles de Entrega</h2>
                        <p className="text-xs"><span className="font-bold">Método:</span> {order.shippingDetails.method}</p>
                        <p className="text-xs leading-tight font-bold uppercase mt-1">{order.shippingDetails.address}</p>
                        <p className="text-[10px] uppercase mt-1 italic">Pago: {order.paymentMethod}</p>
                    </div>
                </div>

                {/* 3. TABLA DE PRODUCTOS (CLÁSICA CON BORDES) */}
                <div className="mb-10 min-h-[550px]">
                    <div className="w-full border-t border-b border-black py-2 grid grid-cols-12 px-2 text-[10px] font-bold uppercase">
                        <div className="col-span-1">Cant.</div>
                        <div className="col-span-7">Descripción</div>
                        <div className="col-span-2 text-right">Precio Unit.</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                    </div>

                    <div className="space-y-0 border-b border-gray-100">
                        {order.items.map((item, index) => (
                            <div key={item._id || index} className="grid grid-cols-12 px-2 py-3 items-center border-b border-gray-50 text-[13px]">
                                <div className="col-span-1 font-bold text-center border-r border-gray-100 mr-2">
                                    {item.quantity}
                                </div>
                                <div className="col-span-7">
                                    <p className="font-bold uppercase leading-none">{item.nombre}</p>
                                    {item.finish && (
                                        <p className="text-[10px] text-gray-500 font-bold mt-1">
                                            Terminación: {item.finish}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2 text-right text-gray-600">
                                    ${(item.precio || 0).toLocaleString()}
                                </div>
                                <div className="col-span-2 text-right font-bold">
                                    ${((item.precio || 0) * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. TOTALES (SIMPLE Y ALINEADO) */}
                <div className="flex justify-end">
                    <div className="w-[200px] border-t-2 border-black pt-4 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold uppercase text-[11px]">Total del Pedido</span>
                            <span className="text-xl font-bold">${(order.total || 0).toLocaleString()}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 text-right uppercase">Pesos Uruguayos (UYU)</p>
                    </div>
                </div>

                {/* 5. PIE DE PÁGINA (MINIMALISTA) */}
                <div className="mt-auto pt-10 flex justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center border-t border-gray-100 pt-4">
                    GRACIAS POR ELEGIR PAPELERÍA PERSONALIZADA KAMALUSO
                </div>
            </div>

            <style jsx global>{`
                .order-receipt-container {
                    margin: 0 auto;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                }
            `}
            </style>
        </div>
    );
}
