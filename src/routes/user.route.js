import { Router } from 'express';
import { getAll, registerUser, loginUser, enterProtected, logoutUser } from '../controllers/user.controller.js'
import refreshAccessToken from '../controllers/refreshAccessToken.controller.js';

const router = Router();

router.route('/getAll').get(getAll);

router.post('/register', registerUser)
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.post('/refresh', refreshAccessToken)

router.get('/protected', enterProtected)

export default router;