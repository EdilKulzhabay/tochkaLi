import mongoose from 'mongoose';

const HoroscopeSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: [true, 'Начальная дата обязательна'],
    },
    endDate: {
      type: Date,
      required: [true, 'Конечная дата обязательна'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
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
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'subscription',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Статический метод для получения текущего гороскопа
HoroscopeSchema.statics.getCurrent = async function() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return await this.findOne({
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ createdAt: -1 });
};

export default mongoose.model('Horoscope', HoroscopeSchema);
