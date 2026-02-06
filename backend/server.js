const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const uploadErrorHandler = require('./middleware/uploadErrorHandler');
const seedAdmin = require('./seedAdmin');

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://agaciro.onrender.com', 'https://agaciro.vercel.app', 'http://localhost:5173', 'http://localhost:3000'] // Allow localhost for testing
        : ['http://localhost:5173'], // Development origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Routes
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));

app.get('/', (req, res) => {
    res.send("Backend is running...");
})

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('Connected to MongoDB');

    await seedAdmin();

}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

mongoose.connection.once('open', () => {
  console.log('Connected to database:', mongoose.connection.name);
});

app.use(uploadErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
