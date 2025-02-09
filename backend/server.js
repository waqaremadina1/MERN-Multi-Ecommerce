import cors from 'cors'
import express from 'express'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import adminRouter from './routes/adminRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// App Config
const app = express()
const startPort = process.env.PORT || 4000

// Connect to MongoDB and Cloudinary
const initializeServices = async () => {
    try {
        await connectDB();
        console.log("MongoDB Connected Successfully");
        
        const cloudinaryConnected = connectCloudinary();
        if (cloudinaryConnected) {
            console.log("Cloudinary Connected Successfully");
        } else {
            console.error("Failed to connect to Cloudinary");
        }
    } catch (error) {
        console.error("Service Initialization Error:", error);
        process.exit(1);
    }
}

initializeServices();

// middlewares
app.use(express.json())
app.use(cors())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// api endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/admin', adminRouter)

app.get('/',(req,res)=>{
    res.send('API Working')
})

// Function to try different ports if the initial port is in use
const startServer = (port) => {
    try {
        app.listen(port, () => console.log('Server started on PORT: ' + port))
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`)
            startServer(port + 1)
        } else {
            console.error('Error starting server:', error)
        }
    }
}

// Start the server with error handling
const server = app.listen(startPort)
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log(`Port ${startPort} is busy, trying ${startPort + 1}...`)
        server.close()
        startServer(startPort + 1)
    } else {
        console.error('Error starting server:', error)
    }
})