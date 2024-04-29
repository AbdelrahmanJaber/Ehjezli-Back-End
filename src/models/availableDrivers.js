const mongoose = require('mongoose')

require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;


const availableDriversSchema = new mongoose.Schema({

    driverId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
        ref: 'Driver'
    },

    carType: {
        type: String,
        required: true,
        trim: true,
        
    },

    track: {
        type: String,
        required: true,
        trim: true,
    },
    longitude:
    {
        type: SchemaTypes.Double,
        required: true,
        trim: true,

    },
    latitude:
    {
        type: SchemaTypes.Double,
        required: true,
        trim: true,

    },
    heading:
    {

        type: Number,
        required: true,
        trim: true,
        
    }

});


const AvailableDrivers = mongoose.model('AvailableDrivers', availableDriversSchema)

module.exports = AvailableDrivers
