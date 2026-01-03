import type { NextApiRequest, NextApiResponse } from 'next';
import { transporter, mailOptions } from '../../lib/nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { companyName, yourName, email, phone, productInterest, quantity, message } = req.body;

    if (!companyName || !yourName || !email || !quantity || !message) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    try {
      const emailContent = `
        Nueva Solicitud de Regalo Empresarial:
        --------------------------------------
        Nombre de la Empresa: ${companyName}
        Nombre de Contacto: ${yourName}
        Email: ${email}
        Teléfono: ${phone || 'No proporcionado'}
        Producto de Interés: ${productInterest}
        Cantidad Estimada: ${quantity}
        Mensaje:
        ${message}
      `;

      const htmlContent = `<p><b>Nueva Solicitud de Regalo Empresarial:</b></p>
        <ul>
          <li><b>Nombre de la Empresa:</b> ${companyName}</li>
          <li><b>Nombre de Contacto:</b> ${yourName}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Teléfono:</b> ${phone || 'No proporcionado'}</li>
          <li><b>Producto de Interés:</b> ${productInterest}</li>
          <li><b>Cantidad Estimada:</b> ${quantity}</li>
          <li><b>Mensaje:</b> ${message.replace(/\n/g, '<br>') || 'No proporcionado'}</li>
        </ul>`;

      await transporter.sendMail({
        ...mailOptions,
        to: process.env.CONTACT_EMAIL || 'kamalusosanjose@gmail.com',
        subject: `Nueva Solicitud B2B de ${companyName}`,
        text: emailContent,
        html: htmlContent,
        replyTo: email, // Set the reply-to to the user's email
      });

      res.status(200).json({ message: 'Solicitud enviada con éxito.' });
    } catch (error) {
      console.error('Error al enviar el email de contacto B2B:', error);
      res.status(500).json({ message: 'Error al enviar la solicitud.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
