const jwt = require('jsonwebtoken')
const Driver = require('../models/driver')

const driverAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        
        const decoded = jwt.verify(token, process.env.secret_jwt)

        const driver = await Driver.findOne({ _id: decoded._id, 'tokens.token': token })
        
        if(!driver){
            throw new Error()
        }

        req.token = token
        req.driver = driver

        next()

    } catch (e) {
        res.status(401).send('Please Authenticate!')
    }
}

module.exports = driverAuth
