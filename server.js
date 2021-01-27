const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 3001;
const app= express();

// express middleware vvvvvv
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// connect to database
const db = new sqlite3.Database('./db/elections.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Connected to the election database.');
});

// // Delete a candidate
// db.run(`DELETE FROM candidates WHERE id = ?`, 1, function(err, result) {
//     if(err) {
//         console.log(err);
//     }
//     console.log(result, this, this.changes);
// });

// GET a single candidate
// db.get(`SELECT * FROM candidates WHERE id = 1`, (err, row) => {
//     if (err) {
//         console.log(err);
//     }
//     console.log(row);
// });

// create a candidate
const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected)
            VALUES (?,?,?,?)`;
const params = [1,'Ronald', 'Firbank', 1];
// ES5 function, not arrow function, to use this
db.run(sql, params, function(err, result) {
    if (err) {
        console.log(err);
    }
    console.log(result, this.lastID);
});

// returns all data from candidates table
// db.all(`SELECT * FROM candidates`, (err,rows) => {
//     console.log(rows);
// });

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