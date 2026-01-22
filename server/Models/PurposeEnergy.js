import mongoose from 'mongoose';

const PurposeEnergySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Название обязательно'],
      trim: true,
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Краткое описание не должно превышать 500 символов'],
    },
    imageUrl: {
      type: String,
    },
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscription', 'stars'],
      default: 'free',
    },
    starsRequired: {
      type: Number,
      min: 0,
      default: 0,
    },
    duration: {
      type: Number,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    allowRepeatBonus: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      enum: ['top', 'bottom'],
      default: 'bottom',
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
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('PurposeEnergy', PurposeEnergySchema);
