const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    discordId: {
        type: mongoose.SchemaTypes.String,
        require: true,
    },
    birthday: {
        type: mongoose.SchemaTypes.Date,
        require: true,
    },
    timezone: {
        type: mongoose.SchemaTypes.String,
        require: true,
    },
})

module.exports = mongoose.model('User', UserSchema)