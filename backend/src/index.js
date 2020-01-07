const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

require('dotenv').config({ path: 'variables.env' })
const createServer = require('./createServer')
const db = require('./db')

const server = createServer()

server.express.use(cookieParser())

// Decode the JWT so we can get the user ID on each request
server.express.use((req, res, next) => {
  // Pull token out of req
  const { token } = req.cookies
  // Decode token
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    // Put the userId on the the req for future requests to access
    req.userId = userId
  }
  next()
})

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`)
  }
)