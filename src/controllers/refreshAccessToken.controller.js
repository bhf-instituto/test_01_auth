import dbConnection from '../config/connectionMySQL.js'

const refreshAccessToken = async (req, res) => {
    const refreshToken = res.cookies.refresh_token;
    if (!refreshToken) return res.status(401).json({
        message: "No hay Refresh Token"
    })

    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        const [data] = await dbConnection.query(
            `SELECT * FROM refresh_tokens WHERE token = ?`,
            [refreshToken]
        )

        if (data.length === 0) return res.status(40).json({
            message: "Refresh Token inválido"
        })

        const newAccessToken = jwt.sign(
            { email: payload.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 15
        })

        return res.status(200).json({
            message: "refresh token válido, nuevo access token creado"
        })


    } catch (error) {
        return res.status(500).json({
            message: 'Internal service error'
        })

    }
}

export default refreshAccessToken;