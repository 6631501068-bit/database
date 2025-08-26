const mysql = require("mysql2");
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "expenses",
});
con.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("DB connected successfully");
  }
});
module.exports = con;