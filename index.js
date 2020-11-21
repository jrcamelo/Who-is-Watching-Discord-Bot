const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => res.send('Watching you.'));
app.listen(port, () => console.log(`Staying alive at http://localhost:${port}`));

const Bot = require("./Bot/Bot")
Bot.initialize()

