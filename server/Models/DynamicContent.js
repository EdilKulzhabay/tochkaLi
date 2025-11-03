import mongoose from 'mongoose';

const DynamicContentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Название обязательно'],
      trim: true,
      unique: true,
    },
    content: {
      type: String,
      required: [true, 'Контент обязателен'],
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска
DynamicContentSchema.index({ name: 1 });

export default mongoose.model('DynamicContent', DynamicContentSchema);

