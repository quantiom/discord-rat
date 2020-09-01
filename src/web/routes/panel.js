module.exports = (app) => {
    app.get('/clients', (req, res) => {
        res.render('test', { app });
    });
};
