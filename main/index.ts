import express from "express";
import path from "path";
import {v1 as uuidv1, v4 as uuidv4} from "uuid";
import fs from "fs";
import cookieParser from "cookie-parser";
const app = express();
//const
const port = process.env.PORT || 3000;
const upload = require("./routers/upload");
//const user_uuid:string=uuidv1().split('-').splice(1).join('-');
const cookieMaxAge=365*24*60*60*1000;//365 days

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
app.use(cookieParser());

//update
app.use('/upload',upload);

//let
let user_uuid:string;
let pathToUserImages:string;

//cookie
app.use((req,res,next)=>{
    console.log("index",req.cookies);
    if(!req.cookies["userId"]){
        let temp_uuid:string=uuidv4();
        res.cookie("userId",temp_uuid,{maxAge:cookieMaxAge});
        user_uuid=temp_uuid;
    }else{
        user_uuid=req.cookies["userId"];
    }
    console.log("user_uuid",user_uuid);
    pathToUserImages=path.join("public","images",user_uuid);
    console.log("pathToUserImages",pathToUserImages);
    next();
});

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

