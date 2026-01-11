import mongoose from 'mongoose';

const TransitSchema = new mongoose.Schema(
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

// Статический метод для получения текущего транзита
TransitSchema.statics.getCurrent = async function() {
  const now = new Date();
  
  return await this.findOne({
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ createdAt: -1 });
};

export default mongoose.model('Transit', TransitSchema);

