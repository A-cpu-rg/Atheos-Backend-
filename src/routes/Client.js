const express = require("express")
const ClientController = require("../controller/Client")

const router = express.Router()


const multer = require("multer")

const fs = require("fs")
const path = require("path")


const storeDir = path.join(__dirname,"../Public/Client");

if(!fs.existsSync(storeDir)){
    fs.mkdirSync(storeDir , {recursive : true})
}

var storage = multer .diskStorage({
    destination : function(req , file , cb){
        if(!fs.existsSync(storeDir)){
            fs.mkdirSync(storeDir  ,{recursive : true})

        }
        cb (null , storeDir);
    },
    filename : function(req , file , cb){
        cb(null , Date.now() + path.extname(file.originalname));
    },
    
});

const upload = multer({storage:storage})

router.post("/addClient",upload.single("profilePhoto"),ClientController.addClient);
router.get("/getClient",ClientController.getClient)
router.put("/Client/:id",upload.single("profilePhoto"),ClientController.updateClient)

module.exports=router  
