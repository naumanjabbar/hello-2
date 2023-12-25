import express from "express";
import multer from 'multer';
import {
  deleteFile,
  editFile,
  getFiles,
  uploadFiles,
  downloadFile,
} from "../controller/file.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  },
});

const upload = multer({ storage });

router.get("/getfiles/:folderId", getFiles);
router.get("/download/:filename", downloadFile);
router.post("/createFiles", uploadFiles);
router.post("/uploadFiles", upload.single('file'), uploadFiles);
router.put("/editFile/:id", editFile);
router.delete("/deleteFile/:id", deleteFile);

export default router;
