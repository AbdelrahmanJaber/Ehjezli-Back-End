const mongoose = require('mongoose')

require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;


const trafficSchema = new mongoose.Schema({
    driverId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
        ref: 'Driver'
    },
    latitude:
    {
        type: SchemaTypes.Double,
        required: true,
        trim: true,
    },
    longitude:
    {
        type: SchemaTypes.Double,
        required: true,
        trim: true,
    }
});


const Traffic = mongoose.model('Traffic', trafficSchema)

module.exports = Traffic
