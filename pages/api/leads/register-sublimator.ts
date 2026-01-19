import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import connectDB from '../../../lib/mongoose';
import Subscriber, { ISubscriber } from '../../../models/Subscriber';
import { transporter, mailOptions } from '../../../lib/nodemailer';
import { Model } from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await connectDB();

  const { name, phone, email } = req.body;

  // Validaciones
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'La dirección de correo no es válida.' });
  }

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Por favor ingresa tu nombre.' });
  }

  if (!phone || phone.trim().length < 8) {
    return res.status(400).json({ message: 'Por favor ingresa un número de WhatsApp válido.' });
  }

  try {
    // Upsert: Actualiza si existe, crea si no
    const existingSubscriber = await (Subscriber as Model<ISubscriber>).findOne({ email });

    if (existingSubscriber) {
      // Actualizar datos existentes y agregar tag si no existe
      const updatedTags = existingSubscriber.tags || [];
      if (!updatedTags.includes('sublimador')) {
        updatedTags.push('sublimador');
      }

      await (Subscriber as Model<ISubscriber>).updateOne(
        { email },
        {
          $set: {
            name: name.trim(),
            phone: phone.trim(),
            tags: updatedTags,
            isWholesaler: true,
          },
        }
      );
    } else {
      // Crear nuevo subscriber
      const newSubscriber = new (Subscriber as Model<ISubscriber>)({
        email,
        name: name.trim(),
        phone: phone.trim(),
        tags: ['sublimador'],
        isWholesaler: true,
      });
      await newSubscriber.save();
    }

    // Set cookie para acceso mayorista (30 días)
    const cookie = serialize('kamaluso_wholesaler_access', 'true', {
      httpOnly: false, // Necesitamos leerla en el cliente
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    // Enviar email de bienvenida para sublimadores
    try {
      const emailHtml = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://www.papeleriapersonalizada.uy/logo.webp" alt="Kamaluso" width="80" height="80" style="border-radius: 12px;">
          </div>
          
          <h1 style="color: #FF6B35; text-align: center; font-size: 28px; margin-bottom: 20px;">
            ¡Bienvenido/a a Kamaluso! 🔥
          </h1>
          
          <p style="color: #64748B; text-align: center; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
            ¡Gracias por registrarte! Ya tenés acceso completo a nuestros precios mayoristas exclusivos para sublimadores.<br>
            Esperamos que encuentres los insumos perfectos para potenciar tu negocio.
          </p>

          <div style="background: #F8FAFC; border-radius: 16px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #0F172A; margin: 0 0 15px 0;">📖 Tips para sublimar nuestras tapas</h3>
            <ul style="color: #64748B; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Temperatura:</strong> 170°C (340°F)</li>
              <li><strong>Tiempo:</strong> 120 segundos</li>
              <li><strong>Presión:</strong> Media-alta</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="https://www.papeleriapersonalizada.uy/productos/papeleria-sublimable" 
               style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FFD100 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(255, 107, 53, 0.2);">
              Ver Catálogo de Sublimación →
            </a>
          </div>
          
          <p style="color: #94A3B8; text-align: center; font-size: 14px; border-top: 1px solid #E2E8F0; padding-top: 20px;">
            Si tenés alguna duda o necesitás asesoramiento, respondé este email o escribinos por WhatsApp.
          </p>
        </div>
      `;

      await transporter.sendMail({
        ...mailOptions,
        to: email,
        bcc: mailOptions.from, // Copia oculta al admin
        subject: '🔥 ¡Bienvenido/a a Kamaluso Sublimación! Ya tenés acceso mayorista',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Error al enviar email de bienvenida sublimador:', emailError);
      // No bloqueamos la respuesta por fallo de email
    }

    return res.status(201).json({
      success: true,
      message: '¡Registro exitoso! Ya podés ver los precios mayoristas.',
    });

  } catch (error: any) {
    console.error('Error en registro de sublimador:', error);
    return res.status(500).json({
      message: 'Error en el servidor al procesar el registro.',
      error: error.message,
    });
  }
}
