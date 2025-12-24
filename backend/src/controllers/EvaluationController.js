const db = require('../config/db');

const EvaluationController = {
    /**
     * Submit feedback for a candidate
     * This updates the candidate's stage and records the member's assessment
     */
    async create(req, res) {
        const { candidate_id, score, feedback_text, stage_name } = req.body;
        const member_id = req.user.id; // Extracted from the JWT token

        try {
            // Start a transaction to ensure both operations succeed together
            await db.query('BEGIN');

            // Insert the evaluation record
            const evaluationQuery = `
                INSERT INTO evaluations (candidate_id, member_id, score, feedback_text, stage_name)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const evaluationResult = await db.query(evaluationQuery, [
                candidate_id, 
                member_id, 
                score, 
                feedback_text, 
                stage_name
            ]);

            // Update candidate's current stage (State Machine logic)
            const updateCandidateQuery = `
                UPDATE candidates 
                SET current_stage = $1 
                WHERE id = $2;
            `;
            await db.query(updateCandidateQuery, [stage_name, candidate_id]);

            await db.query('COMMIT');

            res.status(201).json({
                message: 'Evaluation recorded and candidate stage updated',
                evaluation: evaluationResult.rows[0]
            });

        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error recording evaluation:', error);
            res.status(500).json({ error: 'Failed to process evaluation' });
        }
    },

    
    // Get the evaluation history for a specific candidate
    async getCandidateHistory(req, res) {
        const { candidate_id } = req.params;

        try {
            const query = `
                SELECT 
                    e.id, e.score, e.feedback_text, e.stage_name, e.created_at,
                    u.full_name as interviewer_name, u.department as interviewer_dept
                FROM evaluations e
                JOIN users u ON e.member_id = u.id
                WHERE e.candidate_id = $1
                ORDER BY e.created_at DESC;
            `;
            const result = await db.query(query, [candidate_id]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Could not fetch history' });
        }
    }
};

module.exports = EvaluationController;