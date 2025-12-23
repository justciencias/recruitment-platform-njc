const db = require('../config/db');
const xlsx = require('xlsx');

const CandidateController = {
    // List candidates with sorting and degree filtering
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

            // Allow dynamic sorting by Name, Degree, or Phase 
            const allowedSorts = ['full_name', 'degree_type', 'current_stage'];
            const safeSort = allowedSorts.includes(sort) ? sort : 'full_name';
            query += ` ORDER BY ${safeSort} ${order === 'DESC' ? 'DESC' : 'ASC'}`;

            const result = await db.query(query, values);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Database fetch error' });
        }
    },

    // Import includes the Degree attribute 
    async importExcel(req, res) {
        try {
            if (!req.files || !req.files.excelFile) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

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

            res.json({ message: `${data.length} candidates imported successfully` });
        } catch (error) {
            console.error("Import Error:", error);
            setNotification({ message: 'Error processing Excel file', type: 'error' });
        }
    },

    // Add this inside the CandidateController object in CandidateController.js
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

    // Exclusive Locking Logic: Only one member can edit at a time 
    async lock(req, res) {
        const { id } = req.params;
        const userId = req.user.id;
        try {
            const check = await db.query('SELECT locked_by_id FROM candidates WHERE id = $1', [id]);
            if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });

            const currentLock = check.rows[0].locked_by_id;
            if (currentLock && currentLock !== userId) {
                return res.status(403).json({ error: 'Candidate is locked by another member.' });
            }

            await db.query('UPDATE candidates SET locked_by_id = $1 WHERE id = $2', [userId, id]);
            res.json({ message: 'Locked' });
        } catch (err) {
            res.status(500).json({ error: 'DB Error' });
        }
    },

    // Show with Level 3 Privacy Protection 
    async show(req, res) {
        const { id } = req.params;
        const userLevel = req.user.access_level;
        try {
            const result = await db.query('SELECT * FROM candidates WHERE id = $1', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Candidate not found' });
            }

            const candidate = result.rows[0];

            // Only Presidency/RH (Level 3) can see private notes 
            if (userLevel < 3) {
                delete candidate.private_admin_notes;
            }

            res.json(candidate);
        } catch (error) {
            res.status(500).json({ error: 'Database error' });
        }
    },

    async update(req, res) {
        const { id } = req.params;
        const userLevel = req.user.access_level;
        const {
            full_name, email, phone, current_stage,
            evaluation_notes, intermediate_decision,
            final_decision, private_admin_notes
        } = req.body;

        try {
            // Protect private admin notes from non-admin updates 
            const updatePrivateNotes = userLevel === 3 ? private_admin_notes : undefined;

            const query = `
                UPDATE candidates 
                SET full_name = $1, email = $2, phone = $3, current_stage = $4, 
                    evaluation_notes = $5, intermediate_decision = $6, 
                    final_decision = $7, 
                    private_admin_notes = COALESCE($8, private_admin_notes)
                WHERE id = $9 RETURNING *`;

            const values = [
                full_name, email, phone, current_stage,
                evaluation_notes, intermediate_decision,
                final_decision, updatePrivateNotes, id
            ];

            const result = await db.query(query, values);
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Error updating candidate' });
        }
    }
};

module.exports = CandidateController;