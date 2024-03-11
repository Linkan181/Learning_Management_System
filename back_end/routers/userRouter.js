import express from 'express';
import isLogedIn from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';

const router=express.Router();

import {signup, login, logout, veiwProfile} from '../controllers/userController.js';


router.post('/signup',upload.single("avatar"),signup);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',isLogedIn,veiwProfile);


export default router;