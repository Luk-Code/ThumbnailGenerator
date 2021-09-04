import express from "express";
import path from "path";
import {v1 as uuidv1} from "uuid";
import fs from "fs";
const app = express();
const port = process.env.PORT || 3000;
const upload = require("./routers/upload");

//view engine
app.set("view engine","ejs");
app.set("views","main/sites");

//listen on port
app.listen(port, ()=>{
    console.log(`Listening on port ${port}...`)
});

//middleware
app.use(express.static("public"));
app.use('/upload', express.static("public"));
app.use(express.urlencoded({extended: true}));

//update
app.use('/upload',upload);

//const
const user_uuid:string=uuidv1().split('-').splice(1).join('-');
const pathToUserImages:string=path.join("public","images",user_uuid);

//api
app.get("/",(req,res)=>{
    if(fs.existsSync(pathToUserImages)){
        fs.readdir(pathToUserImages,(err,files)=>{
            res.render("index",{
                cssFile:"index.css",
                files,
                path:path.join("images",user_uuid)
            });
        });
    }else{
        res.render("index",{
            cssFile:"index.css"
        });
    }
});

app.use((req,res)=>{
    res.status(404).render("error",{cssFile:"error.css",error:404});
});

