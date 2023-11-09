import express from "express"
import pg from "pg"
import dotenv from "dotenv"

const port = process.env.port || 3000;
const app = express();

dotenv.config()

const pool = new pg.Pool({
  user: 'postgres'
  host: 'localhost'
  database: 'petshop'
  password: process.env.PG_PASS,
  port: 5432
})


app.listen(port, ()=>{
  console.log("Server Running on port:", port)
})