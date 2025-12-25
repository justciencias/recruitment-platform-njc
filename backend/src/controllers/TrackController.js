const db = require('../config/db');

const TrackController = {
    // LIST TRACKS
    async index(req, res) {
        try {
            const result = await db.query('SELECT * FROM recruitment_tracks ORDER BY created_at DESC');
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // CREATE TRACK
    async store(req, res) {
        const { name } = req.body;
        try {
            // Archive everything first
            await db.query("UPDATE recruitment_tracks SET status = 'archived' WHERE status = 'active'");

            // Create the new track as 'active'
            const result = await db.query(
                'INSERT INTO recruitment_tracks (name, status) VALUES ($1, $2) RETURNING *',
                [name, 'active']
            );
            
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error("Create Track Error:", error.message);
            res.status(500).json({ error: "Failed to create track" });
        }
    },

    // ACTIVATE TRACK
    async activate(req, res) {
        const { id } = req.params;
        try {
            // Archive everything
            await db.query("UPDATE recruitment_tracks SET status = 'archived'");

            // Activate the target
            await db.query("UPDATE recruitment_tracks SET status = 'active' WHERE id = $1", [id]);

            res.json({ message: "Track activated successfully" });
        } catch (error) {
            res.status(500).json({ error: "Failed to activate track" });
        }
    },

    // DELETE TRACK
    async destroy(req, res) {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM recruitment_tracks WHERE id = $1', [id]);
            res.json({ message: "Track deleted" });
        } catch (error) {
            // This happens if candidates are linked to this track
            res.status(500).json({ error: "Cannot delete track with active candidates" });
        }
    }
};

module.exports = TrackController;