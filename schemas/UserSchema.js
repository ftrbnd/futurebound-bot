const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    discordId: {
        type: mongoose.SchemaType.String,
        require: true,
    },
    birthday: {
        type: mongoose.SchemaType.Date,
        require: true,
    },
    timezone: {
        type: mongoose.SchemaType.String,
        require: true,
    },
})

module.exports = mongoose.model('User', UserSchema)