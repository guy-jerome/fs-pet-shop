import express from "express"
import pg from "pg"
import dotenv from "dotenv"

const port = process.env.port || 3000;
const app = express();

function verifyBody(req,res,next){
  const {age, kind, name} = req.body
  if(parseInt(age) && kind && name){
    next()
  }else{
    res.status(400).json({error:"Bad Request"})
  }
}

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
    const result = await client.query('SELECT * FROM pets')
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
app.get('/pets/:id', async (req,res,next)=>{
  const client = await pool.connect();
  try{
    const result = await client.query('SELECT * FROM pets WHERE id = $1;',[req.params.id])
    if (result.rows < 1){
      return res.status(400).json({error:"Bad Request"})
    }
    res.status(200).json(result.rows)
  }
  catch (err) {
    next(err)
  }
  finally{
    client.release();
  }
})
//CREATE ONE
app.post('/pets',verifyBody, async (req,res,next)=>{
  console.log(req.body)
  const client = await pool.connect();
  const {age,kind,name} = req.body
  try{
    const result = await client.query('INSERT INTO pets (age,kind,name) VALUES ($1,$2,$3) RETURNING *;',[age,kind,name])
    res.status(201).json(result.rows)
  }
  catch (err) {
    next(err)
  }
  finally{
    client.release();
  }
})
//UPDATE ONE
app.put('/pets/:id',verifyBody, async (req,res,next)=>{
  const client = await pool.connect();
  const {age,kind,name} = req.body
  try{
    const result = await client.query('UPDATE pets SET age = $1, kind = $2, name = $3 WHERE id = $4 RETURNING *;',[age,kind,name,req.params.id])
    if (result.rows < 1){
      return res.status(400).json({error:"Bad Request"})
    }
    res.status(200).json(result.rows)
  }
  catch (err) {
    next(err)
  }
  finally{
    client.release();
  }
  
})
//DELETE
app.delete('/pets/:id', async (req,res,next)=>{
  const client = await pool.connect();
  try{
    const result = await client.query('DELETE FROM pets WHERE id = $1 RETURNING *;',[req.params.id])
    if (result.rows < 1){
      return res.status(400).json({error:"Bad Request"})
    }
    res.status(200).json(result.rows)
  }
  catch (err) {
    next(err)
  }
  finally{
    client.release();
  }
})

app.use((req,res)=>{
  res.status(404).json({error: "Resource Not Found"})
})

app.use((err,req,res)=>{
  console.log(err)
  res.status(500).json({error: "Internal Error"})
})

app.listen(port, ()=>{
  console.log("Server Running on port:", port)
})