import express from "express"
import pg from "pg"
import dotenv from "dotenv"

const port = process.env.port || 3000;
const app = express();



dotenv.config({path: '../.env'})

//Pool for the local host
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'petshop',
  password: process.env.PG_PASS,
  port: 5432
})

app.use(express.static('public'))
app.use(express.json())
//GET ALL 
app.get('/pets', async (req,res)=>{
  const client = await pool.connect();
  try{
    const result = await client.query('SELECT * FROM pets',[])
    res.json(result.rows)
  }
  catch (err) {
    res.status(500).send(err)
  }
  finally{
    client.release();
  }
  
})
//GET ONE
app.get('/pets/:id', async (req,res)=>{
  const client = await pool.connect();
  try{
    const result = await client.query('SELECT * FROM pets WHERE id = $1;',[req.params.id])
    res.json(result.rows)
  }
  catch (err) {
    res.status(500).send(err)
  }
  finally{
    client.release();
  }
})
//CREATE ONE
app.post('/pets', async (req,res)=>{
  const client = await pool.connect();
  const {age,kind,name} = req.body
  try{
    const result = await client.query('INSERT INTO pets (age,kind,name) VALUES ($1,$2,$3)',[age,kind,name])
    res.json(req.body)
  }
  catch (err) {
    res.status(500).send(err)
  }
  finally{
    client.release();
  }
})
//UPDATE ONE
app.put('/pets/:id', async (req,res)=>{
  const client = await pool.connect();
  const {age,kind,name} = req.body
  try{
    const result = await client.query('UPDATE pets SET age = $1, kind = $2, name = $3 WHERE id = $4',[age,kind,name,req.params.id])
    res.json(req.body)
  }
  catch (err) {
    res.status(500).send(err)
  }
  finally{
    client.release();
  }
  
})
//DELETE
app.delete('/pets/:id', async (req,res)=>{
  const client = await pool.connect();
  try{
    const result = await client.query('DELETE FROM pets WHERE id = $1;',[req.params.id])
    res.json(result.rows)
  }
  catch (err) {
    res.status(500).send(err)
  }
  finally{
    client.release();
  }
})

app.listen(port, ()=>{
  console.log("Server Running on port:", port)
})