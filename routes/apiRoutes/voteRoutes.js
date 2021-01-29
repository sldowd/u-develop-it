const express = require('express');
const db = require('../../db/database');
const router = express.Router();
const inputCheck = require('../../utils/inputCheck');

router.post('/vote', ({body}, res) => {
    const errors = inputCheck(body, 'voter_id', 'candidate_id');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `INSERT INTO votes (voter_id, candidate_id) 
                VALUES (?,?)`
    const params = [body.voter_id, body.candidate_id]
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

module.exports = router;