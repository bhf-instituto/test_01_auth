export const me = (req, res) => {
    if(!req.session.user) return res.json({
        ok: false,
        data: {
            message: "session expired"
        }
    });

    return res.json({
        ok: true,
        data: {
            userId: req.session.user.userId
        }
    });
};







