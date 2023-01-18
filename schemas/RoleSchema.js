const mongoose = require('mongoose')

const RoleSchema = new mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    id: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    musicPermission: {
        type: mongoose.SchemaTypes.Boolean,
        required: true,
    }
}, { versionKey: false })

module.exports = mongoose.model('Role', RoleSchema)