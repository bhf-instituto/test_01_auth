import express from 'express';
import healthRouter from './routes/health.route.js'
import authRouter from './routes/auth.route.js'
import groupRouter from './routes/group.route.js'
import inviteRouter from './routes/invite.route.js'
import cookieParser from 'cookie-parser';
import getIndex from './controllers/index.controller.js'
import checkToken from './middlewares/checktoken.middleware.js'


const app = express();


// le decimos que motor de vista queremos que use, esto es para mostrar html
// app.set('view engine', 'ejs');

// - .json() parsea las request, osea las convierte en json porque 
// express no toma el req.body como json. 
// - Agregue el cookie parser, mas seguro que guardar tokens en localstorage y session storage
// - checkToken verifica la sesión del usuario 

app.use(express.json());
app.use(cookieParser());
app.use(checkToken)

app.get('/', getIndex)


app.use("/health", healthRouter);
app.use('/auth', authRouter)
app.use('/groups', groupRouter)
app.use('/invite', inviteRouter)


export default app;
