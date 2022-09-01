const mongoose = require('mongoose')

const SurvivorSchema = new mongoose.Schema({
    album: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    tracks: {
        type: mongoose.SchemaTypes.Array,
        required: true,
    }
})

module.exports = mongoose.model('Survivor', SurvivorSchema)