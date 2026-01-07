// import jwt from 'jsonwebtoken';

// const authJWT = (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(401).json({
//             message: "Token requerido"
//         });
//     }

//     // segunda parte del string que es el bearer TOKEN
//     const token = authHeader.split(' ')[1];

//     try {
//         // acá verifico si el usuario es quien dice ser, se esta pasando el jwt seguro. 
//         const user = jwt.verify(token, process.env.JWT_SECRET);
//         req.session.user = {
//             id_user : user.id_user
//         };
//         next();
//     } catch (error) {
//         return res.status(401).json({
//             message: "Token invalido o expirado"
//         });
//     }
// }

// export default authJWT;
