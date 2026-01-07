import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js'
// import { me } from '../controllers/auth.controller.js'
// esto es para el front
// import refreshAccessToken from '../controllers/refreshAccessToken.controller.js';
// router.post('/refresh', refreshAccessToken)


const router = Router();

router.post('/register', registerUser)
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;
