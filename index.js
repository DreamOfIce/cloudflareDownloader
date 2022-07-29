const express = require('express');
const axios = require('./scraper/index');
const path = require('path');
const app = express();

//load env
require('dotenv').config()
app.get('/api/*', (req, res) => {
    const link = req.url.slice(5);
    axios.get(link, {
        responseType: 'stream',
    }).then((response) => {
        //res.set('Content-Type', 'application/octet-stream').status(200).send(response.data); return;
        const stream = response.data;
        stream.on('data', (data) => {
            res.write(data);
        })
        stream.on('end', () => {
            res.status(response.status).end();
        })
    }).catch((err) => {
        console.error(err.message);
        res.status(500).json({ 'code': 500, 'message': err.message });
    })
})

app.use('/', express.static(path.join(__dirname, 'public')))
app.listen(process.env.PORT || 8080, () => {
    console.log(`Start running on port ${process.env.PORT || 8080}`);
});
