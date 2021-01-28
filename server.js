const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const inputCheck = require('./utils/inputCheck');

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
//==============================candidate routes=======================
// Delete a candidate
app.delete('/api/candidate/:id', (req,res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
        if(err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'successfully deleted',
            changes: this.changes
        });
    });
});

// GET a single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
        AS party_name 
        FROM candidates
        LEFT JOIN parties
        ON candidates.party_id = parties.id
        WHERE candidates.id = ?`;
     const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// create a candidate
app.post('/api/candidate', ({body}, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
                VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    // ES5 function, not arrow function, to use this
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
});

// get all candidates
app.get('/api/candidates', (req, res) => {
    // set SQL query to SQL variable
    const sql = `SELECT candidates.*, parties.name
        AS party_name 
        FROM candidates
        LEFT JOIN parties
        ON candidates.party_id = parties.id`;
    // params is an empty array here because there are no
    // placeholders in the sql statement
    const params = [];
    //returns all data from candidates table
    db.all(sql, params, (err,rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// UPDATE a candidates party
app.put('/api/candidate/:id', (req, res) =>{
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
    res.status(400).json({ error: errors });
    return;
    }

    const sql = `UPDATE candidates SET party_id = ?
                WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];

    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: req.body,
            changes: this.changes
        });
    });
});

//====================================PARTY ROUTES=========================
// route to display all parties
app.get('/api/parties', (req,res) => {
    const sql = `SELECT * FROM parties`;
    const params = [];
    db.all(sql, params, (err,rows) => {
        if (err) {
        res.status(500).json({ error: err.message });
        return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// return party by id
app.get('/api/party/:id', (req,res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err,row) => {
        if (err) {
            res.status(400).json({ error: err.message})
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// route to delete parties 
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'successfully deleted',
            changes: this.changes
        });
    });
});

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