const mongoose=require('mongoose')
const URI='mongodb+srv://anmolgaur26:R45PYta7sE1GiKZ5@cluster0.afbebnf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const connectdb=async ()=>{
    try {
        await mongoose.connect(URI);
        console.log("db connected");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports=connectdb

