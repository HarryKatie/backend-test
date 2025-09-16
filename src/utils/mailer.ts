import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for others
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
    };

    return transporter.sendMail(mailOptions);
};
