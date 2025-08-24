import { useState } from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Producto() {
  const router = useRouter();
  const { id } = router.query;
  const [producto, setProducto] = useState<any>(null);
  const [tapa, setTapa] = useState("flex");

  useEffect(() => {
    if (id) {
      fetch(`/api/productos/${id}`)
        .then((res) => res.json())
        .then(setProducto);
    }
  }, [id]);

  if (!producto) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-kamaluso mt-10">
      <h1 className="text-3xl font-bold mb-4 text-naranja font-poppins">{producto.name}</h1>
      {producto.imagenes && producto.imagenes.length > 0 && (
        <img src={producto.imagenes[0]} alt={producto.seo?.alt || producto.name} className="w-full h-64 object-contain rounded-xl mb-6" />
      )}
      <p className="text-morado mb-4 font-poppins">{producto.descripcion}</p>
      {producto.tipo === "sublimable" ? (
        <div className="text-2xl font-bold text-verde mb-6">${producto.precio}</div>
      ) : (
        <div className="mb-6">
          <label className="font-semibold text-textoPrimario mr-4">Tipo de tapa:</label>
          <select value={tapa} onChange={e => setTapa(e.target.value)} className="border border-gray-300 rounded-md p-2 font-poppins">
            <option value="flex">Tapa flex</option>
            <option value="dura">Tapa dura</option>
          </select>
          <div className="text-2xl font-bold text-verde mt-4">
            {tapa === "flex" ? `$${producto.precioFlex}` : `$${producto.precioDura}`}
          </div>
        </div>
      )}
      {/* ...más detalles, botón de compra, etc... */}
    </div>
  );
}
