const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const driverSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error("Not a valid email")
            }
        }
    },
    password: {
        type: String,
        required: true,
    },

    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    DOB: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },

    avatar: {
        type: String
    },
    
    tokens: [{
        token: {
            type: String
        }
    }],
    pushNotificationToken:{
        type: String,
        trim: true
    },
    signUpConfirmation:{
        code:{type: String},
        expiredTime:{type: Date},
    },
    resetPassword:{
        code:{type: String},
        expiredTime:{type: Date},
    },
    confirmedSignUp:{
        type: Boolean,
        default: false
    },
    confirmedAdmin:{
        type: Boolean,
        default: false
    },
    confirmed:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});


//for carInfoSchema
driverSchema.virtual('DriverCarInfo', {
    ref: 'DriverCarInfo',
    localField: '_id',
    foreignField: 'driverId'
})

// for Orders
driverSchema.virtual('Orders', {
    ref: 'Orders',
    localField: '_id',
    foreignField: 'driverId'
})


//for Messages
driverSchema.virtual('Messages', {
    ref: 'Messages',
    localField: '_id',
    foreignField: 'driverId'
})

//for Traffic

driverSchema.virtual('Traffic', {
    ref: 'Traffic',
    localField: '_id',
    foreignField: 'driverId'
})

driverSchema.methods.toJSON = function () {
    const driver = this

    const driverObject = driver.toObject()

    delete driverObject.password
    delete driverObject.tokens


    return driverObject
}


driverSchema.methods.generateAuthToken = async function () {
    const driver = this

    const token = jwt.sign({ _id: driver._id.toString() }, process.env.secret_jwt)

    driver.tokens = driver.tokens.concat({ token })

    await driver.save()

    return token
}

driverSchema.methods.generateCode = async function () {
    const driver = this

    const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)

    driver.signUpConfirmation.code = code

    await driver.save()

    return code
}

driverSchema.statics.findByCredentials = async (email, password) => {
    const driver = await Driver.findOne({ email })

    if (!driver) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, driver.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return driver
}

driverSchema.pre('save', async function (next) {
    const driver = this

    if (driver.isModified('password')) {
        driver.password = await bcrypt.hash(driver.password, 8)
    }

    next()
})



const Driver = mongoose.model('Driver', driverSchema)

module.exports = Driver
