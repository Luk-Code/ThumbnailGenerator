import fileUpload from "express-fileupload";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import sizeOf from "image-size";
import express from "express";
import {v1 as uuidv1, v4 as uuidv4} from "uuid";
import cookieParser from "cookie-parser";
//const
const router = express.Router();
//const user_uuid:string=uuidv1().split('-').splice(1).join('-');
const cookieMaxAge=365*24*60*60*1000;//365 days

//middleware
router.use(fileUpload({
    /*useTempFiles:true,
    tempFileDir:'tmp/',
    uploadTimeout:60,*/
    createParentPath:true,
    debug:false
}));
router.use(cookieParser());

//let
let user_uuid:string;
let pathToUserImages:string;

//cookie
router.use((req,res,next)=>{
    console.log("upload",req.cookies);
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

router.post("",async (req: any, res) => {
    if(!req.files) {
        res.status(400).render("error",{
            cssFile:"error.css",error:400,message:"400 No file uploaded"});
        return;
    }
    let imageFile: fileUpload.UploadedFile = req.files.image_file;
    if(req.files.image_file.mimetype!=="image/jpeg" && req.files.image_file.mimetype!=="image/png"){
        res.status(400).render("error",{
            cssFile:"error.css",error:400,message:"400 File isn't a image"});
        return;
    }
    let imageFileName: string = imageFile.name;
    let imageFileNameBase: string = imageFileName.split('.')[0];
    let localImagePath: string = path.join(pathToUserImages, imageFileNameBase);
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
router.get("/:fileName",(req,res)=>{
    let imageFileName=req.params.fileName;
    let pathToFile=path.join("images",user_uuid,imageFileName);
    if(fs.existsSync(path.join("public",pathToFile))){
        let originWidth=sizeOf(path.join(pathToUserImages,imageFileName,"origin.png")).width as number;
        let originHeight=sizeOf(path.join(pathToUserImages,imageFileName,"origin.png")).height as number;
        let imgHeight={
            img100:Math.round((100/originWidth)*originHeight),
            img200:Math.round((200/originWidth)*originHeight),
            img400:Math.round((400/originWidth)*originHeight)
        }
        res.render("upload",{
            cssFile:"upload.css",
            path:pathToFile,
            imageFileName,
            imgHeight
        });
    }else{
        res.status(502).render("error",{cssFile:"error.css",error:502});
    }
});

module.exports=router;