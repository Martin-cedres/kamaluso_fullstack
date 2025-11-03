import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongoose';
import Subscriber from '../../models/Subscriber';
import Coupon from '../../models/Coupon';
import { transporter, mailOptions } from '../../lib/nodemailer';

// Función para generar un código de cupón único
const generateUniqueCouponCode = async (): Promise<string> => {
  let code = '';
  let isUnique = false;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  while (!isUnique) {
    code = 'BIENVENIDA-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existingCoupon = await Coupon.findOne({ code });
    if (!existingCoupon) {
      isUnique = true;
    }
  }
  return code;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await connectDB();

  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'La dirección de correo no es válida.' });
  }

  try {
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      return res.status(409).json({ message: 'Este correo ya está suscrito.' });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    const couponCode = await generateUniqueCouponCode();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // El cupón expira en 30 días

    const newCoupon = new Coupon({
      code: couponCode,
      discountType: 'percentage',
      value: 10,
      expirationDate,
      maxUses: 1,
      applicableTo: 'all',
    });

    await newCoupon.save();

    // Enviar correo de bienvenida con el cupón
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h1 style="color: #d81b60;">¡Bienvenida/o a Papeleria Personalizada Kamaluso!</h1>
          <p>Gracias por suscribirte a nuestro boletín.</p>
          <p>Aquí tienes tu cupón de <strong>10% de descuento</strong> para tu primera compra:</p>
          <div style="background: #fce4ec; border: 2px dashed #d81b60; padding: 10px; margin: 20px auto; max-width: 200px;">
            <strong style="font-size: 1.5em; color: #c2185b;">${couponCode}</strong>
          </div>
          <p>Este cupón es válido por 30 días y puede ser usado una sola vez.</p>
          <a href="https://www.papeleriapersonalizada.uy" style="background-color: #d81b60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ver Productos</a>
        </div>
      `;

      await transporter.sendMail({
        ...mailOptions,
        to: email, // Enviar al correo del suscriptor
        subject: '¡Tu Cupón de Bienvenida a Papeleria Personalizada Kamaluso! 🎁',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Error al enviar el correo de bienvenida:', emailError);
      // No bloqueamos la respuesta por un fallo en el email, pero lo registramos.
    }

    res.status(201).json({ 
      message: '¡Suscripción exitosa! Revisa tu correo para obtener tu cupón de descuento.',
      couponCode,
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Error en el servidor al procesar la suscripción.', error: error.message });
  }
}
