import express from 'express';
import SessionController from '../controllers/session_controller';
import Authorisation from '../middleware/protect_routes';

const authorise = new Authorisation();

const router = express.Router();


// creation of object
const session_controller = new SessionController();

// session creation
router.post('/sessions', authorise.checkUser, session_controller.create);

// a mentor can view all mentorship request sessions created against him
router.get('/sessions', authorise.checkMentor, session_controller.mentorViewAllSessionRequests);

// a mentor can view a specific mentorship request sessions created against him
router.get('/sessions/:id', authorise.checkMentor, session_controller.view_specific_session_request);
// a mentor can accept a mentorship request sessions
router.patch('/sessions/:id/accept', session_controller.acceptSession);
// a mentor can reject a mentorship request sessions
router.patch('/sessions/:id/reject', session_controller.rejectSession);

// a mentee can view all mentorship request sessions created by him
router.get('/sessions', authorise.checkUser, session_controller.menteeViewAllSessionRequests);
export default router;
