const mongoose = require('mongoose')

const driverCarInfoSchema = new mongoose.Schema({

    driverId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
        ref: 'Driver'
    },
    carType:{
        type: String,
        required: true,
        trim: true
    },
    carBrand: {
        type: String,
        required: true,
        trim: true,
        default: 'empty'
    },

    carModel: {
        type: String,
        required: true,
        trim: true,
        default: 'empty'
    },
  
    carYear: {
        type: String,
        required: true,
        trim: true,
        default: 'empty'
    },
    carNumber: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        default: 'empty'
    },


    track:{
        type: String,
        required: true,
        trim: true
    },

 
});


const DriverCarInfo = mongoose.model('DriverCarInfo', driverCarInfoSchema)

module.exports = DriverCarInfo
