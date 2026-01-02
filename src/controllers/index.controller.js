const getIndex = (req, res) => {

    const { user } = req.session;
    res.render('index', user)
}

export default getIndex;