import { faker } from "@faker-js/faker";
import mysql from "mysql2/promise";
import express from "express";
const app = express();
app.set("view engine","ejs");
async function main() {
function createRandomUser() {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
}

let data = [];
for (let i = 1; i <= 100; i++) {
  data.push(createRandomUser());
}
try {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "temp_app",
    password: "root",
  });
  await connection.query("USE temp_app");
  await connection.query(`DROP TABLE IF EXISTS user`);
  await connection.query(`CREATE TABLE IF NOT EXISTS user(
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(50),
        email VARCHAR(100),
        password VARCHAR(50)
        );`);
  await connection.query(
    `INSERT INTO user (id , name , email , password ) VALUES ?`,
    [data]
    );
    app.listen(8080,()=>{
        console.log("Listening at port 8080");
    });
    app.get('/',async(req,res)=>{
        try{
        let [result] = await connection.query(`SELECT COUNT(*) FROM user`);
        res.render("home",{count : result[0]['COUNT(*)']});
        } catch(err){
            console.log(err);
        }
    })
    app.get('/show',async(req,res)=>{
        try {
            let [result] = await connection.query(`SELECT * FROM user`);
            res.render("show",{arr : result});
        } catch (error) {
            console.log(error);
        }
    })
    app.get('/add',async(req,res)=>{
        res.render("add");
    })
} catch (err) {
  console.log(err);
}
}
main();