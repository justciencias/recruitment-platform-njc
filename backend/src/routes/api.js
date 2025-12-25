const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/auth'); // User's custom middleware

const CandidateController = require('../controllers/CandidateController');
const EmailController = require('../controllers/EmailController');
const EvaluationController = require('../controllers/EvaluationController');
const UserController = require('../controllers/UserController');
const TrackController = require('../controllers/TrackController');

// Only members can view candidates
router.get('/candidates', authorize(1), CandidateController.index);

// Only admins (Level 3) can import data via Excel
router.post('/candidates/import', authorize(3), CandidateController.importExcel);

// Fetch email template by stage
router.get('/emails/template', authorize(1), EmailController.getTemplateByStage);

// Level 2 (Evaluator) or Level 3 (Admin) can send emails
router.post('/emails/sendBulk', authorize(2), EmailController.sendBulk);

/**
 * Level 2: Evaluator (Can read data and submit evaluations)
 * Level 3: Admin (Can edit candidate personal details)
 */

// === FIX 1: Add authorize(1) here so req.user exists ===
router.get('/candidates/:id/evaluations', authorize(1), CandidateController.getEvaluations);
router.post('/candidates/:id/evaluations', authorize(1), CandidateController.addEvaluation);

// Get history (All Members)
router.get('/candidates/:candidate_id/history', authorize(2), EvaluationController.getCandidateHistory);

router.get('/stats', authorize(1), CandidateController.getStats);

// Public route for login
router.post('/login', UserController.login);
router.put('/user/password', authorize(1), UserController.updatePassword);

router.get('/users', authorize(1), UserController.index);
router.post('/users/register', authorize(3), UserController.register);
router.delete('/users/:id', authorize(3), UserController.delete);

router.post('/candidates/:id/lock', authorize(1), CandidateController.lock); 
router.get('/candidates/:id', authorize(1), CandidateController.show);

// === FIX 2: Changed to authorize(1) ===
// We lowered this from (3) to (1) because Evaluators need to Update decisions.
// The Controller logic we wrote earlier already protects the Admin-only fields.
router.put('/candidates/:id', authorize(1), CandidateController.update);

// Tracks Management
router.get('/tracks', authorize(1), TrackController.index);
router.post('/tracks', authorize(3), TrackController.store);
router.put('/tracks/:id/activate', authorize(3), TrackController.activate);
router.delete('/tracks/:id', authorize(3), TrackController.destroy);

module.exports = router;