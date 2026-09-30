const express = require('express');
const app = express();
const PORT = 3010;


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, () => {
    console.log(`Example app listening on port http://localhost:${PORT}`)
})