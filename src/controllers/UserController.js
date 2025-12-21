const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserController = {
    /**
     * Authenticate user and return JWT
     * Essential for securing all other environments
     */
    async login(req, res) {
        console.log("JWT Secret Check:", process.env.JWT_SECRET ? "Exists" : "MISSING");
        const { email, password } = req.body;
        // ... resto do código

        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) return res.status(401).json({ error: 'Invalid credentials' });

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

            // Generate token with access_level included
            const token = jwt.sign(
                { id: user.id, access_level: user.access_level },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            // ... depois de gerar o token
            console.log("Token gerado com sucesso!");
            return res.json({
                token: token,
                message: "Login efetuado!"
            });
        } catch (error) {
            console.error("ERRO NO LOGIN:", error); // Isto vai aparecer no 'docker logs'
            res.status(500).json({ error: 'Login server error', details: error.message });
        }
    },

    /**
     * List all members and their activity (Figure 3)
     */
    async index(req, res) {
        try {
            const query = `
                SELECT 
                    u.id, u.full_name, u.email, u.department, u.role, u.access_level,
                    COUNT(e.id) as interviews_conducted
                FROM users u
                LEFT JOIN evaluations e ON u.id = e.member_id
                GROUP BY u.id
                ORDER BY u.full_name ASC;
            `;
            const result = await db.query(query);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching members' });
        }
    },

    /**
     * Register a new member (Admin only)
     */
    async register(req, res) {
        const { full_name, email, password, department, role, access_level } = req.body;

        try {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            const query = `
                INSERT INTO users (full_name, email, password_hash, department, role, access_level)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, full_name, email;
            `;
            const result = await db.query(query, [
                full_name, email, password_hash, department, role, access_level
            ]);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Error creating user' });
        }
    },

    // In MemberController.js or similar
    async getMemberInterviews(req, res) {
        const query = `
            SELECT 
                u.full_name as member_name, 
                u.department,
                COUNT(e.id) as total_interviews,
                ARRAY_AGG(c.full_name) as interviewed_candidates
            FROM users u
            LEFT JOIN evaluations e ON u.id = e.member_id
            LEFT JOIN candidates c ON e.candidate_id = c.id
            GROUP BY u.id;
        `;
        const result = await db.query(query);
        // Altere para usar o access_level, que é o que define as permissões no seu sistema
        res.json({
            token,
            user: {
                name: user.full_name,
                access_level: user.access_level
            }
        });
    }

};

module.exports = UserController;