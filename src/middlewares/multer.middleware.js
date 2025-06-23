import multer from "multer";

// where to save file

const storage=multer.diskStorage({
    diskStorage:function(req,file,cb){
        cd(null,'./public/temp')
    },
    filename:function(req,file,cb){
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,file.filename)
    }
})

const upload = multer({ storage })