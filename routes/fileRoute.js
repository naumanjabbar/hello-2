import express from "express";
import multer from "multer";
import fs from "fs";
import { Folder } from "../model/folder.js";
import {
  deleteFile,
  editFile,
  getFiles,
  uploadFiles,
  downloadFile,
} from "../controller/file.js";

const router = express.Router();

async function wait() {
  return new Promise((resolve, reject) => {
    resolve();
  }, 100);
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await wait();
    // console.log("type==>", req.body);
    const folder = await Folder.findById(req.body.folderId);

    if (folder?.folderName) {
      req.folderName = folder.folderName;
      const directoryPath = "uploads/" + folder.folderName;
      fs.mkdir(directoryPath, { recursive: true }, (err) => {
        if (err) {
          // console.error("Error creating directory:", err);
        } else {
          // console.log("Directory created successfully.");
        }
      });
      cb(null, `uploads/${req.folderName}`);
    } else {
      cb(null, `uploads`);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.get("/getfiles/:folderId", getFiles);
router.get("/download/:filename", downloadFile);
router.post("/createFiles", uploadFiles);
router.post("/uploadFiles", upload.single("file"), uploadFiles);
router.put("/editFile/:id", editFile);
router.delete("/deleteFile/:id", deleteFile);

export default router;
