import jwt from 'jsonwebtoken';
import dbConnection from '../config/connectionMySQL.js'

const checkToken = async (req, res, next) => {
    // creo esta propiedad session que va a estar dentro de la request para poder
    // ser accedida en procesos posteriores, reseteada ({user : null});
    req.session = { user: null };

    // trato de obtener los tokens de las cookies
    const accesToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    // si no hay accessToken continua con el siguiente proceso.
    if (!accesToken) return next();

    try {
        // intento verificar el token, obtengo la info del payload, finalmente 
        // continuo ya que se verifica correctamente el accessToken.
        const data = jwt.verify(access_token, process.env.JWT_SECRET);
        req.session.user = data;
        return next();

    } catch (error) {
        // en el caso de que no haya accesstToken o esté expirado verifico que 
        // haya un refreshToken. Si no hay, continuo. No se pud overificar el usuario.
        if (!refreshToken) return next();

        try {

            // Si hay refreshToken, intento verificarlo para recuperar el payload (info del usuario)
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // recupero el payload, entonces intento recuperar informacion desde la DB usando el 
            // refreshToken que vino en la cookie inicialmente.
            const [data] = await dbConnection.query(
                `SELECT * FROM refresh_tokens WHERE token = ?`,
                [refreshToken]
            );

            // si no hay usuarios que coincidan con el token que llego en la cookie continuo al 
            // siguente proceso.
            if (data.length === 0) return next();

            // Si el refreshToken es válido y se encontró el resultado buscado en la DB, creo un nuevo 
            // accessToken

            const newAccessToken = jwt.sign(
                { email: payload.email },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            res.cookie('access_token', newAccessToken,
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 1000 * 60 * 15
                }
            );

            req.session.user = { email : payload.email }

        } catch {}
    }

    next();

    // try {
    //     const data = jwt.verify(token, process.env.JWT_SECRET);
    //     // acá agrego informacion a la req, luego se puede acceder a esta nueva
    //     // propiedad desde cualquier enddpoint que venga después
    //     req.session.user = data;
    // } catch {}

    // next();
}

export default checkToken;