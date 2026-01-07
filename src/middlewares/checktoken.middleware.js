import jwt from 'jsonwebtoken';
import dbConnection from '../config/connectionMySQL.js'

const checkToken = async (req, res, next) => {
    req.user = null;

    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    // si hay accesstoken, verifico si es correcto.
    if (accessToken) {

        try {
            const data = jwt.verify(accessToken, process.env.JWT_SECRET);
            req.user = {
                id_user : data.id_user,
                email : data.email
            }; 
            return next();
        } catch {}
    }

    // si no hay accessToken y tampco hay refreshToken, salgo porque no hay sesión.
    if (!refreshToken) {
        return next();
    }

    // si hay refreshToken, intentamos validarlo. 
    try {
        // console.log("aca")
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const [rows] = await dbConnection.query(
            'SELECT * FROM refresh_tokens WHERE token = ?',
            [refreshToken]
        );

        // si no hay resultados en la query mysql salgo, significa que el refreshToken
        // no se puede validar con los que estan almacenados en la DB.
        if (rows.length == 0) return next();

        // const [userId] = await dbConnection.query('SELECT id_user FROM users WHERE email = ')
        // si encontró coincidencias en la DB significa que el refreshToken es correcto,
        // entocnes creamos un nuevo accessToken.

        const newAccessToken = jwt.sign(
            {
                id_user: payload.id_user,
                email : payload.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 15
        });

        req.user = {
            id_user : payload.id_user,
            email : payload.email
        };

        return next();


    } catch (error) {
        console.log("error al verificar el refresh token o crear el nuevo access_token", error)
        return next();
    }

}

export default checkToken;
