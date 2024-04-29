const jwt = require('jsonwebtoken')
const Student = require('../models/student')

const studentAuth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')

        
        const decoded = jwt.verify(token, process.env.secret_jwt)

        
        const student = await Student.findById(decoded._id)
        
        if(!student){
            throw new Error()
        }

        req.token = token
        req.student = student

        next()

    } catch (e) {
        console.log(e)
        res.status(401).send('Please Authenticate!')
    }
}

module.exports = studentAuth
