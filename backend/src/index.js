 const express = require('express');
 const cors = require('cors');
 const dotenv = require('dotenv');
 const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
 const authRoutes = require('./routes/authRoutes');  
 const {verifyToken} = require('./middlewares/authMiddleware');
 const vehicleRoutes = require('./routes/vehicleRoutes');
 const driverRoutes = require('./routes/driverRoutes');
 const shipmentRoutes = require('./routes/shipmentRoutes');


 // Load environment variables from .env file
 dotenv.config();

 //Initialize the Express application
 const app = express();

 // Middleware to parse JSON bodies
 app.use(cors()); //Allow Frontend to access the API
 app.use(express.json()); // Parse JSON bodies

 // Test route
    app.get('/', (req, res) => {
    res.send('Logistics App Backend is Running ✅');
    });

    app.get('/api/users', async (req, res) => {
        const users = await prisma.user.findMany();
        res.json(users);
    });


    app.use('/api/auth', authRoutes);

    app.get('/api/protected', verifyToken, (req, res) => {
        res.send('Hello User ${req.user.id}, you have access to this protected route!');
    }
    ); 

    app.use('/api/vehicles', vehicleRoutes); // Vehicle routes

    app.use('/api/drivers', driverRoutes); // Driver routes

    app.use('/api/shipments', shipmentRoutes); // Shipment routes


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


