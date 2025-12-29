export const printHtmlContent = (content: string) => {
    // 1. Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    // Asignar un ID único por si necesitamos debugging
    iframe.id = `print-frame-${new Date().getTime()}`;

    // Añadirlo al documento
    document.body.appendChild(iframe);

    // 2. Obtener el documento del iframe
    const doc = iframe.contentWindow?.document;

    if (doc) {
        // 3. Escribir el contenido
        // Incluimos estilos básicos y Tailwind (si es posible vía CDN o extrayendo estilos)
        // Para simplificar y asegurar consistencia, inyectaremos estilos críticos inline o un bloque style
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Imprimir Documento</title>
                    <meta charset="utf-8">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Montserrat:wght@400;700;900&family=Inter:wght@400;700;900&display=swap');
                        
                        body { 
                            margin: 0; 
                            padding: 0; 
                            font-family: 'Inter', sans-serif;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }

                        .font-serif { font-family: 'Playfair Display', serif !important; }
                        .font-sans { font-family: 'Montserrat', sans-serif !important; }
                        
                        @page { 
                            size: A4 portrait; 
                            margin: 0; 
                        }
                    </style>
                </head>
                <body>
                    ${content}
                    <script>
                        // Esperar a que Tailwind se cargue y las imágenes
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                // Opcional: eliminar el iframe después de imprimir
                                // window.parent.document.body.removeChild(window.frameElement);
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        doc.close();
    }
};
