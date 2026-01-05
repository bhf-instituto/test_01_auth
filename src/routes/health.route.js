import { Router } from 'express';
import { me } from '../controllers/auth.controller.js'
import checkDBStatus from '../utils/checkDDBStatus.util.js';

const router = Router();
router.get('/me', me);
router.get('/db', checkDBStatus)

export default router;

// import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js'
// import { me } from '../controllers/auth.controller.js'
// // esto es para el front
// // import refreshAccessToken from '../controllers/refreshAccessToken.controller.js';
// // router.post('/refresh', refreshAccessToken)


// const router = Router();

// router.post('/register', registerUser)
// router.post('/login', loginUser);
// router.post('/logout', logoutUser);
// router.get('/me', me);


// export default router;
