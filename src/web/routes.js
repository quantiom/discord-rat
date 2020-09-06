const logger = require('../util/logger');
const fs = require('fs');

module.exports = (app) => {
    /*fs.readdirSync(__dirname + '/./routes').forEach((file) => {
        const stat = fs.lstatSync(__dirname + '/./routes/' + file);

        if (file.toLowerCase().indexOf('.js') && !stat.isDirectory()) {
            require(__dirname + '/./routes/' + file)(app);
            logger.info(`Registered ${file.split('.js')[0]} route.`);
        }
    });*/

    app.use('/panel', require('./routes/panel')(app));
    app.use('/api', require('./routes/panel-api')(app));
    require('./routes/client-api')(app); // no router
};
