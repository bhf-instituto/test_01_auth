const getIndex = (req, res) => {
    const { user } = req.session;

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