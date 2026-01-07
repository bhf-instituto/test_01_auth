import dbConnection from '../config/connectionMySQL.js'

const checkGroupAccess = async (req, res, next) => {
    if (!req.user) return res.json({
        ok: false,
        data: {
            message: "not auth"
        }
    })

    const userId = req.user.id_user;
    const groupId = req.params.id;

    try {
        const [results] = await dbConnection.query(
            `SELECT 1 
            FROM expense_group_users
            WHERE group_id = ? AND user_id = ?`,
            [groupId, userId]
        )

        if (results.length === 0) return res.json({
            ok: false,
            data: {
                message: "access denied for to this group"
            }
        })
        // usuario tiene acceso al grupo:
        console.log(`User ${userId} has access to group ${groupId}`)
        next();

    } catch (error) {
        return res.status(500).json({
            ok: false,
            error: 'Error validando acceso al grupo'
        });
    }
};

export default checkGroupAccess;