import mongoose from 'mongoose';

const HoroscopeSchema = new mongoose.Schema(
  {
    zodiacSign: {
      type: String,
      required: [true, 'Знак зодиака обязателен'],
      enum: [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ],
      index: true,
    },
    period: {
      type: String,
      required: [true, 'Период обязателен'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Заголовок обязателен'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Дата обязательна'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Содержание обязательно'],
    },
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

// Индексы для быстрого поиска гороскопов
HoroscopeSchema.index({ zodiacSign: 1, date: -1 });
HoroscopeSchema.index({ period: 1, date: -1 });
HoroscopeSchema.index({ isActive: 1 });

export default mongoose.model('Horoscope', HoroscopeSchema);

