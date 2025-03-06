const express = require("express")
const router = express.Router()

const EmployeeController = require("../controller/Employee")

const multer = require("multer")
const fs = require("fs")
const path = require("path") 

const storeDir = path.join(__dirname  ,"../Public/Employee");

if(!fs.existsSync(storeDir)){
    fs.mkdirSync(storeDir , {recursive : true})
}

var storage = multer .diskStorage({
    destination : function(req,file , cb ){
        if(!fs.existsSync(storeDir)){
            fs.mkdirSync(storeDir ,{recursive : true})
        }
        cb (null , storeDir);
    },
    filename : function(req, file , cb){
        cb(null , Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({storage: storage})

router.delete("/Employee/:id",EmployeeController.deleteEmployee)
router.put("/Employee/:id",upload.single("ProfilePhoto"),EmployeeController.updateEmployee)
router.get("/getEmployee",EmployeeController.getEmployee)
router.post("/addEmployee",upload.single("ProfilePhoto"),EmployeeController.addEmployee)
module.exports=router