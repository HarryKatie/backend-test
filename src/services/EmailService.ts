import { loadTemplate } from '@/utils/emailTemplate';
import { sendEmail } from '../utils/mailer';
import { config } from '@/config';
import { IEmailService } from '@/interfaces';


export class EmailService implements IEmailService {

    async sendPasswordResetEmail(email: string, resetToken: string, name: string): Promise<string> {
        const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;
        const html = loadTemplate('resetPassword', { name, resetLink });

        const result = await sendEmail(email, 'Reset Your Password', html);
        return result as any; // returns true/false based on success
    }

    // async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    // Your existing sendEmail logic
    // }

    async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
        const html = loadTemplate('welcomeEmail', { name: firstName });
        const result = await sendEmail(email, 'Welcome to Our Platform', html);
        return result as any;
    }

};
