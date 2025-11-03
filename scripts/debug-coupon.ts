import dotenv from 'dotenv';

dotenv.config({ path: 'C:\\Users\\LENOVO\\Desktop\\kamaluso_fullstack\\.env.local' });

async function debugCoupon() {
  const connectDB = (await import('../lib/mongoose')).default;
  const Coupon = (await import('../models/Coupon')).default;
  const Product = (await import('../models/Product')).default;

  await connectDB();

  const couponCode = 'BIENVENIDA-56U8W';
  const productSlug = 'agenda-semanal-en-columnas-tapa-flex-personalizada-2026-kamaluso';

  console.log(`Buscando cupón: ${couponCode}`);
  const coupon = await Coupon.findOne({ code: couponCode });

  console.log(`Buscando producto: ${productSlug}`);
  const product = await Product.findOne({ slug: productSlug });

  console.log('\n--- Detalles del Cupón ---');
  if (coupon) {
    console.log(JSON.stringify(coupon, null, 2));
  } else {
    console.log('Cupón no encontrado.');
  }

  console.log('\n--- Detalles del Producto ---');
  if (product) {
    console.log(JSON.stringify(product, null, 2));
  } else {
    console.log('Producto no encontrado.');
  }

  process.exit(0);
}

debugCoupon().catch(err => {
  console.error(err);
  process.exit(1);
});
