const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/auth');

const CandidateController = require('../controllers/CandidateController');
const EmailController = require('../controllers/EmailController');
const EvaluationController = require('../controllers/EvaluationController');
const UserController = require('../controllers/UserController');

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

// Submit feedback (Members/Evaluators)
router.post('/evaluations', authorize(2), EvaluationController.create);

// Get history (All Members)
router.get('/candidates/:candidate_id/history', authorize(2), EvaluationController.getCandidateHistory);

// Edit candidate personal info (Admin only)

router.get('/stats', authorize(1), CandidateController.getStats);

// Public route for login
router.post('/login', UserController.login);

// Protected routes (Ambiente Membros)
router.get('/users', authorize(1), UserController.index);
router.post('/users/register', authorize(3), UserController.register);

router.post('/candidates/:id/lock', authorize(1), CandidateController.lock); 
router.get('/candidates/:id', authorize(1), CandidateController.show);
router.put('/candidates/:id', authorize(3), CandidateController.update);


module.exports = router;