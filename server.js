const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const inputCheck = require('./utils/inputCheck');
const db = require('./db/database');
const apiRoutes = require('./routes/apiRoutes');

const PORT = process.env.PORT || 3001;
const app = express();

// express middleware vvvvvv
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// use apiRoutes
app.use('/api', apiRoutes);

// default response for any other request (not found) catch all
// NOTE: catch all routes must be placed below all other routes
// otherwise it will override them 
app.use((req, res) => {
    res.status(404).end();
})
// Start server after DB connection by wrapping listener in an event handler
db.on('open', () => {
    // function to start server -- must be at the bottom of the file
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    });
});