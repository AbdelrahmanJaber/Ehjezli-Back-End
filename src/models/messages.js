const mongoose = require('mongoose')
const messagesScheema = new mongoose.Schema({
    driverId:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true,
        ref: 'Driver'
    },
    chats: [{
        userId:
        {
            type: String,
            trim: true,

        },
        userExpoPushNotificationToken: {
            type: String,
            trim: true
        },
        avatar:
        {
            type:String,
            trim:true
        },
        name:
        {
            type: String,
            trim: true,
        },
        content: [{
            text:
            {
                type: String,
                trim: true,
            },
            createdAt:
            {
                type: Date,
                trim: true,
            },
            user: {
                _id: {
                    type: Number,
                    trim: true,
                },
            },
        }],
    }]
});


const Messages = mongoose.model('Messages', messagesScheema)

module.exports = Messages
