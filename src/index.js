const express = require('express');
const app = express();
const port = process.env.PORT || 500;
const logger = require('./util/logger');

app.listen(port, () => {
    logger.info(`App listening on http://localhost:${port}`);
});
