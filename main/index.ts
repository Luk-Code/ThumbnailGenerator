import express from "express";
import sharp from "sharp";
import fileUpload from "express-fileupload";
const app = express();
const port= process.env.PORT || 3000;

//view engine
app.set("view engine","ejs");
app.set("views","main/sites");

//listen on port
app.listen(port, ()=>{
    console.log(`Listening on port ${port}...`)
});

//middleware
app.use(express.static("public"));
app.use(fileUpload({
    //useTempFiles:true,
    //tempFileDir:'main/files/'
}));

//api
app.get("/",(req,res)=>{
    res.render("index",{cssFile:"index.css"});
});
app.post("/upload",(req:any,res)=>{
    //let imageFile=req.files.image_file;
    //sharp(imageFile).resize(100).toFile("img100.png").then(r => console.log(r));

    res.render("upload",{cssFile:"index.css"});
});

app.use((req,res)=>{
    res.status(404).send("404 Not Found");
});

