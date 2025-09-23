import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import AdminLayout from "../../components/AdminLayout"; // Importar el layout
import toast from 'react-hot-toast'; // Importar toast

// Interfaces para los datos que vienen de la API
interface SubCategoriaData {
  nombre: string;
  slug: string;
}
interface CategoriaData {
  _id: string;
  nombre: string;
  slug: string;
  subCategorias: SubCategoriaData[];
}

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- ESTADOS --- //
  const [form, setForm] = useState<any>({
    nombre: "",
    precio: "",
    precioFlex: "", // Add this line
    precioDura: "", // Add this line
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

  // Nuevos estados para categorías dinámicas
  const [allCategories, setAllCategories] = useState<CategoriaData[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedSubCategoria, setSelectedSubCategoria] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previewsSecundarias, setPreviewsSecundarias] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // --- LÓGICA --- //

  const generateSlug = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");

  useEffect(() => {
    if (!editId) setForm((f: any) => ({ ...f, slug: generateSlug(f.nombre) }));
  }, [form.nombre]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products/listar");
      const data = await res.json();
      // El API devuelve { products: [...], currentPage: ..., totalPages: ... }
      setProductos(Array.isArray(data.products) ? data.products : []);
    } catch (e) {
      console.error("Error fetch productos:", e);
      setProductos([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categorias/listar");
      const data = await res.json();
      setAllCategories(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedCategoria) {
        setSelectedCategoria(data[0].slug);
      }
    } catch (e) {
      console.error("Error fetch categorías:", e);
      setAllCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategorySlug = e.target.value;
    setSelectedCategoria(newCategorySlug);
    setSelectedSubCategoria("");
    setForm((f: any) => ({ ...f, precio: "", precioFlex: "", precioDura: "" }));
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubCategoria(e.target.value);
    setForm((f: any) => ({ ...f, precio: "", precioFlex: "", precioDura: "" }));
  };

  useEffect(() => {
    if (!image) {
      if (!editId) setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(image);
  }, [image, editId]);

  useEffect(() => {
    if (!images || images.length === 0) {
      if (!editId) setPreviewsSecundarias([]);
      return;
    }
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviewsSecundarias(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images, editId]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/api/auth/signin");
  }, [status, router]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-xl font-semibold">Cargando...</div>;
  if (status === "unauthenticated") return null;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setImages(items);
    const p = Array.from(previewsSecundarias);
    const [pReordered] = p.splice(result.source.index, 1);
    p.splice(result.destination.index, 0, pReordered);
    setPreviewsSecundarias(p);
  };

  const resetForm = () => {
    setForm({ nombre: "", precio: "", descripcion: "", seoTitle: "", seoDescription: "", seoKeywords: "", slug: "", alt: "", status: "activo", notes: "", destacado: false });
    if (allCategories.length > 0) {
      setSelectedCategoria(allCategories[0].slug);
    } else {
      setSelectedCategoria("");
    }
    setSelectedSubCategoria("");
    setImage(null);
    setImages([]);
    setPreview(null);
    setPreviewsSecundarias([]);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(10);
    try {
      const formData = new FormData();
      if (editId) formData.append("id", editId);
      
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      formData.append("categoria", selectedCategoria);
      if (selectedSubCategoria) {
        formData.append("subCategoria", selectedSubCategoria);
      }

      if (image) formData.append("image", image);
      images.forEach((f, i) => formData.append(`images[${i}]`, f));

      setProgress(30);
      const url = editId ? "/api/products/editar" : "/api/products/crear";
      const res = await fetch(url, { method: editId ? "PUT" : "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      setProgress(100);
      toast.success(editId ? "Producto editado con éxito" : "Producto creado con éxito");
      await fetchProducts();
      resetForm();
    } catch (err: any) {
      console.error("ERROR submit:", err);
      toast.error(err.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/products/eliminar?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error eliminando");
      toast.success("Producto eliminado con éxito");
      await fetchProducts();
    } catch (err: any) {
      console.error("DELETE ERROR:", err);
      toast.error(err.message || "Error al eliminar el producto");
    }
  };

  const handleEditClick = async (id: string) => {
    try {
      const res = await fetch(`/api/products/get?id=${id}`);
      if (!res.ok) throw new Error("No se pudo obtener el producto");
      const p = await res.json();

      setEditId(String(p._id));
      setForm({ ...p, seoKeywords: Array.isArray(p.seoKeywords) ? p.seoKeywords.join(", ") : p.seoKeywords || "" });
      setSelectedCategoria(p.categoria || "");
      const subCatValue = Array.isArray(p.subCategoria) ? p.subCategoria[0] : p.subCategoria || "";
      setSelectedSubCategoria(subCatValue || "");
      setPreview(p.imageUrl || null);
      setPreviewsSecundarias(Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []));
      setImage(null);
      setImages([]);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("EDIT CLICK ERROR:", err);
      toast.error("No se pudo cargar el producto para editar");
    }
  };

  const availableSubCategories = allCategories.find(c => c.slug === selectedCategoria)?.subCategorias || [];

  const getDisplayPrice = (product: any) => {
    if (product.precioDura && product.precioFlex) {
      return `$U ${product.precioDura} (Dura) / $U ${product.precioFlex} (Flex)`;
    }
    if (product.precioDura) {
      return `$U ${product.precioDura} (Dura)`;
    }
    if (product.precioFlex) {
      return `$U ${product.precioFlex} (Flex)`;
    }
    if (product.precio) {
      return `$U ${product.precio}`;
    }
    return "N/A";
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard de Productos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestioná los productos de Kamaluso.</p>
        </div>
        <button
          onClick={() => { if (showForm) { resetForm(); } else { resetForm(); setShowForm(true); } }}
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition"
        >
          {showForm ? "Cerrar Formulario" : "Agregar Producto"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg md:text-xl font-semibold">{editId ? "Editar Producto" : "Crear Nuevo Producto"}</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm((f: any) => ({ ...f, nombre: e.target.value }))} required placeholder="Ej: Agenda semanal 2026" className="w-full rounded-xl border px-3 py-2.5" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))} placeholder="ej: agenda-semanal-2026" className="w-full rounded-xl border px-3 py-2.5" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select value={selectedCategoria} onChange={handleCategoryChange} className="w-full rounded-xl border px-3 py-2.5" required>
                <option value="" disabled>Selecciona una categoría</option>
                {allCategories.map(cat => (<option key={cat._id} value={cat.slug}>{cat.nombre}</option>))}
              </select>
            </div>

            {availableSubCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                <select value={selectedSubCategoria} onChange={handleSubCategoryChange} className="w-full rounded-xl border px-3 py-2.5" required>
                  <option value="" disabled>Selecciona una subcategoría</option>
                  {availableSubCategories.map(sub => (<option key={sub.slug} value={sub.slug}>{sub.nombre}</option>))}
                </select>
              </div>
            )}

            {(() => {
              const selectedCategory = allCategories.find(c => c.slug === selectedCategoria);
              if (selectedCategory?.nombre === 'Agendas') {
                return (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Tapa Dura</label>
                      <input type="number" value={form.precioDura} onChange={(e) => setForm((f: any) => ({ ...f, precioDura: e.target.value }))} placeholder="Ej: 900" className="w-full rounded-xl border px-3 py-2.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Tapa Flexible</label>
                      <input type="number" value={form.precioFlex} onChange={(e) => setForm((f: any) => ({ ...f, precioFlex: e.target.value }))} placeholder="Ej: 800" className="w-full rounded-xl border px-3 py-2.5" />
                    </div>
                  </>
                );
              } else {
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input type="number" value={form.precio} onChange={(e) => setForm((f: any) => ({ ...f, precio: e.target.value }))} placeholder="Ej: 750" className="w-full rounded-xl border px-3 py-2.5" />
                  </div>
                );
              }
            })()}

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.destacado} onChange={(e) => setForm((f: any) => ({ ...f, destacado: e.target.checked }))} className="h-4 w-4" />
              <label className="text-sm text-gray-700">Destacado</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm((f: any) => ({ ...f, descripcion: e.target.value }))} className="w-full rounded-xl border px-3 py-2.5" rows={4} placeholder="Descripción del producto" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
                <input type="text" value={form.seoTitle} onChange={(e) => setForm((f: any) => ({ ...f, seoTitle: e.target.value }))} className="w-full rounded-xl border px-3 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords SEO (coma separadas)</label>
                <input type="text" value={form.seoKeywords} onChange={(e) => setForm((f: any) => ({ ...f, seoKeywords: e.target.value }))} className="w-full rounded-xl border px-3 py-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción SEO</label>
              <textarea value={form.seoDescription} onChange={(e) => setForm((f: any) => ({ ...f, seoDescription: e.target.value }))} className="w-full rounded-xl border px-3 py-2.5" rows={2} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto alternativo (Alt)</label>
              <input type="text" value={form.alt} onChange={(e) => setForm((f: any) => ({ ...f, alt: e.target.value }))} className="w-full rounded-xl border px-3 py-2.5" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen principal</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="w-full" />
              {preview && <img src={preview} alt="preview" className="mt-2 w-32 h-32 object-cover rounded-xl" />}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes secundarias</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files ? Array.from(e.target.files) : [])} className="w-full" />
              <div className="text-xs text-gray-500 mt-1">Puedes reordenar las imágenes arrastrándolas.</div>
              <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sec-images" direction="horizontal">
                    {(provided) => (
                      <div className="flex gap-2 mt-2 overflow-x-auto" ref={provided.innerRef} {...provided.droppableProps}>
                        {previewsSecundarias.map((url, idx) => (
                          <Draggable key={url + idx} draggableId={String(url) + idx} index={idx}>
                            {(prov) => (
                              <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="w-24 h-24 rounded-xl overflow-hidden border-2">
                                <img src={url} alt="preview secundaria" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" disabled={loading} className="bg-fucsia text-white px-6 py-2 rounded-2xl shadow">{editId ? "Guardar cambios" : "Crear producto"}</button>
              <button type="button" onClick={() => resetForm()} className="bg-white border px-4 py-2 rounded-2xl">Cancelar</button>
              {loading && <div className="ml-4 text-sm text-gray-600 self-center">{progress > 0 ? `Subiendo... ${progress}%` : 'Procesando...'}</div>}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Productos</h3>
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
              {productos.map((p) => (
                <tr key={String(p._id)} className="odd:bg-white even:bg-gray-50 border-b">
                  <td className="px-4 py-3"><img src={p.imageUrl} alt={p.alt || p.nombre} className="w-16 h-16 object-cover rounded-xl" /></td>
                  <td className="px-4 py-3">{p.nombre}</td>
                  <td className="px-4 py-3">{getDisplayPrice(p)}</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3">{p.categoria}</td>
                  <td className="px-4 py-3">{Array.isArray(p.subCategoria) ? p.subCategoria.join(", ") : (p.subCategoria || "-")}</td>
                  <td className="px-4 py-3">{p.destacado ? "✅" : "-"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEditClick(String(p._id))} className="px-3 py-1 rounded-xl bg-blue-600 text-white">Editar</button>
                    <button onClick={() => handleDelete(String(p._id))} className="px-3 py-1 rounded-xl bg-red-600 text-white">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
} 
