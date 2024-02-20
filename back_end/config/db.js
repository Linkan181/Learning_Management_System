import mongoose from 'mongoose';
mongoose.set("strictQuery",false);
const connectToDB=async function (){

         mongoose.connect(process.env.MONGO_URL)
        .then((conn)=>console.log(`Successfully connect with DB : ${conn.connection.host}`))
        .catch((error)=>{
            console.log(`Database failed to connect. ${error}`);
            process.exit(1);
        })
  
}

export default connectToDB;