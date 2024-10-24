const express = require('express');
const db = require('./config/db');
const userRoutes = require('./routes/UserRoutes');

const app = express();

// parse body
app.use(express.json());

const PORT = 8080;

app.use("/api/user", userRoutes);

app.get('/', async (req, res) => {
    return res.json({ message: "App Root" });
})

app.listen(PORT, () => {
    console.log(`App Server is listerning at http://localhost:${PORT}`)
});