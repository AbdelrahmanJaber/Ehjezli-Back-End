const mongoose = require('mongoose')
const ordersDriverSchema = new mongoose.Schema({
    driverId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
        ref: 'Driver'
    },
    orders:[{
        gate:{
            type: String,
            trim: true,
            trim: true
        },
        code: {
            type: String,
            trim: true,
            default: 'empty'
        },
        date: {
            type: String,
            trim: true,
            default: 'empty'
        },
        time:
        {
            type: String,
            trim: true,
            default: 'empty'  
        }
    }]
});


const OrdersDriver = mongoose.model('OrdersDriver', ordersDriverSchema)

module.exports = OrdersDriver
