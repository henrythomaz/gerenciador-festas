import multer, { FileFilterCallback } from "multer";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname, resolve, extname } from "path";
import { Request } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      cb(null, resolve(__dirname, "..", "storage", "uploads"));
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err, "");
        return cb(null, res.toString("hex") + extname(file.originalname));
      });
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido."));
    }
  },
};
