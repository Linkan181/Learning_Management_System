import multer from 'multer';

const upload=multer({
    dest:"uploads/",
    limits:{filezise:50* 1024 * 1024},
    storage:multer.diskStorage({
        destination:"uploads/",
        filename:(req,file,cb)=>{
            cb(null,file.originalname)
        }
    })

})

export default upload;