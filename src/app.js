import express from 'express';
import userRouter from './routes/user.route.js'
import dbConnection from './config/connectionMySQL.js'
import cookieParser from 'cookie-parser';
import getIndex from './controllers/index.controller.js'
import checkToken from './middlewares/checktoken.middleware.js'
import checkDBStatus from './utils/checkDDBStatus.util.js';

const app = express();


// le decimos que motor de vista queremos que use, esto es para mostrar html
app.set('view engine', 'ejs');

// - .json() parsea las request, osea las convierte en json porque 
// express no toma el req.body como json. 
// - Agregue el cookie parser, mas seguro que guardar tokens en localstorage y session storage
// - checkToken verifica la sesión del usuario 

app.use(express.json());
app.use(cookieParser());
app.use(checkToken)

app.get('/', getIndex)

app.get("/health/db", checkDBStatus);

app.use('/user', userRouter)

export default app;
