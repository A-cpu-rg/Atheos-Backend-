const express = require("express");
const router = express.Router();

const ComplaintController = require("../controller/Complaint")

router.post("/addComplaint" , ComplaintController.addComplaint);
router.get("/getComplaint" , ComplaintController.getComplaint)
module.exports = router