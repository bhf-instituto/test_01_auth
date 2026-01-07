
export const ifSession = (req,res) => {

    if (!req.user) {
        return res.status(401).json({
            ok: false,
            data: {
                message: "access denied"
            }
        });
    } 
}
