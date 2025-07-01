import { Router} from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";

const router=Router()
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
console.log("router")
router.route("/register").post(
    // fields take multiple fields
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        },
    ]),
    registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)


export default router
