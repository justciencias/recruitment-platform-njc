const db = require('../config/db');
const xlsx = require('xlsx');

const CandidateController = {
    // 1. List all candidates (Dashboard/List)
    async index(req, res) {
        const { stage, degree, sort = 'full_name', order = 'ASC' } = req.query;
        try {
            let query = 'SELECT id, full_name, email, phone, current_stage, degree_type FROM candidates WHERE 1=1';
            const values = [];

            if (stage) {
                values.push(stage);
                query += ` AND current_stage = $${values.length}`;
            }

            if (degree && degree !== 'All') {
                values.push(degree);
                query += ` AND degree_type = $${values.length}`;
            }

            const allowedSorts = ['full_name', 'degree_type', 'current_stage'];
            const safeSort = allowedSorts.includes(sort) ? sort : 'full_name';
            query += ` ORDER BY ${safeSort} ${order === 'DESC' ? 'DESC' : 'ASC'}`;

            const result = await db.query(query, values);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Database fetch error' });
        }
    },

    // 2. Create new candidate (Essential for "Add Candidate" button)
    async store(req, res) {
        const { full_name, email, phone, degree_type } = req.body;
        try {
            const result = await db.query(
                'INSERT INTO candidates (full_name, email, phone, degree_type) VALUES ($1, $2, $3, $4) RETURNING *',
                [full_name, email, phone, degree_type]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. Get single candidate details (with Privacy Logic)
    async show(req, res) {
        const { id } = req.params;
        const userLevel = req.user.access_level;
        try {
            const result = await db.query('SELECT * FROM candidates WHERE id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });

            const candidate = result.rows[0];

            // Privacy: Only Admin (Level 3) sees private notes
            if (userLevel < 3) {
                delete candidate.private_admin_notes;
            }
            res.json(candidate);
        } catch (error) {
            res.status(500).json({ error: 'Database error' });
        }
    },

    // 4. Update candidate
    async update(req, res) {
        const { id } = req.params;
        const userLevel = req.user.access_level;
        const {
            full_name, email, phone, degree_type, current_stage,
            evaluation_notes, intermediate_decision, final_decision, 
            private_admin_notes, track_id
        } = req.body;

        try {
            // Protect private admin notes
            const updatePrivateNotes = userLevel === 3 ? private_admin_notes : undefined;

            const result = await db.query(
                `UPDATE candidates SET 
                    full_name = COALESCE($1, full_name), 
                    email = COALESCE($2, email), 
                    phone = COALESCE($3, phone), 
                    degree_type = COALESCE($4, degree_type),
                    current_stage = COALESCE($5, current_stage),
                    evaluation_notes = COALESCE($6, evaluation_notes),
                    intermediate_decision = COALESCE($7, intermediate_decision),
                    final_decision = COALESCE($8, final_decision),
                    private_admin_notes = COALESCE($9, private_admin_notes),
                    track_id = COALESCE($10, track_id)
                WHERE id = $11 RETURNING *`,
                [full_name, email, phone, degree_type, current_stage, evaluation_notes, intermediate_decision, final_decision, updatePrivateNotes, track_id, id]
            );
            
            if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 5. Delete candidate
    async delete(req, res) {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM candidates WHERE id = $1', [id]);
            res.json({ message: 'Candidate deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 6. Lock Profile Logic
    async lock(req, res) {
        const { id } = req.params;
        const userId = req.user.id;
        try {
            const check = await db.query('SELECT locked_by, locked_at FROM candidates WHERE id = $1', [id]);
            const candidate = check.rows[0];

            if (candidate && candidate.locked_by && candidate.locked_by !== userId) {
                const now = new Date();
                const lockTime = new Date(candidate.locked_at);
                const diff = (now - lockTime) / 1000 / 60; // minutes

                if (diff < 5) {
                    const userRes = await db.query('SELECT full_name FROM users WHERE id = $1', [candidate.locked_by]);
                    const lockerName = userRes.rows[0]?.full_name || 'Unknown Member';
                    return res.status(403).json({ error: `Locked by ${lockerName}` });
                }
            }

            await db.query('UPDATE candidates SET locked_by = $1, locked_at = NOW() WHERE id = $2', [userId, id]);
            res.json({ message: 'Locked' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 7. Get Stats (Dashboard)
    async getStats(req, res) {
        try {
            const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE current_stage = 'Phase 1 (Forms)') as phase1,
                COUNT(*) FILTER (WHERE current_stage = 'Phase 2 (Dynamics)') as phase2,
                COUNT(*) FILTER (WHERE current_stage = 'Phase 3 (Interviews)') as phase3,
                COUNT(*) FILTER (WHERE current_stage = 'Waiting List') as waiting_list,
                COUNT(*) FILTER (WHERE current_stage = 'Phase 4 (Motivational)') as phase4,
                COUNT(*) FILTER (WHERE current_stage = 'Approved') as approved,
                COUNT(*) FILTER (WHERE current_stage = 'Rejected') as rejected
            FROM candidates;
        `;
            const result = await db.query(query);
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch stats" });
        }
    },

    // 8. Import Excel
    async importExcel(req, res) {
        try {
            if (!req.files || !req.files.excelFile) return res.status(400).json({ error: 'No file uploaded' });

            const workbook = xlsx.read(req.files.excelFile.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            for (const row of data) {
                await db.query(
                    `INSERT INTO candidates (full_name, email, phone, degree_type) 
                     VALUES ($1, $2, $3, $4) 
                     ON CONFLICT (email) DO UPDATE SET 
                        phone = EXCLUDED.phone, 
                        degree_type = EXCLUDED.degree_type`,
                    [row.Name, row.Email, row.Phone, row.Degree]
                );
            }
            res.json({ message: `${data.length} candidates imported` });
        } catch (error) {
            res.status(500).json({ error: 'Import failed' });
        }
    },

    // 9. Get Evaluation Feed
    async getEvaluations(req, res) {
        const { id } = req.params;
        try {
            const result = await db.query(`
                SELECT e.id, e.feedback, e.rating, e.stage_evaluated, e.created_at, 
                       u.full_name, u.access_level
                FROM evaluations e
                JOIN users u ON e.member_id = u.id
                WHERE e.candidate_id = $1
                ORDER BY e.created_at DESC
            `, [id]);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch evaluations" });
        }
    },

    // 10. Add New Evaluation
    async addEvaluation(req, res) {
        const { id } = req.params;
        const { feedback, rating, stage_evaluated } = req.body;
        const member_id = req.user.id;

        try {
            const result = await db.query(
                'INSERT INTO evaluations (candidate_id, member_id, feedback, rating, stage_evaluated) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [id, member_id, feedback, rating, stage_evaluated]
            );
            
            const newEval = await db.query(`
                SELECT e.id, e.feedback, e.rating, e.stage_evaluated, e.created_at, 
                       u.full_name, u.access_level
                FROM evaluations e
                JOIN users u ON e.member_id = u.id
                WHERE e.id = $1
            `, [result.rows[0].id]);
            
            res.status(201).json(newEval.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to post evaluation" });
        }
    }
};

module.exports = CandidateController;