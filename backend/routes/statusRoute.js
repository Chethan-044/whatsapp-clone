const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");
const { multerMiddleware } = require("../config/cloudinary.js");
const chatController = require("../controllers/chatController.js")
const statusController = require("../controllers/statusController.js")


const router = express.Router();

router.post("/",authMiddleware,multerMiddleware, statusController.sendMessage);
router.get("/",authMiddleware, statusController.getStatus);

router.put("/:statusId/view",authMiddleware, statusController.viewStatus);
router.delete("/:statusId",authMiddleware, statusController.deleteStatus);



module.exports = router;
