import bcrypt from 'bcryptjs'
import dbConnection from '../config/connectionMySQL.js';
import jwt from 'jsonwebtoken';
import { render } from 'ejs';

const saltRounds = Number(process.env.SALT_ROUNDS);

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
        const [results] = await dbConnection.query('SELECT email, password_hash FROM users WHERE email = ?', [normEmail])

        if (results.length === 0) return res.status(401).json({
            message: "Usuario no existe"
        })

        if (results.length > 1) return res.status(401).json({
            message: "Usuario repetido ← ← ←"
        })

        //este user es el que traje de la base de datos
        const user = results[0];

        // comparo lo que envia el usuario por la req con lo que recibo de la DB
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) return res.status(401).json({
            message: "Contraseña incorrecta."
        })

        // Acá se crea el JWT. 
        const accessToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1m' }
        )

        const refreshToken = jwt.sign(
            { email: user.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        )

        await dbConnection.query(
            `INSERT INTO refresh_tokens (user_email, token, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
            [user.email, refreshToken]
        )

        // const token = jwt.sign(
        //     { email: user.email },
        //     process.env.JWT_SECRET,
        //     { expiresIn: '1h' }
        // );
        // res.cookie( name, actual token, configs)
        res
            .cookie('access_token', accessToken, {
                httpOnly: true, // la cookie solo se puede acceder en el servidor, osea no con js desde el navegador
                secure: process.env.NODE_ENV === 'production', // la cookie solo se puede acceder en https
                sameSite: 'strict', // solo se puede acceder desde el mismo dominio
                maxAge: 1000 * 60 * 1 // tiempo de validez de la cookie
            })
            .cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7
            })
            .send({ 
                message: "Login OK",
                user, 
                accessToken
            })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

const enterProtected = async (req, res) => {

    const { user } = req.session;
    if (user == null) return res.status(400).json({ message: "Acceso no autorizado" })
    else res.render('protected', user)
}

const logoutUser = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
        await dbConnection.query(
            `DELETE FROM refresh_tokens WHERE token = ? `,
            [refreshToken]
        )
    }

    res
        .clearCookie('access_token')
        .clearCookie('refresh_token')
        .json({ message: 'logout successful'})


    // res.clearCookie('access_token')
    //     .json({ message: 'logout successful' })
}

export { getAll, registerUser, loginUser, enterProtected, logoutUser }
