const getIndex = (req, res) => {
// console.log(req)
    const { user } = req.session;
    res.render('index', user)
}

export default getIndex;