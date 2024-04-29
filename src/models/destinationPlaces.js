const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const destinationPlacesSchema = new mongoose.Schema({

    mainDestination:{
        type: String,
        required: true,
        trim: true
    },
    subDestination:{
        type: String,
        required: true,
        trim: true
    },
    exactDestination:{
        type: String,
        required: true,
        trim: true
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

});


const DestinationPlaces = mongoose.model('DestinationPlaces', destinationPlacesSchema)

module.exports = DestinationPlaces
