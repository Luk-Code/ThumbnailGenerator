import express from "express";
import path from "path";
import sharp from "sharp";
import fileUpload from "express-fileupload";
import {v1 as uuidv1} from "uuid";
import fs from "fs";
const app = express();
const port = process.env.PORT || 3000;

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
app.use(fileUpload({
    /*useTempFiles:true,
    tempFileDir:'tmp/',
    uploadTimeout:60,*/
    createParentPath:true,
    debug:false
}));

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
        res.render("index",{cssFile:"index.css"});
    }
});
app.post("/upload",async (req: any, res) => {
    let imageFile: fileUpload.UploadedFile = req.files.image_file;
    let imageFileName: string = imageFile.name;
    let imageFileNameBase: string = imageFileName.split('.')[0];
    let localImagePath:string = path.join(pathToUserImages, imageFileNameBase);
    await imageFile.mv(path.join(localImagePath, imageFileName))
        .then(() => console.log("upload success")).catch(err => console.log("upload error: ", err));
    //change to png
    await sharp(path.join(localImagePath, imageFileName))
        .toFormat("png").png().toFile(path.join(localImagePath, "origin.png"))
        .then(() => console.log("change to png success")).catch(err => console.log("change to png error: ", err));
    //sharp 100
    sharp(path.join(localImagePath, "origin.png")).resize(100, null)
        .toFormat("png").png().toFile(path.join(localImagePath, "img100.png"))
        .then(() => console.log("sharp 100 success")).catch(err => console.log("sharp 100 error: ", err));
    //sharp 200
    sharp(path.join(localImagePath, "origin.png")).resize(200, null)
        .toFormat("png").png().toFile(path.join(localImagePath, "img200.png"))
        .then(() => console.log("sharp 200 success")).catch(err => console.log("sharp 200 error: ", err));
    //sharp 400
    sharp(path.join(localImagePath, "origin.png")).resize(400, null)
        .toFormat("png").png().toFile(path.join(localImagePath, "img400.png"))
        .then(() => console.log("sharp 400 success")).catch(err => console.log("sharp 400 error: ", err));

    console.log("redirect");
    res.redirect(`/upload/${imageFileNameBase}`);
});
app.get("/upload/:fileName",(req,res)=>{
    let imageFileName=req.params.fileName;
    let pathToFile=path.join("images",user_uuid,imageFileName);
    if(fs.existsSync(path.join("public",pathToFile))){
        res.render("upload",{
            cssFile:"index.css",
            path:pathToFile,
            imageFileName
        });
    }else{
        res.status(502).render("502",{cssFile:"index.css"});
    }
});

app.use((req,res)=>{
    res.status(404).render("404",{cssFile:"index.css"});
});

