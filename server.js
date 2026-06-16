require('dotenv').config();
const app = require('./app');
const {connectDB} = require('./src/config/db');
const startServer = async () => {
    try {
        await connectDB();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }   catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();