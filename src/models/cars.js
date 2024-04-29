const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const carsSchema = new mongoose.Schema({

    carName:{
        type: String,
        required: true,
        trim: true
    },

    carTrack:{
        type: String,
        required: true,
        trim: true
    },

    carTypeEncoded:{
        type: String,
        required: true,
        trim: true
    },

    carTrackEncoded:{
        type: String,
        required: true,
        trim: true
    },

    carPrice: {
        type: SchemaTypes.Double,
        required: true,
        trim: true,
    },

});


const Cars = mongoose.model('Cars', carsSchema)

module.exports = Cars
