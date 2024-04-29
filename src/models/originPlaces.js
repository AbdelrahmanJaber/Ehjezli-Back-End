const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;

const originPlacesSchema = new mongoose.Schema({
    gateName:{
        type: String,
        required: true,
        trim: true
    },
    opened: {
        type: Boolean,
        required: true,
        default: true
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


const OriginPlaces = mongoose.model('OriginPlaces', originPlacesSchema)

module.exports = OriginPlaces
