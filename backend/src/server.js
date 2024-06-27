const express = require('express');
const connectDB = require('./config/db'); // Import the MongoDB connection function
const dotenv = require('dotenv'); // Import dotenv for environment variables
const bodyParser = require('body-parser'); // Import body-parser to parse request bodies
const cors = require('cors'); // Import cors for cross-origin resource sharing
const helmet = require('helmet'); // Import helmet for setting various HTTP headers for security
const rateLimit = require('express-rate-limit'); // Import express-rate-limit for rate limiting
const session = require('express-session');
const MongoStore = require('connect-mongo');
const scheduleAccountDeletion = require('./utils/scheduler'); // Import the scheduler
const csurf = require('csurf'); // Import csurf for CSRF protection
const cookieParser = require('cookie-parser'); // Import cookie-parser

// Load environment variables from .env file
dotenv.config();

// Initialize the express app
const app = express();

// Connect to MongoDB
connectDB(); // Call the function to connect to MongoDB

// Use middleware
app.use(cors());
app.use(bodyParser.json());
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter); // Apply the rate limiting middleware to all requests

// Configure sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    },
}));

app.use(cookieParser());

// CSRF protection middleware
const csrfProtection = csurf({ cookie: true });

// Endpoint to get CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Import routes
const authRoutes = require('./routes/auth.routes'); // Import authentication routes
const userRoutes = require('./routes/user.routes'); // Import user routes
const blogRoutes = require('./routes/blog.routes'); // Import blog routes
const tagRoutes = require('./routes/tag.routes'); // Import tag routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/tags', tagRoutes); // Add tag routes

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the scheduler
scheduleAccountDeletion();

// Define the port to run the server on
const PORT = process.env.PORT || 5002;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
