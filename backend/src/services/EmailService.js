const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    /**
     * Replaces placeholders in the template with candidate data
     * @param {string} content - The HTML body
     * @param {object} data - Candidate info
     */
    parseTemplate(content, data) {
        return content
            .replace(/{{name}}/g, data.full_name)
            .replace(/{{stage}}/g, data.current_stage)
            .replace(/{{recruitment_year}}/g, new Date().getFullYear());
    }

    /**
     * Sends an email to a single candidate
     */
    async sendEmail(to, subject, html) {
        try {
            await this.transporter.sendMail({
                from: `"NJC Recruitment" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html
            });
            return { success: true };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, error };
        }
    }
}

module.exports = new EmailService();