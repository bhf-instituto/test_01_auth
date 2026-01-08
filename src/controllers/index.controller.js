const getIndex = (req, res) => {
    
    if (!req.user) {
        return res.status(200).json({
            ok: false,
            data: {
                message: "no hay usuario"
            }
        });
    }

    const { user } = req;

    return res.status(200).json({
        ok: true, 
        data: {
            user : {
                id_user : user.id_user
            }
        }
    })
}

export default getIndex;