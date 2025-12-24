const db = require('../config/db');
const EmailService = require('../services/EmailService');

const EmailController = {
    async getTemplateByStage(req, res) {
        const { stage } = req.query; 

        try {
            const result = await db.query(
                'SELECT subject, body_html as body FROM email_templates WHERE name = $1 LIMIT 1',
                [stage]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No template found for stage: ${stage}` });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error("Database Error:", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async sendBulk(req, res) {
        const { stage, subject: customSubject, message: customMessage } = req.body;

        try {
            // Get Template from DB 
            const templateRes = await db.query(
                'SELECT subject, body_html FROM email_templates WHERE name = $1',
                [stage]
            );

            // Use DB template if user didn't provide custom text in the UI 
            const template = templateRes.rows[0] || { subject: customSubject, body_html: customMessage };

            // Fetch all candidates in that stage 
            const result = await db.query(
                'SELECT full_name, email, evaluation_notes FROM candidates WHERE current_stage = $1',
                [stage]
            );
            const candidates = result.rows;

            const results = { sent: 0, failed: 0 };

            for (const candidate of candidates) {
                // Replace placeholders 
                let finalBody = template.body_html
                    .replace(/{{full_name}}/g, candidate.full_name)
                    .replace(/{{feedback}}/g, candidate.evaluation_notes || "No specific feedback provided at this stage.");

                const emailSent = await EmailService.sendEmail(
                    candidate.email,
                    template.subject,
                    finalBody
                );

                if (emailSent.success) results.sent++;
                else results.failed++;
            }

            res.json({ message: 'Bulk dispatch complete', summary: results });
        } catch (error) {
            console.error('Bulk Email Error:', error);
            res.status(500).json({ error: 'Failed to send bulk emails' });
        }
    }
};

module.exports = EmailController;