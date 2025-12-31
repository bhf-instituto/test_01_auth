import bcrypt from 'bcryptjs'
import dbConnection from '../config/connectionMySQL.js';
import jwt from 'jsonwebtoken';

const saltRounds = Number (process.env.SALT_ROUNDS);

const getAll = async (req, res) => {
    try {
        const [results, fields] = await dbConnection.query('SELECT * FROM users;');
        // console.log(results);
        res.status(200).json({
            result: results
        })

    } catch (error) {
        console.log(error);
    }
};

const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({
            message: "Email y contraseña requerido"
        })

        const [userResult] = await dbConnection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userResult.length > 0) return res.status(400).json({
            message: "usuario already exists"
        })

        const normEmail = email.toLowerCase().trim();

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await dbConnection.query(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [normEmail, hashedPassword]
        );

        return res.status(201).json({
            message: "Usuario registrado correctamente"
        });

    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "El usuario ya existe"
            });
        }

        return res.status(500).json({
            message: "Internal service error",
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email y contraseña requeridos"
            });
        }

        const normEmail = email.trim().toLowerCase();

        // acá traigo un array con objetos que van a tener las propiedades id y password_hash [{id: , pass:},{...}...]
        const [results] = await dbConnection.query('SELECT id_user, password_hash FROM users WHERE email = ?', [normEmail])

        if (results.length === 0) return res.status(401).json({
            message: "Usuario no existe"
        })

        //este user es el que traje de la base de datos
        const user = results[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) return res.status(401).json({
            message: "Contraseña incorrecta."
        })

        const token = jwt.sign(
            {id: user.id_user, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn : '1h'}
        );
        // res.cookie( name, actual token, configs)
        res.cookie('access_token', token, {
            httpOnly: true, // la cookie solo se puede acceder en el servidor
            secure: process.env.NODE_ENV === 'production', // la cooque solo se puede acceder en https
            sameSite: 'strict', // solo se puede acceder desde el mismo dominio
            maxAge: 1000 * 60 * 60 // la cookie tiene un tiempo de validez de 1 hs 

        }).send({user, token})

        // res.status(200).json({
        //     message: "Inicio de sesion correcto"
        // })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

const enterProtected = async (req, res) => {

    const token = req.cookies.access_token;

    if(!token) res.status(403).json({
        message: "Acceso no autorizado"
    })
    // TODO: si el usuario está en sesion, renderizar protected.ejs
    // res.render('protected', {email: "asdasd"}) 
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        res.render('protected', data)
    } catch (error) {
        
    }

}

export { getAll, registerUser, loginUser, enterProtected }
