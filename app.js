require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const apiRoutes = require("./routes")
const cookieParser = require("cookie-parser")
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const { databaseConnection, handleDatabaseConnectionError } = require("./Db/dbConnection")

const app = express()
const apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 40,
});

app.use(async (req, res, next) => {
    try {
        await databaseConnection()
        next()
    } catch (error) {
        handleDatabaseConnectionError(error)
    }
})


const configureMiddleware = (server) => {
    // 1. Security HTTP headers (Helmet should come early)
    server.use(helmet());

    // 2. JSON and URL-encoded parsers
    server.use(express.json());
    server.use(express.urlencoded({ extended: true, limit: "20mb" }));

    // 3. Cookie parser
    server.use(cookieParser());

    // 4. Data sanitization against NoSQL injection
    server.use(mongoSanitize());

    // 5. Data sanitization against XSS
    server.use(xss());

    // 6. CORS (must be before any route that sends response)
    server.use(cors({
        origin: [process.env.FRONTEND_URL],
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        credentials: true,
        optionsSuccessStatus: 200,
    }));

    // 8. Rate limiting (after security and parsing, before routes)
    server.use(apiRateLimiter);
};

configureMiddleware(app)
// health route
app.get("/api/health", (req, res) => {
    res.send("Server is healthy!!")
})

// All the routes
app.use("/api", apiRoutes)
// Unknown route
app.use("*", (req, res) => {
    res.status(404).json({ message: "oops! page does not exist, check url" });
});

module.exports = app