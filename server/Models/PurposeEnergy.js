import mongoose from 'mongoose';

const PurposeEnergySchema = new mongoose.Schema(
  {
    startDate: {
      type: String,
      required: [true, 'Начальная дата обязательна'],
      validate: {
        validator: function(v) {
          return /^\d{2}-\d{2}$/.test(v);
        },
        message: 'Дата должна быть в формате MM-DD'
      }
    },
    endDate: {
      type: String,
      required: [true, 'Конечная дата обязательна'],
      validate: {
        validator: function(v) {
          return /^\d{2}-\d{2}$/.test(v);
        },
        message: 'Дата должна быть в формате MM-DD'
      }
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
    content: [
        {
            videoUrl: {
                type: String,
                trim: true,
            },
            ruTubeUrl: {
                type: String,
                trim: true,
            },
            text: {
                type: String,
                trim: true,
            },
            image: {
                type: String,
                trim: true,
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

export default mongoose.model('PurposeEnergy', PurposeEnergySchema);
