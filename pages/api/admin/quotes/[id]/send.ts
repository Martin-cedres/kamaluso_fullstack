import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import dbConnect from '../../../../../lib/mongoose';
import { Quote } from '../../../../../models/Quote';
import { generateQuotePDF } from '../../../../../lib/pdf/generateQuotePDF';
import { transporter, mailOptions } from '../../../../../lib/nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'No autorizado' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await dbConnect();

  try {
    const quote = await Quote.findById(id);
    if (!quote) {
      return res.status(404).json({ message: 'Presupuesto no encontrado' });
    }

    // Generar PDF en memoria
    const pdfBuffer = await generateQuotePDF(quote);

    // Template HTML del email con tono amigable
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <!-- Header con logo/branding -->
        <div style="background: linear-gradient(135deg, #E84393 0%, #F97FAE 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">KAMALUSO</h1>
          <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Papelería Personalizada</p>
        </div>

        <!-- Contenido principal -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-left: 1px solid #eee; border-right: 1px solid #eee;">
          <h2 style="color: #E84393; font-size: 22px; margin-top: 0;">¡Hola ${quote.customer.name}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            ¡Muchas gracias por tu interés en nuestros productos! 🎉
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Te preparamos con mucho cariño el presupuesto para tu proyecto de papelería personalizada. 
            Queremos que cada detalle sea perfecto para vos.
          </p>

          <!-- Resumen del presupuesto -->
          <div style="background: linear-gradient(to right, #FFF5F9, #FFFFFF); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #E84393;">
            <h3 style="color: #E84393; margin-top: 0; font-size: 18px;">📋 Resumen de tu presupuesto</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 15px;">Presupuesto N°:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #333; font-size: 15px;">${quote.quoteNumber}</td>
              </tr>
              ${!quote.hideTotal ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 15px;">Total:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #E84393; font-size: 20px;">$U ${quote.total.toLocaleString('es-UY')}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 15px;">Válido hasta:</td>
                <td style="padding: 8px 0; text-align: right; color: #333; font-size: 15px;">${new Date(quote.validUntil).toLocaleDateString('es-UY')}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            📎 Encontrarás todos los detalles en el <strong>PDF adjunto</strong>.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Si tenés alguna duda, querés ajustar algo o estás list@ para avanzar, 
            <strong style="color: #E84393;">¡simplemente respondé este correo!</strong> 
            Estamos acá para ayudarte en lo que necesites 😊
          </p>

          <!-- Call to action -->
          <div style="text-align: center; margin: 35px 0 25px 0;">
            <a href="mailto:kamalusosanjose@gmail.com" 
               style="background: linear-gradient(135deg, #E84393 0%, #F97FAE 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(232, 67, 147, 0.3);">
              💬 Responder al Presupuesto
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 25px 30px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #eee;">
          <p style="margin: 0 0 10px 0; color: #E84393; font-weight: bold; font-size: 16px;">
            ¡Gracias por confiar en Kamaluso! ✨
          </p>
          <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
            Hacemos realidad tus ideas en papelería personalizada
          </p>
          <div style="margin: 15px 0;">
            <a href="https://www.papeleriapersonalizada.uy" style="color: #E84393; text-decoration: none; margin: 0 10px;">🌐 Sitio Web</a>
          </div>
          <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">
            San José de Mayo, Uruguay<br>
            kamalusosanjose@gmail.com
          </p>
        </div>
      </div>
    `;

    // Enviar email
    await transporter.sendMail({
      ...mailOptions,
      to: quote.customer.email,
      subject: `✨ Tu presupuesto personalizado está listo - Kamaluso`,
      html: htmlContent,
      attachments: [
        {
          filename: `Presupuesto-${quote.quoteNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    // Actualizar estado del presupuesto
    quote.status = 'sent';
    quote.sentAt = new Date();
    await quote.save();

    res.status(200).json({ message: 'Presupuesto enviado correctamente' });
  } catch (error) {
    console.error('Error sending quote email:', error);
    res.status(500).json({ message: 'Error al enviar el presupuesto' });
  }
}
