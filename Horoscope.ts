import mongoose, { Schema, Document } from 'mongoose';

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface IHoroscope extends Document {
  zodiacSign: ZodiacSign;
  period: string; // например, "Ежедневный", "Еженедельный", "Месячный"
  title: string;
  date: Date;
  content: string;
  accessType: 'free' | 'paid' | 'subscription';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HoroscopeSchema = new Schema<IHoroscope>(
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

export default mongoose.model<IHoroscope>('Horoscope', HoroscopeSchema);


