import jwt from 'jsonwebtoken';

const isLogedIn= async function(req,res,next){
    const {token}=req.cookie;

    if(!token){
        return next(new AppError("Unothenticated user ! Please login again.",401))
    }
    
    const logedUserDetail= await jwt.verify(token,process.env.JWT_SECRET);
    
    req.user=logedUserDetail;

    next();
}

export default isLogedIn;