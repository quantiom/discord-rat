const express = require('express');
const app = express();
const port = process.env.PORT || 500;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
