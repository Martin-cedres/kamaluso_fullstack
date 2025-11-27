import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { transporter } = await import('../../../lib/nodemailer');
        const { testEmail } = req.body;

        if (!testEmail) {
            return res.status(400).json({ message: 'Email de prueba requerido' });
        }

        // Verificar configuración
        const emailUser = process.env.EMAIL_SERVER_USER;
        const emailPass = process.env.EMAIL_SERVER_PASSWORD;

        const config = {
            hasEmailUser: !!emailUser,
            hasEmailPass: !!emailPass,
            emailUserValue: emailUser ? `${emailUser.substring(0, 3)}***` : 'NO CONFIGURADO',
        };

        // Intentar verificar conexión con el servidor SMTP
        let smtpVerified = false;
        let smtpError = null;

        try {
            await transporter.verify();
            smtpVerified = true;
        } catch (error: any) {
            smtpError = error.message;
        }

        // Intentar enviar email de prueba
        let emailSent = false;
        let sendError = null;

        if (smtpVerified) {
            try {
                await transporter.sendMail({
                    from: emailUser,
                    to: testEmail,
                    subject: 'Email de Prueba - Sistema de Presupuestos Kamaluso',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2 style="color: #E84393;">✅ Prueba de Email Exitosa</h2>
                            <p>Este es un email de prueba del sistema de presupuestos.</p>
                            <p>Si recibiste este mensaje, la configuración de email está funcionando correctamente.</p>
                            <hr>
                            <p style="color: #666; font-size: 12px;">Sistema de Presupuestos - Kamaluso</p>
                        </div>
                    `,
                });
                emailSent = true;
            } catch (error: any) {
                sendError = error.message;
            }
        }

        res.status(200).json({
            config,
            smtp: {
                verified: smtpVerified,
                error: smtpError,
            },
            email: {
                sent: emailSent,
                error: sendError,
            },
        });

    } catch (error: any) {
        console.error('Error en test de email:', error);
        res.status(500).json({
            message: 'Error al probar configuración de email',
            error: error.message
        });
    }
}
