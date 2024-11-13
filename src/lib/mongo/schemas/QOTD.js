import { Schema, SchemaTypes, model } from 'mongoose';

const AnswerSchema = new Schema({
  userId: {
    type: SchemaTypes.String,
    required: true
  },
  messageId: {
    type: SchemaTypes.String,
    required: true
  }
});

export const Answer = model('Answer', AnswerSchema);

const QuestionSchema = new Schema(
  {
    question: {
      type: SchemaTypes.String,
      required: true
    },
    answers: [AnswerSchema],
    messageId: {
      type: SchemaTypes.String,
      required: true
    },
    userId: {
      type: SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export const QOTD = model('QOTD', QuestionSchema);
