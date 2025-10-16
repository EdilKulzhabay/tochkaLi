import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  order: number; // для сортировки
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
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
    category: {
      type: String,
      required: [true, 'Категория обязательна'],
      trim: true,
      index: true,
      default: 'Общие',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для сортировки и поиска
FAQSchema.index({ category: 1, order: 1 });
FAQSchema.index({ isActive: 1 });

export default mongoose.model<IFAQ>('FAQ', FAQSchema);


