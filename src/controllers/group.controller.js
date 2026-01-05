import dbCollection from '../config/connectionMySQL.js';

export const createGroup = async (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            ok: false,
            data: {
                message: "access denied"
            }
        });
    }

    const { name } = req.body;
    const userId = req.session.user.userId;

    // console.log("→ → → ", name, userId)

    if (!name || !name.trim()) {
        return res.status(400).json({
            ok: false,
            data: {
                message: "name field required"
            }
        });
    }

    try {

        // 1. creo un grupo
        const [groupResults] = await dbCollection.query(
            `INSERT INTO expense_groups (name, creator_user_id)
             VALUES (? , ?)`,
            [name.trim(), userId]
        )
        // 1.1 Obtengo la id del insert
        const groupId = groupResults.insertId;

        // 2. Agrego al creador del grupo
        await dbCollection.query(
            `INSERT INTO expense_group_users
            (group_id, user_id)
            VALUES (?, ?)`, [groupId, userId]
        )

        return res.status(201).json({
            ok: true,
            data: {
                message: "group created successfully",
                id_group: groupId,
                name: name.trim()
            }
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            error: 'Error al crear el grupo'
        });
    }
};

export const getMyGroups = async (req, res) => {
    if (!req.session.user) return res.json({
        ok: false,
        data: {
            message: "not auth"
        }
    })

    const userId = req.session.user.userId;

    try {
        const [groups] = await dbCollection.query(
            `SELECT 
             g.id_group,
             g.name,
             g.created_at,
             g.creator_user_id
             FROM expense_groups g
             INNER JOIN expense_group_users gu
             ON gu.group_id = g.id_group
             WHERE gu.user_id = ? 
             ORDER BY g.created_at DESC`,
            [userId]
        )

        if (groups.length === 0) return res.status(400).json({
            ok: false,
            data: {
                message: 'there is no groups'
            }
        });


        return res.json({
            ok: true,
            data: groups
        });
    } catch (error) {

        return res.status(500).json({
            ok: false,
            data: {
                message: 'Error al obtener los grupos'
            }
        });
    }
}

export const getMyExpensesFromGroup = async (req, res) => {
    if (!req.session.user) return res.json({
        ok: false,
        data: {
            message: "invalid session"
        }
    })

    const groupId = req.params.id;
    const userId = req.session.user.userId;

    try {
        const [expenses] = await dbCollection.query(
            `SELECT amount, type, created_at FROM expenses
        WHERE user_id = ? AND group_id = ?`,
            [userId, groupId]
        )

        if (expenses.length === 0) return res.json({
            ok: false,
            data: {
                message: "no expenses in this group"
            }
        })
        return res.json({
            ok: true,
            data: expenses
        })


    } catch (error) {
        return res.status(500).json({
            ok: false,
            data: {
                message: "internal service error"
            }
        })
    }

}

export const getExpensesFromGroup = async (req, res) => {
    if (!req.session.user) return res.json({
        ok: false,
        data: {
            message: "invalid session"
        }
    })

    const groupId = req.params.id;
    const userId = req.session.user.userId;

    try {
        const [expenses] = await dbCollection.query(
            `SELECT amount, type, created_at, user_id FROM expenses
        WHERE group_id = ?`,
            [groupId]
        )

        if (expenses.length === 0) return res.json({
            ok: false,
            data: {
                message: "no expenses in this group"
            }
        })
        return res.json({
            ok: true,
            data: expenses
        })


    } catch (error) {
        return res.status(500).json({
            ok: false,
            data: {
                message: "internal service error"
            }
        })
    }

}