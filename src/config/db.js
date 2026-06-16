const {MongoClient} = require("mongodb");
let db;
const connectDB = async  () => {
    try {
        const client = new MongoClient(process.env.MONGO_URL, {serverSelectionTimeoutMS: 2000});
        await client.connect();
        db = client.db(process.env.DB_NAME);
        console.log("DB Connected");
    } catch (error) {
        console.warn("DB Connection failed, running without database:", error.message);
    }
};
const getDB = () => db;

module.exports = {
    connectDB,
    getDB,
}