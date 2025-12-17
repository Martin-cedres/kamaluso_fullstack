import { useState, ChangeEvent } from 'react';

interface ImageUploaderProps {
  contextName: string; // Nombre del producto o título del artículo
  contextType: 'producto' | 'blog'; // Contexto para la IA
  onUploadComplete: (data: { imageUrl: string; altText: string }) => void;
  // Esta es tu función real para subir a S3. Debes pasarla como prop.
  uploadToS3: (file: File) => Promise<{ success: boolean; url: string }>;
}

type Status = 'idle' | 'uploading' | 'generating' | 'success' | 'error';

/**
 * Componente para subir una imagen, generar su alt-text con IA y notificar al formulario padre.
 */
export default function ImageUploader({ contextName, contextType, onUploadComplete, uploadToS3 }: ImageUploaderProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setErrorMessage('');

    try {
      // 1. Subir la imagen a S3 usando la función que nos pasan por props.
      const s3Response = await uploadToS3(file);
      if (!s3Response.success || !s3Response.url) {
        throw new Error('La subida del archivo a S3 falló.');
      }
      
      const { url: imageUrl } = s3Response;
      setStatus('generating');

      // 2. Llamar a nuestra API para generar el alt-text.
      const altTextResponse = await fetch('/api/admin/generate-alt-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, contextName, context: contextType }),
      });

      if (!altTextResponse.ok) {
        const errorData = await altTextResponse.json();
        throw new Error(errorData.message || 'La API de generación de alt-text devolvió un error.');
      }

      const { altText } = await altTextResponse.json();
      
      // 3. Notificar al formulario padre con los resultados.
      onUploadComplete({ imageUrl, altText });
      setStatus('success');

    } catch (error: any) {
      console.error("Error en el proceso de subida y generación de alt-text:", error);
      setErrorMessage(error.message);
      setStatus('error');
    } finally {
        // Reseteamos el input para poder subir el mismo archivo de nuevo si hay un error.
        event.target.value = '';
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
        Subir Nueva Imagen
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        disabled={status === 'uploading' || status === 'generating'}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fucsia/10 file:text-fucsia hover:file:bg-fucsia/20 cursor-pointer"
      />
      <div className="mt-3 text-sm h-5">
        {status === 'uploading' && <p className="text-azul animate-pulse">Subiendo a S3...</p>}
        {status === 'generating' && <p className="text-moradoClaro animate-pulse">🤖 Analizando imagen y generando alt-text con IA...</p>}
        {status === 'success' && <p className="text-verde font-semibold">¡Éxito! Imagen y alt-text listos.</p>}
        {status === 'error' && <p className="text-red-600 font-semibold">Error: {errorMessage}</p>}
      </div>
    </div>
  );
}