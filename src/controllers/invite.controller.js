import { generateInviteToken } from "../utils/inviteToken.util.js";
import dbConnection from '../config/connectionMySQL.js'
import jwt from 'jsonwebtoken';
import { ifSession } from "../utils/ifSession.js";

export const createInvite = async (req, res) => {
   
    ifSession(req, res)

    const email = req.body.email?.toLowerCase().trim();
    const groupId = req.params.id_group;
    const userId = req.user.id_user;


    const [userExists] = await dbConnection.query(
        `SELECT 1 FROM users 
        WHERE email = ?`,
        [email]
    )

    if (userExists.length === 0) return res.status(403).json({
        ok: false,
        data: {
            message: "email requerido"
        }
    });


    if (email.trim() === '') return res.status(403).json({
        ok: false,
        data: {
            message: "email requerido"
        }
    });

    const [results] = await dbConnection.query(
        `SELECT 1
         FROM expense_groups
         WHERE id_group = ?
         AND creator_user_id = ?
         LIMIT 1;`,
        [groupId, userId]
    );

    if (results.length === 0) {
        return res.status(403).json({
            ok: false,
            message: "Solo el creador puede invitar usuarios"
        });
    }
    if (email.toLowerCase().trim() == req.user.email) {
        return res.status(401).json({
            ok: false,
            data: {
                message: "no te podes invitar a vos mismo"
            }
        })
    }

    const token = generateInviteToken({
        invited_by: req.user.id_user,
        group_id: groupId,
        email: email.trim()
    })

    const link = `${process.env.FRONT_URL}/invite?token=${token}`;

    res.json({
        ok: true,
        data: {
            invite_link: link
        }
    })
}

export const acceptInvite = async (req, res) => {


    if (!req.user) return res.status(401).json({
        ok: false,
        data: {
            message: "access denied"
        }
    })

    const { token } = req.body;

    try {
        const payload = jwt.verify(token, process.env.JWT_INVITE_SECRET);

        // verifico que el type del payload sea invite
        if (payload.type !== 'invite') {
            return res.status(400).json({
                ok: false,
                data: {
                    message: "token inválido"
                }
            })
        }

        // verifico que no me esté enviando la invitación a mi mismo 
        if (payload.email.trim() !== req.user.email) {
            return res.status(403).json({
                ok: false,
                data: {
                    message: "Esta invitación no es para vos"

                }
            });
        }

        // busco si ya pertenezco al grupo que me estan invitando
        const [alreadyAtGroup] = await dbConnection.query(
            `SELECT 1 
             FROM expense_group_users
             WHERE group_id = ?
             AND user_id = ?
             LIMIT 1`,
            [payload.group_id, req.user.id_user]
        )

        if (alreadyAtGroup.length != 0) return res.status(409).json({
            ok: false,
            data: {
                message: "user already at that group"
            }
        })

        // verifico que el grupo al que fui invitado efectivament exista
        const [groupExists] = await dbConnection.query(
            `SELECT 1 FROM expense_groups WHERE id_group = ?`,
            [payload.group_id]
        );

        if (groupExists.length === 0) return res.status(404).json({
            ok: false,
            data: {
                message: "El grupo no encontrado"

            }
        });

        // todo ok hago el insert en la DB
        await dbConnection.query(
            `INSERT INTO expense_group_users (group_id, user_id)
             VALUES (?, ?);`,
            [payload.group_id, req.user.id_user]
        );

        res.json({
            ok: true,
            data: {
                message: "invitación aceptada",
                invited_by: payload.invited_by,
                group_id: payload.group_id
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            ok: false,
            data: {
                message: "invitación expirado o inválida",
            }
        })
    }
}