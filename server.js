const con = require('./db');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// password generator
app.get('/password/:pass', (req, res) => {
    const password = req.params.pass;
    bcrypt.hash(password, 10, function(err, hash) {
        if(err) {
            return res.status(500).send('Hashing error');
        }
        res.send(hash);
    });
});

// login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT id, password FROM users WHERE username = ?";
    con.query(sql, [username], function(err, results) {
        if(err) {
            return res.status(500).send("Database server error: " + err.message);
        }
        if(results.length != 1) {
            return res.status(401).send("Wrong username");
        }
        bcrypt.compare(password, results[0].password, function(err, same) {
            if(err) {
                return res.status(500).send("Hashing error");
            }
            if(same) {
                // ✅ ส่ง userId กลับไปด้วย
                return res.json({ message: "Login OK", userId: results[0].id });
            }
            return res.status(401).send("Wrong password");
        });
    })
});

// get all expenses
app.get("/Expense", (req, res) => {
    const sql = "SELECT * FROM expense";
    con.query(sql, (err, results) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.json(results);
    });
});

// get today's expenses
app.get("/ExpenseToday", (req, res) => {
    const sql = "SELECT * FROM expense WHERE DATE(date) = CURDATE()";
    con.query(sql, (err, results) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.json(results);
    });
});

// search expenses
app.get("/SearchExpense", (req, res) => {
    const keyword = `%${req.query.q || ''}%`;
    const sql = "SELECT * FROM expense WHERE item LIKE ?";
    con.query(sql, [keyword], (err, results) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.json(results);
    });
});

// add new expense
app.post("/AddnewExpense", (req, res) => {
    const { item, paid, date, user_id } = req.body;
    const sql = "INSERT INTO expense (item, paid, date, user_id) VALUES (?, ?, ?, ?)";
    con.query(sql, [item, paid, date, user_id], (err, result) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.send("Expense added!");
    });
});

// delete expense
app.delete("/DeleteAnExpense/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM expense WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.send("Expense deleted!");
    });
});

// ---------- Server starts here ---------
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});