import { faker } from "@faker-js/faker";
import methodOverride from "method-override";
import mysql from "mysql2/promise";
import express, { urlencoded } from "express";
const app = express();
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended : true}));
app.use(express.json())
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
    app.post('/add',async(req,res)=>{
        try{
            let id = faker.string.uuid();
            let arr = [[id,req.body.name,req.body.email,req.body.password]];
            await connection.query(`INSERT INTO user (id , name , email , password ) VALUES ?`,[arr]);
            let [result] = await connection.query(`SELECT * FROM user`);
            res.render('show',{arr : result});
        } catch(err){
            console.log(err);
        }
    })
    app.get('/show/:id/edit',async(req,res)=>{
        try{
            let {id} = req.params;
            let s = "";
            for(let i = 0;i<id.length;i++){
                if(id[i] == ' ')continue;
                else s+=id[i];
            }
            let [result] = await connection.query(`SELECT * FROM user WHERE id = ?`,[s]);
            console.log(result);
            res.render("edit",{data : result[0]});
        } catch(err) {
            console.log(err);
        }
    });
    app.patch('/show',async(req,res)=>{
        let arr = [req.body.name , req.body.email , req.body.id];
        await connection.query(`UPDATE user SET name = ? , email = ? WHERE id = ?`,[arr[0],arr[1],arr[2]])
        let [result] = await connection.query(`SELECT * FROM user`);
        res.render("show",{arr : result});
    });
} catch (err) {
  console.log(err);
}
}
main();