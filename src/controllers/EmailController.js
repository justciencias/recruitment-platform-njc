const db = require('../config/db');
const EmailService = require('../services/EmailService');

const EmailController = {
    // POST /api/emails/send-bulk
    async sendBulk(req, res) {
        const { candidate_ids, template_id } = req.body;

        try {
            // 1. Fetch the template
            const templateResult = await db.query(
                'SELECT * FROM email_templates WHERE id = $1', 
                [template_id]
            );
            const template = templateResult.rows[0];

            if (!template) return res.status(404).json({ error: 'Template not found' });

            // 2. Fetch all selected candidates
            const candidatesResult = await db.query(
                'SELECT id, full_name, email, current_stage FROM candidates WHERE id = ANY($1)',
                [candidate_ids]
            );
            const candidates = candidatesResult.rows;

            // 3. Process the sending queue
            const results = { sent: 0, failed: 0 };

            for (const candidate of candidates) {
                const personalizedBody = EmailService.parseTemplate(template.body_html, candidate);
                
                const emailSent = await EmailService.sendEmail(
                    candidate.email,
                    template.subject,
                    personalizedBody
                );

                if (emailSent.success) {
                    results.sent++;
                } else {
                    results.failed++;
                }
            }

            res.json({
                message: 'Bulk sending process completed',
                summary: results
            });

        } catch (error) {
            res.status(500).json({ error: 'Internal server error during email dispatch' });
        }
    }
};

module.exports = EmailController;