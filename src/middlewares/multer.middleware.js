import multer from "multer";
import path from "path"
import { fileURLToPath } from "url";
import { dirname } from "path";

// where to save file
const __filename=fileURLToPath(import.meta.url);
const __dirname=dirname(__filename);

const uploadpath=path.resolve(__dirname,"../../public/temp")
console.log("📦 multer upload path:", uploadpath);

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,uploadpath);
    },
    filename:function(req,file,cb){
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,file.originalname)
    }
})

export const upload = multer({ storage })