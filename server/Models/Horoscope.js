import mongoose from 'mongoose';

const HoroscopeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Название обязательно'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Подзаголовок обязателен'],
      trim: true,
    },
    mainContent: {
      type: String,
      required: [true, 'Основной контент обязателен'],
    },
    dates: {
      type: String,
      required: [true, 'Даты обязательны'],
      trim: true,
      // Формат: "ГГГГ-ММ-ДД - ГГГГ-ММ-ДД"
    },
    lines: [
      {
        date: {
          type: String,
          required: true,
          trim: true,
          // Формат: "ГГГГ-ММ-ДД"
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        content: {
          type: String,
          required: true,
        },
      }
    ],
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'free',
      required: true,
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

// Индексы для быстрого поиска
HoroscopeSchema.index({ dates: 1 });
HoroscopeSchema.index({ isActive: 1 });

export default mongoose.model('Horoscope', HoroscopeSchema);
