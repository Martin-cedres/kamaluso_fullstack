import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import connectDB from '../../lib/mongoose';
import Product from '../../models/Product';
import { IProduct } from '../../models/Product'; // Asegúrate de que la interfaz IProduct exista y esté actualizada

interface ProductPageProps {
  product: IProduct;
}

const ProductPage: NextPage<ProductPageProps> = ({ product }) => {
  if (!product) {
    return <div>Producto no encontrado.</div>;
  }

  // Aquí renderizas tu página de detalle de producto
  // Asegúrate de que tu interfaz IProduct tenga los campos descripcion y puntosClave
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold">{product.nombre}</h1>
      <p className="text-xl text-gray-700 mt-2">${product.basePrice}</p>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Puntos Clave</h2>
        <ul className="list-disc list-inside mt-4 space-y-2">
          {Array.isArray(product.puntosClave) && product.puntosClave.map((punto, index) => (
            <li key={index}>{punto}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 prose lg:prose-xl max-w-none">
        <h2 className="text-2xl font-semibold">Descripción</h2>
        {/* Usamos dangerouslySetInnerHTML porque la descripción viene como HTML desde ReactQuill */}
        <div dangerouslySetInnerHTML={{ __html: product.descripcion }} />
      </div>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  await connectDB();
  const products = await Product.find({}).select('slug').lean();
  const paths = products.map((product) => ({
    params: { slug: product.slug },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  await connectDB();
  const slug = params?.slug;

  // 1. Usar .lean() para obtener un objeto JS plano en lugar de un Documento Mongoose.
  const productDoc = await Product.findOne({ slug }).lean();

  if (!productDoc) {
    return { notFound: true };
  }

  // 2. LA SOLUCIÓN CLAVE: Garantizar la serialización completa.
  // Esto convierte tipos de Mongoose como ObjectId a strings y asegura que todos los datos se pasen.
  const product = JSON.parse(JSON.stringify(productDoc));

  return {
    props: { product },
    revalidate: 1, // Revalidar en cada petición (o un valor bajo como 10 segundos) para ver cambios rápido.
  };
};

export default ProductPage;