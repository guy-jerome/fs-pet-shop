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
            send500(err,res)
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
        send400(res)
      }

      if (data["name"] && parseInt(data["age"]) && data["kind"]){
        fs.readFile(petsPath, "utf8", function(err, petsJSON ) {
          if(err){
            send500(err,res)
          }else{
            const petData = JSON.parse(petsJSON)
            petData.push(data)
            fs.writeFile(petsPath, JSON.stringify(petData), function(err){
              if(err){
                send500(err)
              }else{
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data))
              }
            })
          }
        })
      }else{
        send400(res)
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
            send500(err,res)
          }
          else if(pets[index]){
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(pets[index]))
          }else{
            send404(res)
          }
      })
  }else{
    send404(res)
  }

})

server.listen(port, ()=>{
  console.log(`Server listening on localhost:${port}.`)
})


function send404(res){
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain");
  return res.end("NOT FOUND");
}

function send400(res){
  res.statusCode = 400;
  res.setHeader("Content-Type", "text/plain");
  return res.end("BAD REQUEST");
}

function send500(err,res){
  console.error(err.stack);
  res.statusCode = 500;
  res.setHeader("Content-Type", "text/plain");
  return res.end("Internal Server Error");
}

