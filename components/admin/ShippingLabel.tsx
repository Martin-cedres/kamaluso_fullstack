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
    };
}

export default function ShippingLabel({ order }: ShippingLabelProps) {
    // Datos robustos
    const address = order.shippingDetails?.address || (order as any).address || 'DIRECCIÓN NO ESPECIFICADA';
    const method = order.shippingDetails?.method || (order as any).method || 'RETIRO';
    const notes = order.shippingDetails?.notes || (order as any).notes || '';

    return (
        <div className="shipping-label-print-isolation">
            {/* Contenedor de Seguridad: 15cm x 10cm - Formato horizontal */}
            <div className="shipping-label-container border-[5px] border-black bg-white text-black font-sans flex flex-col overflow-hidden relative shadow-none"
                style={{ width: '15cm', height: '10cm', padding: '0.5cm' }}>

                {/* 1. SECCIÓN SUPERIOR: Remitente (Sin número de orden) */}
                <div className="flex justify-between items-start border-b-[3px] border-black pb-1.5 mb-2 shrink-0 h-[1.1cm]">
                    <div className="text-left">
                        <h1 className="text-[7px] font-black uppercase text-gray-500 leading-none mb-1">REMITENTE</h1>
                        <p className="text-[11px] font-black leading-none uppercase">Katherine Silva - 098 615 074</p>
                    </div>
                </div>

                {/* 2. CUERPO: Destinatario y Datos Centrales */}
                <div className="flex-grow flex flex-col gap-2 min-h-0 overflow-hidden">

                    {/* NOMBRE DESTINATARIO */}
                    <div className="border-l-[6px] border-black pl-3 shrink-0 py-0.5">
                        <h2 className="text-[7px] font-black uppercase text-gray-500 mb-0.5">DESTINATARIO</h2>
                        <p className="text-[20px] font-black leading-none uppercase tracking-tighter truncate">
                            {order.name}
                        </p>
                    </div>

                    {/* CAJA CENTRAL: Dirección y Teléfono */}
                    <div className="flex-grow grid grid-cols-12 border-[3.5px] border-black bg-gray-100 min-h-0">
                        {/* DIRECCIÓN (Alineada a la izquierda con padding estándar) */}
                        <div className="col-span-8 p-3 border-r-[3.5px] border-black flex flex-col bg-white overflow-hidden h-full text-left">
                            <h3 className="text-[7px] font-black uppercase text-gray-500 mb-1">DIRECCIÓN / PUNTO DE RETIRO</h3>
                            <div className="flex-grow overflow-hidden flex items-start">
                                <p className="text-[14px] font-black leading-[1.2] uppercase"
                                    style={{
                                        wordBreak: 'break-word',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 5,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                    {address}
                                </p>
                            </div>
                        </div>
                        {/* TELÉFONO (Alineado a la izquierda con padding estándar) */}
                        <div className="col-span-4 p-3 flex flex-col justify-center bg-white text-left shrink-0 h-full overflow-hidden">
                            <h3 className="text-[7px] font-black uppercase text-gray-500 mb-1 leading-none">TELÉFONO</h3>
                            <p className="text-[18px] font-black tracking-tighter leading-none truncate">
                                {order.phone || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. SECCIÓN INFERIOR: Envío y Logo */}
                <div className="mt-2 pt-2 border-t-[3px] border-black flex justify-between items-end shrink-0 h-[1.8cm]">
                    <div className="flex flex-col justify-end flex-grow pr-4 pb-0.5 h-full overflow-hidden text-left">
                        <div>
                            <h4 className="text-[7px] font-black uppercase text-gray-500 mb-1">MÉTODO DE ENVÍO</h4>
                            <p className="text-[17px] font-black uppercase text-blue-900 leading-none tracking-tight truncate">
                                {method}
                            </p>
                        </div>
                        {notes?.trim() && (
                            <div className="mt-1 bg-yellow-100 px-2 py-0.5 border border-yellow-400 text-[8px] font-bold leading-none inline-block self-start max-w-full truncate italic">
                                ⚠️ {notes}
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 h-full flex items-end">
                        <img
                            src="/logo.webp"
                            alt="Logo"
                            style={{ width: '2.5cm', height: 'auto', display: 'block', objectFit: 'contain' }}
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .shipping-label-container {
                    margin: 20px auto;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                }

                @media print {
                    @page {
                        size: 15cm 10cm landscape;
                        margin: 0 !important;
                    }

                    html, body {
                        visibility: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 15cm !important;
                        height: 10cm !important;
                        overflow: hidden !important;
                        background: white !important;
                    }

                    .shipping-label-print-isolation, 
                    .shipping-label-print-isolation * {
                        visibility: visible !important;
                    }

                    .shipping-label-print-isolation {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 15cm !important;
                        height: 10cm !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background: white !important;
                        z-index: 99999999 !important;
                    }

                    .shipping-label-container {
                        width: 15cm !important;
                        height: 10cm !important;
                        margin: 0 !important;
                        border: 5px solid black !important;
                        background: white !important;
                        display: flex !important;
                        flex-direction: column !important;
                        overflow: hidden !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        box-sizing: border-box !important;
                    }
                }
            `}</style>
        </div>
    );
}
