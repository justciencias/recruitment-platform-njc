const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/auth');
const pool = require('../config/db');

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
router.post('/candidates', authorize(3), CandidateController.store);
router.post('/candidates/bulk-delete', authorize(3), CandidateController.bulkDelete);

router.put('/candidates/:id', authorize(1), CandidateController.update);

// Tracks Management
router.get('/tracks', authorize(1), TrackController.index);
router.post('/tracks', authorize(3), TrackController.store);
router.put('/tracks/:id/activate', authorize(3), TrackController.activate);
router.delete('/tracks/:id', authorize(3), TrackController.destroy);

module.exports = router;