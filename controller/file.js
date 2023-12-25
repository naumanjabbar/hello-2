import { File } from "../model/file.js";
import crypto from "crypto";
import fs from "fs";

export const getFiles = async (req, res) => {
  try {
    const files = await File.find({ folderId: req.params.folderId });
    if (files) {
      return res.status(200).json(files);
    } else {
      return res.status(500).json("Folder has not been created");
    }
  } catch (error) {}
};

// export const uploadFiles = async (req, res) => {
//   try {
//     const { file, fileName, folderId } = req.body;

//     if (file === null || fileName === null || folderId === null)
//       return res.status(500).json("value is null");

//     const newFile = new File({ file, fileName, folderId });
//     const fileData = await newFile.save();
//     res.status(200).json(fileData);
//   } catch (error) {
//     console.log(error);
//   }
// };

export const uploadFiles = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { originalname } = req.file;
  const { folderId, encrypt } = req.body;

  try {
    // const iv = crypto.randomBytes(16);
    // // Save filename and folderId to the database

    // res
    //   .status(200)
    //   .json({ message: "File uploaded and filename saved to the database" });

    if (encrypt) {
      const iv = crypto.randomBytes(16);
      const key = crypto.randomBytes(32);

      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      const input = fs.createReadStream(`uploads/${originalname}`);
      const output = fs.createWriteStream(`uploads/${originalname}.enc`);
      input.pipe(cipher).pipe(output);

      // Save filename, folderId, and IV to the database
      const newFile = new File({
        fileName: `${originalname}.enc`,
        folderId,
        iv: iv.toString("hex"),
        key: key.toString("hex"),
      });
      console.log("here 6");

      await newFile.save();
    } else {
      const newFile = new File({ fileName: originalname, folderId });
      await newFile.save();
    }

    res
      .status(200)
      .json({ message: "File uploaded and filename saved to the database" });
  } catch (error) {
    console.error("Error saving filename to the database", error);
    res
      .status(500)
      .json({ message: error?.message || "Internal server error" });
  }
};

export const editFile = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteFolder = await File.findByIdAndDelete(id);

    if (!deleteFolder) return res.status(500).json("File not found");

    res.status(200).json(deleteFolder);
  } catch (error) {
    console.log(error);
  }
};

export const downloadFile = async (req, res) => {
  // try {
  // const { filename } = req.params;
  //   const filePath = `uploads/${filename}`;
  //   res.download(filePath);
  // } catch (error) {
  //   return res.status(500).json("File not found");
  // }

  const { filename } = req.params;
  const { decrypt } = req.query;
  
  try {
    if (decrypt?.toLowerCase() === 'true') {
      const encryptedFile = await File.findOne({ fileName: filename });
      const iv = Buffer.from(encryptedFile.iv, "hex");
      const key = Buffer.from(encryptedFile.key, "hex");
      // Decrypt the file using AES-256-CBC algorithm
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      const encryptedFilePath = `uploads/${filename}`;
      const decryptedFilePath = `uploads/${filename.replace(".enc", "")}`;
      const input = fs.createReadStream(encryptedFilePath);
      const output = fs.createWriteStream(decryptedFilePath);
      input.pipe(decipher).pipe(output);
      // Send the decrypted file for download
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename.replace(".enc", "")}`
      );
      console.log({ decryptedFilePath });
      // res.sendFile(decryptedFilePath, () => {
      //   // Clean up: remove the decrypted file after it's sent
      //   // fs.unlinkSync(decryptedFilePath);
      // });
      res.download(decryptedFilePath);
    } else {
      const filePath = `uploads/${filename}`;
      res.download(filePath);
    }
  } catch (error) {
    console.error("Error decrypting and sending file", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFile = async (req, res) => {};
