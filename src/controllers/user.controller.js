import bcrypt from 'bcryptjs'
import dbConnection from '../config/connectionMySQL.js';
import jwt from 'jsonwebtoken';
import { render } from 'ejs';

const saltRounds = Number(process.env.SALT_ROUNDS);

const getAll = async (req, res) => {
    const { user } = req.session;
    if (user == null) return res.status(400).json({
        ok: false,
        data: {
            message: "access denied"
        }
    })

    // const data = jwt.verify(req.cookies.JWT_SECRET, process.env.JWT_SECRET);



    const [users] = await dbConnection.query('SELECT email FROM users;')


    res.render('getAll', { users: users })
    // else res.render('getAll', data)

    // try {
    //     const token = req.cookies.access_token;
    //     // console.log(token)

    //     if(typeof token == 'undefined') return res.status(404).json({
    //         message: 'no autorizado'
    //     })

    //     const data = jwt.verify(token, process.env.JWT_SECRET);

    //     if(data.length == 0 ) return res.status(404).json({
    //         message: 'token inválido'
    //     })

    //     const [results] = await dbConnection.query('SELECT email FROM users WHERE email = ?;', [data.email])

    //     console.log(results[0])
    //     // const [results, fields] = await dbConnection.query('SELECT id_user, email FROM users;');
    //     // // console.log(results);
    //     // res.status(200).json({
    //     //     result: results
    //     // })

    //     return res.status(200).json({
    //         message: 'acceso autrizado',


    //     })

    // } catch (error) {
    //     console.log(error);
    // }
};

const registerUser = async (req, res) => {


        // TODO: verificación de datos mas dura antes de guardar en db 


    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({
            ok: false,
            data: {
                message: "all field required"
            }
        })

        const normEmail = email.toLowerCase().trim();

        const [userResult] = await dbConnection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userResult.length > 0) return res.status(400).json({
            ok: false,
            data: {
                message: "user already exists"
            }
        })


        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await dbConnection.query(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [normEmail, hashedPassword]
        );


        const userId = result.insertId;

        // Acá se crea el JWT. 
        const accessToken = jwt.sign(
            {
                userId: userId
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            {
                userId: userId
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        )

        await dbConnection.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
            [userId, refreshToken]
        )



        res
            .cookie('access_token', accessToken, {
                httpOnly: true, // la cookie solo se puede acceder en el servidor, osea no con js desde el navegador
                secure: process.env.NODE_ENV === 'production', // la cookie solo se puede acceder en https
                sameSite: 'strict', // solo se puede acceder desde el mismo dominio
                maxAge: 1000 * 60 * 15 // tiempo de validez de la cookie
            })
            .cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7
            })

        return res
            .status(201).json({
                ok: true,
                data: {
                    message: 'user created correctly'
                }
            })

    } catch (error) {
        // el error ER_DUP_ENTRY es de la DB
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                ok: false,
                data: {
                    message: "user already exists"
                }
            });
        }

        return res.status(500).json({
            ok: false,
            data: {
                message: "internal service error"
            }
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                data: {
                    message: "all fields required"
                }
            });
        }

        // normalizo el email porque viene del frontend, no de la base de datos.
        // deveria llegar normalizado, pero por las dudas. 
        const normEmail = email.trim().toLowerCase();

        // acá traigo un array con objetos que van a tener las propiedades id y password_hash [{id: , pass:},{...}...]
        const [results] = await dbConnection.query('SELECT id_user, password_hash FROM users WHERE email = ?', [normEmail])

        if (results.length === 0) return res.status(401).json({
            ok: false,
            data: {
                message: "user does not exists"
            }
        })

        //este user es el que traje de la base de datos
        const user = results[0];

        // comparo lo que envia el usuario por la req con lo que recibo de la DB
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) return res.status(401).json({
            ok: false,
            data: {
                message: "wrong password"
            }
        })

        // Acá se crea el JWT. 
        const accessToken = jwt.sign(
            {
                userId: user.id_user
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            {
                userId: user.id_user
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        )

        await dbConnection.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
            [user.id_user, refreshToken]
        )

        res
            .cookie('access_token', accessToken, {
                httpOnly: true, // la cookie solo se puede acceder en el servidor, osea no con js desde el navegador
                secure: process.env.NODE_ENV === 'production', // la cookie solo se puede acceder en https
                sameSite: 'strict', // solo se puede acceder desde el mismo dominio
                maxAge: 1000 * 60 * 15 // tiempo de validez de la cookie
            })
            .cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7
            })
            .send({
                ok: true,
                data: {
                    message: "login ok",
                    userId : user.id_user
                }
            })

    } catch (error) {
        
        return res.status(500).json({
            ok: false,
            data: {
                message: "internal service error"
            }
        });
    }
}

const enterProtected = async (req, res) => {

    const { user } = req.session;
    if (user == null)
        return res.status(400).json({
            ok: false,
            data: {
                message: "access denied"
            }
        })
    else res.render('protected', user)
}

const logoutUser = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    // console.log(refreshToken)
    if (refreshToken) {
        await dbConnection.query(
            `DELETE FROM refresh_tokens WHERE token = ? `,
            [refreshToken]
        )
    }

    res
        .clearCookie('access_token')
        .clearCookie('refresh_token')
        .json({
            ok: true,
            data: {
                message: "logout successful"
            }
        })
}



export { getAll, registerUser, loginUser, enterProtected, logoutUser }
