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
    const {username, password} = req.body;
    const sql = "SELECT id, password FROM users WHERE username = ?";
    con.query(sql, [username], function(err, results) {
        if(err) {
            return res.status(500).send("Database server error"+ err.message);
        }
        if(results.length != 1) {
            return res.status(401).send("Wrong username");
        }
        // compare passwords
        bcrypt.compare(password, results[0].password, function(err, same) {
            if(err) {
                return res.status(500).send("Hashing error");   
            }
            if(same) {
                return res.send("Login OK");
            }
            return res.status(401).send("Wrong password");
        });
    })
});

app.get("/Expense", (req, res) => {
    const sql = "SELECT * FROM expense";
    con.query(sql, (err, results) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.json(results);
    });
});

app.get("/ExpenseToday", (req, res) => {
    const sql = "SELECT * FROM expense WHERE DATE(date) = CURDATE()";
    con.query(sql, (err, results) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.json(results);
    });
});

app.get("/SearchExpense", (req, res) => {
    const keyword = "%${req.query.q || ''}%";
    const sql = "SELECT * FROM expense WHERE item LIKE ?";
    con.query(sql, [keyword], (err, results) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.json(results);
    });
});
app.post("/AddnewExpense", (req, res) => {
    const { item, paid, date } = req.body;
    const sql = "INSERT INTO expense (item, paid, date) VALUES (?, ?, ?)";
    con.query(sql, [item, paid, date], (err, result) => {
        if (err) return res.status(500).send("DB error: " + err.message);
        res.send("Expense added!");
    });
});

app.delete("/DeleteAnExpense",(req,res)=>{
    
})

// ---------- Server starts here ---------
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at ' + PORT);
});

