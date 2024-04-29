const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error("Not a valid email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,

    },tokens: [{
        token: {
            type: String
        }
    }]

})

adminSchema.methods.toJSON = function () {
    const admin = this

    const adminObject = admin.toObject()

    delete adminObject.password
    delete adminObject.tokens

    return adminObject
}


adminSchema.methods.generateAuthToken = async function () {
    const admin = this

    const token = jwt.sign({ _id: admin._id.toString() }, process.env.secret_jwt)

    admin.tokens = admin.tokens.concat({ token })

    await admin.save()

    return token
}

adminSchema.statics.findByCredentials = async (email, password) => {
    const admin = await Admin.findOne({ email })

    if (!admin) {
        throw new Error("Not Found!")
    }

    const isMatch = await bcryptjs.compare(password, admin.password)

    if (!isMatch) {
        throw new Error("Incorrect Password")
    }

    return admin
}

adminSchema.pre('save', async function (next) {
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcryptjs.hash(admin.password, 8)
    }

    next()
})

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin
