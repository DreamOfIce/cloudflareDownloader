const express = require('express');
const cloudflareScraper = require('cloudflare-scraper');
const path = require('path');
const app = express();
app.get('/api/*', (req, res) => {
    const link = req.url.slice(5);
    cloudflareScraper.get(link, { encoding: null }).then((body) => {
        res.status(200).send(body).end();
    }).catch((err) => {
        res.status(500).json({ 'status': err, 'message': err });
    })
})

app.use('/', express.static(path.join(__dirname, public)))
app.listen(process.env.PORT || 8080);
