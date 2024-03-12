import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import crypto from 'crypto';

const userSchema= new mongoose.Schema({
    fullName:{
        type:String,
        required:[true, "Name is required."],
        maxLenght:[50, "Name should not contain more character then 50"],
        minLenght:[3, "Name at least contains 3 character"],
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:[true, "Email is required."],
        unique: true,
        lowercase: true, 
        trim: true,
        match:[/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill a valid email"
        ]

    },
    password:{
        type:String,
        required: [true, "Password is required."],
        minLenght:[8, "Password at least contains 8 character"],
        select: false
    },
    avatar:{
        public_id:{
            type:"String"
        },
        secure_url:{
            type:"String"
        }
    },
    role:{
        type:'String',
        enum:['USER','ADMIN'],
        default:'USER'
    },
    forgotPasswordToken: String,
    fogotPasswordExpiry:Date
},{
    timestamps:true
});


userSchema.methods={
    generateJWTToken:async function(){
      return await jwt.sign(
        {id:this._id, email:this.email,subscription:this.subscription},
        process.env.JWT_SECRET,
        {
            expiresIn:'24d'
        }
      )
    },

    comparePassword: async function(plainTextPass){
       return await bcrypt.compare(plainTextPass,this.password);
    },

    generateResetpasswordToken: async function(){
        const resetToken= crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
        this.fogotPasswordExpiry=Date.now() + 15 * 60 * 1000;
        return resetToken;
    }
}


export default mongoose.model('NewCollection',userSchema);