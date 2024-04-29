const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const orderSchema = new mongoose.Schema({

    studentID:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            trim: true,
            ref: 'Student'
    },
    origin: {
        gateName: {
            type: String,
            required: true,
            trim: true
        },
        longitude: {
            type: SchemaTypes.Double,
            required: true,
            trim: true
        },
        latitude: {
            type: SchemaTypes.Double,
            required: true,
            trim: true
        },

    },

    destination:{
        mainDestination: {
            type: String,
            required: true,
            trim: true
        },
        subDestination: {
            type: String,
            required: true,
            trim: true
        },
        exactDestination: {
            type: String,
            required: true,
            trim: true
        }, 
        longitude: {
            type: SchemaTypes.Double,
            required: true,
            trim: true
        },
        latitude: {
            type: SchemaTypes.Double,
            required: true,
            trim: true
        },
    },

    car: {
        type: {
            type: String,
            required: true,
            trim: true
        }, 
        price: {
            type: SchemaTypes.Double,
            required: true,
            trim: true
        },
    },

    status: {
        type: String,
        required: true,
        trim: true,
        default: 'waiting'
    }
},{
    timestamps: true
});


const Orders = mongoose.model('Orders', orderSchema)

module.exports = Orders
