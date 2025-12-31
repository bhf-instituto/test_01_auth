import { Router } from 'express';
import { getAll, registerUser, loginUser, enterProtected } from '../controllers/user.controller.js'
import authJWT from '../services/jwt.service.js';

const router = Router();

router.route('/getAll').get(getAll);

// router.route('/register').post(registerUser);
router.post('/register', registerUser)
router.post('/login', loginUser);

router.get('/protected', enterProtected)

export default router;