const db = require('../config/db');
const xlsx = require('xlsx');

const CandidateController = {
    // List candidates with filters for the Recruitment Environment
    async index(req, res) {
        const { stage, period_id } = req.query;
        try {
            let query = 'SELECT * FROM candidates WHERE 1=1';
            const values = [];

            if (stage) {
                values.push(stage);
                query += ` AND current_stage = $${values.length}`;
            }

            if (period_id) {
                values.push(period_id);
                query += ` AND recruitment_period_id = $${values.length}`;
            }

            const result = await db.query(query, values);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Database fetch error' });
        }
    },

    // Import candidates from Excel file (Ambiente Candidatos)
    async importExcel(req, res) {
        try {
            if (!req.files || !req.files.excelFile) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const workbook = xlsx.read(req.files.excelFile.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // Bulk insert logic (simplified for example)
            for (const row of data) {
                await db.query(
                    'INSERT INTO candidates (full_name, email, phone) VALUES ($1, $2, $3)',
                    [row.Name, row.Email, row.Phone]
                );
            }

            res.json({ message: `${data.length} candidates imported successfully` });
        } catch (error) {
            res.status(500).json({ error: 'Error processing Excel file' });
        }
    }
};

module.exports = CandidateController;