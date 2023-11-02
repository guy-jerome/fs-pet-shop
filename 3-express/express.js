import express from "express"
import fs from 'fs/promises';

const PET_JSON_URL = "../pets.json"

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req,res)=>{
  res.send("Hello")
});

app.get('/pets', (req, res, next) => {
  fs.readFile(PET_JSON_URL, 'utf8')
    .then(data => {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    })
    .catch(error => {
      next(error)
    });
});

app.post('/pets', (req, res, next) =>{
  let data = req.body
  if (data["name"] && parseInt(data["age"]) && data["kind"] && Object.keys(data).length === 3){
    fs.readFile(PET_JSON_URL, 'utf8')
      .then(pets =>{
        const jsonData = JSON.parse(pets)
        jsonData.push(data)
        return fs.writeFile(PET_JSON_URL, JSON.stringify(jsonData))
      })
      .then(()=>{
        res.send(data)
      })
      .catch(error => {
        next(error)
      });
  }else{
    res.status(400).send("<h1>400 Bad Request</h1>")
  }
})

app.get('/pets/:id', (req, res, next) => {
  fs.readFile(PET_JSON_URL, 'utf8')
    .then(data => {
      const jsonData = JSON.parse(data);
      jsonData[parseInt(req.params.id)]? res.send(jsonData[parseInt(req.params.id)]):res.status(404).send("<h1>404 Not Found</h1>")
    })
    .catch(error => {
      next(error)
    });
});

app.get('*', (req,res)=>{
  res.send("<h1>404 Not Found</h1>")
})

app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).send('<h1>500 Internal Error</h1>'); 
});

app.listen(port, ()=>{
  console.log("Server Running on Port", port)
})


