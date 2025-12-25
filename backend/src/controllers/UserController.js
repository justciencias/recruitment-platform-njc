const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserController = {
    /**
     * Authenticate user and return JWT
     * Essential for securing all other environments
     */
    async login(req, res) {
        console.log("JWT Secret Check:", process.env.JWT_SECRET ? "Exists" : "MISSING");
        const { email, password } = req.body;

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

            console.log("Token gerado com sucesso!");
            return res.json({
                token: token,
                message: "Login efetuado!"
            });
        } catch (error) {
            console.error("ERRO NO LOGIN:", error);
            res.status(500).json({ error: 'Login server error', details: error.message });
        }
    },

    // List all members and their activity
    async index(req, res) {
        try {
            console.log("Attempting to fetch users...");
            const result = await db.query('SELECT * FROM users');
            console.log("Users found:", result.rows.length);
            res.json(result.rows);
        } catch (error) {
            console.error("SQL FETCH ERROR:", error.message);
            res.status(500).json({ error: error.message });
        }
    },
    async register(req, res) {
        const { full_name, email, password, department, role_id } = req.body;

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.query(
                'INSERT INTO users (full_name, email, password_hash, department, access_level) VALUES ($1, $2, $3, $4, $5)',
                [full_name, email, hashedPassword, department, role_id]
            );

            res.status(201).json({ message: 'Member registered successfully!' });
        } catch (error) {
            console.error("REGISTRATION ERROR:", error.message);
            res.status(500).json({ error: 'Failed to register member' });
        }
    },


    async getMemberInterviews(req, res) {
        try {
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
            res.json(result.rows);
        } catch (error) {
            console.error("SQL ERROR:", error.message);
            res.status(500).json({ error: "Database error" });
        }
    },

    async delete(req, res) {
        const { id } = req.params;

        try {
            // Prevent deleting the last admin or own user 
            if (req.user.id === parseInt(id)) {
                return res.status(400).json({ error: "You cannot delete your own account." });
            }

            const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "User not found." });
            }

            res.json({ message: "Member deleted successfully." });
        } catch (error) {
            console.error("DELETE ERROR:", error.message);
            res.status(500).json({ error: "Database error during deletion." });
        }
    },

    async updatePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From authMiddleware

        try {
            // Get current hash using the correct column 'password_hash'
            const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
            const user = userResult.rows[0];

            if (!user) return res.status(404).json({ error: "User not found" });

            // Compare with 'password_hash'
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: "Incorrect current password" });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update using 'password_hash'
            await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

            res.json({ message: "Password updated successfully" });
        } catch (error) {
            console.error("PASSWORD UPDATE ERROR:", error);
            res.status(500).json({ error: "Server error updating password" });
        }
    }
};

module.exports = UserController;