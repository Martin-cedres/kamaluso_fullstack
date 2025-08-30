import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Formulario principal
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    slug: "",
    alt: "",
    status: "activo",
    notes: "",
    destacado: false,
  });

  const [categoria, setCategoria] = useState("sublimable"); // Sublimable o personalizado
  const [subCategoria, setSubCategoria] = useState("tapas-flex"); // Solo si personalizado
  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewsSecundarias, setPreviewsSecundarias] = useState<string[]>([]);

  // === Fetch productos
  const fetchProducts = () => {
    fetch("/api/products/listar")
      .then((res) => res.json())
      .then(setProductos)
      .catch(() => setProductos([]));
  };

  useEffect(() => fetchProducts(), []);

  // Preview imagen principal
  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(image);
    } else {
      setPreview(null);
    }
  }, [image]);

  // Preview imágenes secundarias
  useEffect(() => {
    if (images.length > 0) {
      const urls = images.map((img) => URL.createObjectURL(img));
      setPreviewsSecundarias(urls);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    } else setPreviewsSecundarias([]);
  }, [images]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Cargando...
      </div>
    );
  if (status === "unauthenticated") return null;

  // === Handlers
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/products/eliminar?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el producto.");
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      const { nombre, precio, descripcion, destacado, ...rest } = form;
      formData.append("nombre", nombre);
      formData.append("descripcion", descripcion);
      formData.append("categoria", categoria);
      if (categoria === "personalizado") formData.append("subCategoria", subCategoria);
      formData.append("destacado", destacado ? "true" : "false");
      formData.append("precio", precio);

      Object.entries(rest).forEach(([key, value]) => formData.append(key, value));

      if (image) formData.append("image", image);
      images.forEach((img, idx) => formData.append(`images[${idx}]`, img));

      setProgress(30);

      const res = await fetch(editId ? `/api/products/editar?id=${editId}` : "/api/products/crear", {
        method: editId ? "PUT" : "POST",
        body: formData,
      });

      setProgress(80);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el producto");

      setProgress(100);
      setSuccessMsg(editId ? "✅ Producto editado con éxito" : "✅ Producto publicado con éxito");
      setTimeout(() => setSuccessMsg(null), 4000);

      // Reset formulario
      setForm({
        nombre: "",
        precio: "",
        descripcion: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        slug: "",
        alt: "",
        status: "activo",
        notes: "",
        destacado: false,
      });
      setImage(null);
      setImages([]);
      setEditId(null);
      setShowForm(false);
      setCategoria("sublimable");
      setSubCategoria("tapas-flex");
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg md:text-xl font-semibold text-textoPrimario mb-4">{children}</h2>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-textoPrimario">Panel de administración</h1>
            <p className="text-sm text-gray-500 mt-1">Gestioná productos de Kamaluso de manera simple e intuitiva.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 bg-fucsia text-white px-4 py-2 md:px-5 md:py-2.5 rounded-2xl shadow hover:opacity-90 transition"
          >
            {showForm ? "Cerrar formulario" : "Agregar producto"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
            <SectionTitle>Datos del producto</SectionTitle>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  required
                  placeholder="Ej: Agenda semanal 2026"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fucsia"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="ej: agenda-semanal-2026"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fucsia"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fucsia"
                >
                  <option value="sublimable">Sublimable</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              {/* Subcategoría si personalizado */}
              {categoria === "personalizado" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de tapa</label>
                  <select
                    value={subCategoria}
                    onChange={(e) => setSubCategoria(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fucsia"
                  >
                    <option value="tapas-flex">Tapa Flex</option>
                    <option value="tapas-dura">Tapa Dura</option>
                    <option value="tapas-madera">Tapa Madera</option>
                  </select>
                </div>
              )}

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                  placeholder="Ej: 750"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fucsia"
                />
              </div>

              {/* Destacado */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(e) => setForm((f) => ({ ...f, destacado: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>Destacado</span>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Descripción del producto"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-fucsia"
                />
              </div>

              {/* SEO y Alt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="SEO Title" value={form.seoTitle} onChange={e => setForm(f => ({...f, seoTitle: e.target.value}))} className="w-full rounded-xl border px-3 py-2.5 focus:ring-2 focus:ring-fucsia"/>
                <input type="text" placeholder="SEO Description" value={form.seoDescription} onChange={e => setForm(f => ({...f, seoDescription: e.target.value}))} className="w-full rounded-xl border px-3 py-2.5 focus:ring-2 focus:ring-fucsia"/>
                <input type="text" placeholder="SEO Keywords" value={form.seoKeywords} onChange={e => setForm(f => ({...f, seoKeywords: e.target.value}))} className="w-full rounded-xl border px-3 py-2.5 focus:ring-2 focus:ring-fucsia"/>
              </div>
              <div>
                <input type="text" placeholder="Alt imagen" value={form.alt} onChange={e => setForm(f => ({...f, alt: e.target.value}))} className="w-full rounded-xl border px-3 py-2.5 focus:ring-2 focus:ring-fucsia"/>
              </div>

              {/* Notas */}
              <div>
                <textarea placeholder="Notas internas" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className="w-full rounded-xl border px-3 py-2.5 focus:ring-2 focus:ring-fucsia"/>
              </div>

              {/* Imagenes */}
              <div>
                <input type="file" accept="image/*" onChange={e => e.target.files && setImage(e.target.files[0])} className="w-full"/>
                {preview && <img src={preview} alt="Preview" className="w-32 h-32 mt-2 object-cover rounded-xl"/>}
              </div>
              <div>
                <input type="file" accept="image/*" multiple onChange={e => e.target.files && setImages(Array.from(e.target.files))} className="w-full"/>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {previewsSecundarias.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt={`Secundaria ${idx}`} className="w-24 h-24 object-cover rounded-xl" />
                      <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">x</button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="bg-fucsia text-white px-4 py-2 rounded-2xl shadow hover:opacity-90 transition">
                {editId ? "Editar producto" : "Guardar producto"}
              </button>
            </form>
          </div>
        )}

        {/* --- Tabla de productos --- */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-textoPrimario">Productos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="px-4 py-3">Imagen</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Subcategoría</th>
                  <th className="px-4 py-3">Destacado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No hay productos</td>
                  </tr>
                )}
                {productos.map((p) => (
                  <tr key={p._id} className="odd:bg-white even:bg-gray-50 border-b">
                    <td className="px-4 py-3"><img src={p.imageUrl} alt={p.alt} className="w-16 h-16 object-cover rounded-xl" /></td>
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3">{p.precio}</td>
                    <td className="px-4 py-3">{p.status}</td>
                    <td className="px-4 py-3">{p.categoria}</td>
                    <td className="px-4 py-3">{p.subCategoria || "-"}</td>
                    <td className="px-4 py-3">{p.destacado ? "✅" : "-"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditId(p._id);
                          setForm({
                            nombre: p.nombre,
                            precio: p.precio || "",
                            descripcion: p.descripcion || "",
                            seoTitle: p.seoTitle || "",
                            seoDescription: p.seoDescription || "",
                            seoKeywords: p.seoKeywords || "",
                            slug: p.slug || "",
                            alt: p.alt || "",
                            status: p.status || "activo",
                            notes: p.notes || "",
                            destacado: p.destacado || false,
                          });
                          setCategoria(p.categoria || "sublimable");
                          setSubCategoria(p.subCategoria || "tapas-flex");
                          setShowForm(true);
                        }}
                        className="px-3 py-1 rounded-xl bg-blue-600 text-white hover:opacity-90 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-1 rounded-xl bg-red-600 text-white hover:opacity-90 transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

