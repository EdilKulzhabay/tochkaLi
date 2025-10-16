import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Вопрос обязателен'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Ответ обязателен'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('FAQ', FAQSchema);

