exports.get404Page = async (req, res, next) => {
    res.render('pages/404', { pageTitle: "404 Error" });
}
