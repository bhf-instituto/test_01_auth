import express from 'express';
import userRouter from './routes/user.route.js'
import dbConnection from './config/connectionMySQL.js'
import cookieParser from 'cookie-parser';

const app = express();


// le decimos que motor de vista queremos que use, esto es para mostrar html
app.set('view engine', 'ejs');

// esto parsea las request, osea las convierte en json porque 
// express no toma el req.body como json. 
// Agregue el cookie parser, mas seguro que guardar tokens en localstorage y session storage
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  // renderizo la pagina 
  res.render('index');
})

app.get("/health/db", async (req, res) => {
  try {
    const [rows] = await dbConnection.query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/user', userRouter)

export default app;
