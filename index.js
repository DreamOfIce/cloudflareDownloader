const express = require('express');
const cloudflareScraper = require('cloudflare-scraper');
const path = require('path');
const app = express();
app.get('/api/*', (req, res) => {
    const link = req.url.slice(5);
    cloudflareScraper.get(link, { encoding: null }).then((body) => {
        res.status(200).send(body).end();
    }).catch((err) => {
        console.error(err.message);
        res.status(500).json({ 'code': 500, 'message': err.message });
    })
})

app.use('/', express.static(path.join(__dirname, 'public')))
app.listen(process.env.PORT || 8080, () => {
    console.log(`Start running on port ${process.env.PORT || 8080}`);
});
