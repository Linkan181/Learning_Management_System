import express from 'express';
import isLogedIn from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';

const router=express.Router();

import {signup, login, logout, veiwProfile, forgotPassword, resetPassword, changePassword, updateProfile} from '../controllers/userController.js';


router.post('/signup',upload.single("avatar"),signup);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',isLogedIn,veiwProfile);
router.post('/forgotpassword',forgotPassword);
router.post('/resetpassword/:token',resetPassword);
router.post('/changepassword',isLogedIn,changePassword);
router.put('/updateprofile',isLogedIn,upload.single("avatar"),updateProfile);

export default router;