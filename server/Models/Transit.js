import mongoose from 'mongoose';

const TransitSchema = new mongoose.Schema(
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
        date: {
          type: String,
          required: true
        },
        subtitle: {
          type: String,
          // required: true,
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

export default mongoose.model('Transit', TransitSchema);

