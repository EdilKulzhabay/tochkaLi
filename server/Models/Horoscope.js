import mongoose from 'mongoose';

const HoroscopeSchema = new mongoose.Schema(
  {
    dates: {
      type: String,
      required: [true, 'Даты обязательны'],
      trim: true,
      // Формат: "ГГГГ-ММ-ДД - ГГГГ-ММ-ДД"
    },
    datesContent: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        subtitle: {
          type: String,
          required: true,
          trim: true,
        },
        image: {
          type: String,
          trim: true,
        },
        lines: [
          {
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
      }
    ],
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'free',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска
HoroscopeSchema.index({ dates: 1 });

export default mongoose.model('Horoscope', HoroscopeSchema);
