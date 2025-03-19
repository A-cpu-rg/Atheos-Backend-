// const express = require("express");
// const router  = express.Router();
// const StoreEmployeeController = require("../controller/StoreEm")

// const multer = require("multer")
// const fs = require("fs")
// const path = require("path")

// const storeDir = path.join(__dirname,"../Public/StoreEm");

// if (!fs.existsSync(storeDir)){
//     fs.mkdirSync(storeDir , {recursive :true});
// }

// var storage = multer.diskStorage({
//     destination : function (req , file  , cb){
//         if(!fs.existsSync(storeDir)){
//             fs.mkdirSync(storeDir, {recursive:true});
//         }
//         cb(null , storeDir);
//     },
//     filename : function(req,file , cb){
//         cb(null , Date.now() + path.extname(file.originalname));
//     },
// });

// const upload = multer({storage : storage})


// router.post("/addStoreEmployee",upload.single("ProfilePhoto"),StoreEmployeeController.addStoreEmployee);
// router.get("/getStoreEmployee",StoreEmployeeController.getStoreEmployee);
// router.put("/StoreEmployee/:id",upload.single("ProfilePhoto"),StoreEmployeeController.updateStoreEmployee)
// router.delete('/StoreEmployee/:id',StoreEmployeeController.deleteStoreEmployee)

// module.exports=router;