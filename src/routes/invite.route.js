import { Router } from 'express';
import { createInvite, acceptInvite } from '../controllers/invite.controller.js';

const router = Router();

router.post('/:id_group/create', createInvite)
router.post('/accept', acceptInvite)

export default router;



// import checkToken from '../middlewares/checktoken.middleware.js';
// import {
//   createGroup, getMyGroups
// } from '../controllers/group.controller.js';
// import checkGroupAccess from '../middlewares/checkGroupAccess.middleware.js';
// import { getMyExpensesFromGroup, getExpensesFromGroup } from '../controllers/group.controller.js';


// acá checkToken va a funcionar por segunda vez, deberia ajustar 
// correctamente porque en app.js el middleware aplica a todos los 
// endpoints y no deberia
// router.post('/create', createGroup);
// router.get('/getAll', checkGroupAccess, getMyGroups);
// router.get('/asd', checkGroupAccess, getMyGroups);

// router.get('/', getMyGroups);
// router.get(`/:id/myExpenses`, checkGroupAccess, getMyExpensesFromGroup);
// router.get(`/:id/expenses`, checkGroupAccess, getExpensesFromGroup);

