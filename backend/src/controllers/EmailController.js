const db = require('../config/db');
const EmailService = require('../services/EmailService');

const EmailController = {
    async sendBulk(req, res) {
        const { stage, subject, message } = req.body;

        try {
            // Fetch all candidates in that stage including evaluation_notes [cite: 2025-12-23]
            const result = await db.query(
                'SELECT full_name, email, evaluation_notes FROM candidates WHERE current_stage = $1',
                [stage]
            );
            const candidates = result.rows;

            const results = { sent: 0, failed: 0 };

            for (const candidate of candidates) {
                // Replace placeholders with real candidate data [cite: 2025-12-23]
                let personalizedBody = message
                    .replace(/{{full_name}}/g, candidate.full_name)
                    .replace(/{{feedback}}/g, candidate.evaluation_notes || "No feedback provided.");

                const emailSent = await EmailService.sendEmail(
                    candidate.email,
                    subject,
                    personalizedBody
                );

                if (emailSent.success) results.sent++;
                else results.failed++;
            }

            res.json({ message: 'Completed', summary: results });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed dispatch' });
        }
    }
};

module.exports = EmailController;