const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files from 'public' folder
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});