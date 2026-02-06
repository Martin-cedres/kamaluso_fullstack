import React from 'react';

interface ShippingLabelProps {
    order: {
        _id?: string;
        name: string;
        phone?: string;
        shippingDetails: {
            method: string;
            address: string;
            notes?: string;
        };
        createdAt?: string;
    };
}

export default function ShippingLabel({ order }: ShippingLabelProps) {
    // Datos normalizados
    const address = order.shippingDetails?.address || (order as any).address || 'DIRECCIÓN NO ESPECIFICADA';
    const method = order.shippingDetails?.method || (order as any).method || 'RETIRO';
    const notes = order.shippingDetails?.notes || (order as any).notes || '';
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

    return (
        <div className="shipping-label-print-isolation">
            {/* 
                Contenedor Principal: 10cm Ancho x 15cm Alto (Vertical) 
                Diseño optimizado: Distribución balanceada
            */}
            <div className="shipping-label-container font-sans flex flex-col bg-white text-slate-900 overflow-hidden relative shadow-sm"
                style={{ width: '10cm', height: '15cm', padding: '0.4cm' }}>

                {/* --- HEADER: REMITENTE --- */}
                <div className="flex justify-between items-start mb-3 border-b-2 border-gray-800 pb-2">
                    <div className="text-left leading-none">
                        <h6 className="text-[7px] font-bold uppercase text-gray-500 mb-1 tracking-widest">REMITENTE</h6>
                        <p className="text-[10px] font-bold uppercase text-slate-900">Katherine Silva</p>
                        <p className="text-[9px] font-medium uppercase text-slate-600">San José de Mayo, UY</p>
                        <p className="text-[9px] font-medium uppercase text-slate-600">098 615 074</p>
                    </div>
                    {/* ID y Fecha */}
                    <div className="text-right leading-none">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            #{order._id?.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-[8px] font-bold text-gray-400">
                            {date}
                        </div>
                    </div>
                </div>

                {/* --- BODY: DESTINATARIO (SHIP TO) --- */}
                <div className="mb-2">
                    <h6 className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">DESTINATARIO</h6>
                    <p className="text-[20px] font-black uppercase leading-none tracking-tight text-slate-900 border-b border-gray-200 pb-2 mb-1">
                        {order.name}
                    </p>
                </div>

                {/* --- BODY: DIRECCIÓN CENTRAL (El bloque más grande) --- */}
                <div className="flex-grow border-2 border-black rounded-sm p-3 flex flex-col justify-center relative bg-gray-50">
                    <h6 className="absolute top-1 left-2 text-[7px] font-bold uppercase text-gray-500 tracking-widest bg-gray-50 px-1">
                        DIRECCIÓN DE ENTREGA
                    </h6>

                    <p className="text-[18px] font-extrabold uppercase leading-snug text-slate-900 text-center break-words px-1">
                        {address}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-300 text-center">
                        <p className="text-[14px] font-bold uppercase text-slate-700 flex items-center justify-center gap-2">
                            <span>📞</span> {order.phone || 'Sin teléfono'}
                        </p>
                    </div>
                </div>

                {/* --- BODY: NOTAS (Solo si existen) --- */}
                {notes && (
                    <div className="mt-3 bg-yellow-100 border border-yellow-300 p-2 rounded text-center">
                        <p className="text-[11px] font-bold uppercase leading-tight text-slate-900">
                            OBSERVACIONES: {notes}
                        </p>
                    </div>
                )}

                {/* --- FOOTER: MÉTODO Y LOGO --- */}
                <div className="mt-4 flex items-center justify-between border-t-2 border-black pt-2">
                    <div className="flex-1">
                        <h6 className="text-[8px] font-bold uppercase text-gray-400 mb-0.5">MÉTODO DE ENVÍO</h6>
                        <div className="text-[28px] font-black uppercase leading-none text-black tracking-tighter">
                            {method}
                        </div>
                    </div>

                    <div className="w-[2.2cm] flex flex-col justify-end items-end">
                        <img
                            src="/logo.webp"
                            alt="Kamaluso"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        />
                        <p className="text-[7px] font-bold text-slate-500 mt-1 whitespace-nowrap">
                            www.papeleriapersonalizada.uy
                        </p>
                    </div>
                </div>
            </div>

            {/* ESTILOS DE IMPRESIÓN (Manteniendo los fixes de A4) */}
            <style jsx global>{`
                .shipping-label-container {
                    border: 1px solid #e5e7eb;
                    margin: 20px auto;
                }

                @media print {
                    @page {
                        size: 100mm 150mm;
                        margin: 0mm !important;
                    }

                    html, body {
                        width: 100mm;
                        height: 150mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                    }

                    body * {
                        visibility: hidden;
                        height: 0;
                    }

                    .shipping-label-print-isolation,
                    .shipping-label-print-isolation * {
                        visibility: visible;
                        height: auto;
                    }

                    .shipping-label-print-isolation {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100mm;
                        height: 150mm;
                        margin: 0;
                        padding: 0;
                        background: white;
                        z-index: 99999;
                    }

                    .shipping-label-container {
                        width: 100% !important;
                        height: 100% !important;
                        border: none !important;
                        padding: 5mm !important; /* Más aire interno */
                        margin: 0 !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
