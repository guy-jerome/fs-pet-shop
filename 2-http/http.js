import fs from "fs"
import path from "path"
import http from "http"
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let petsPath = path.join(__dirname, "..", "pets.json")

const port = process.env.PORT || 9001


const petRegExp = /^\/pets\/(.*)$/;



const server = http.createServer((req,res)=>{


  if(req.method === "GET" && req.url === "/pets") {
      fs.readFile(petsPath, "utf8", function(err, petsJSON ) {
          if(err) {
              console.error(err.stack);
              res.statusCode = 500;
              res.setHeader("Content-Type", "text/plain");
              return res.end("Internal Server Error");
          }
          res.setHeader("Content-Type", "application/json");
          res.end(petsJSON)
      })
  }
  else if(req.method === "POST" && req.url === "/pets"){

    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    })
    req.on('end', ()=>{
      let data = {}
      try{
        data = JSON.parse(body)
      }catch{
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/plain");
        return res.end("BAD REQUEST can't parse");
      }

      if (data["name"] && parseInt(data["age"]) && data["kind"]){
        fs.readFile(petsPath, "utf8", function(err, petsJSON ) {
          if(err){
              console.error(err.stack);
              res.statusCode = 500;
              res.setHeader("Content-Type", "text/plain");
              return res.end("Internal Server Error");
          }else{
            const petData = JSON.parse(petsJSON)
            petData.push(data)
            fs.writeFile(petsPath, JSON.stringify(petData), function(err){
              if(err){
                console.error(err.stack);
                res.statusCode = 500;
                res.setHeader("Content-Type", "text/plain");
                return res.end("Internal Server Error");
              }else{
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data))
              }
            })
          }
        })
      }else{
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/plain");
        return res.end("BAD REQUEST");
      }
    })
  }
  else if(req.method === "GET" && petRegExp.test(req.url)) {

      const fullUrl = `http://${req.headers.host}${req.url}`;
      const url = new URL(fullUrl);
      const index = parseInt(url.pathname.split('/')[2])

      fs.readFile(petsPath, "utf8",  function(err, petsJSON) {
          const pets = JSON.parse(petsJSON)
          if(err) {
            console.error(err.stack);
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain");
            return res.end("Internal Server Error");
          }
          else if(pets[index]){
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(pets[index]))
          }else{
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            return res.end("NOT FOUND");
          }
      })
  }else{
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    return res.end("NOT FOUND");
  }

})

server.listen(port, ()=>{
  console.log(`Server listening on localhost:${port}.`)
})

