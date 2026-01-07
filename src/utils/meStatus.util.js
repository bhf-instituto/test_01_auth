export const meStatus = (req, res) => {

    if(!req.user) return res.json({
        ok: false,
        data: {
            message: "session expired"
        }
    });

    return res.json({
        ok: true,
        data: {
            user: {
                id_user : req.user.id_user,
                email : req.user.email
            }
        }
    });
};







