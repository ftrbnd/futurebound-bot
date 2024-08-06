const mongoose = require('mongoose');

const DailyHeardleCheckSchema = new mongoose.Schema(
  {
    prevDay: {
      type: mongoose.SchemaTypes.Number,
      required: true
    },
    prevSong: {
      type: mongoose.SchemaTypes.String,
      required: true
    },
    nextDay: {
      type: mongoose.SchemaTypes.Number,
      required: false
    },
    nextSong: {
      type: mongoose.SchemaTypes.String,
      required: false
    }
  },
  { versionKey: false }
);

module.exports = mongoose.model('DailyHeardleCheck', DailyHeardleCheckSchema);
