module.exports = (app) => {
    app.get('/clients', (req, res) => {
        res.render('clients', { app });
    });
};
