import { Router } from 'express';
import { meStatus } from '../utils/meStatus.util.js'
import { dbStatus } from '../utils/dbStatus.util.js'

const router = Router();
router.get('/me', meStatus);
router.get('/db', dbStatus)

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
