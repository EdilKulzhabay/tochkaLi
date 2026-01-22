import mongoose from 'mongoose';

const MeditationSchema = new mongoose.Schema(
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
    fullDescription: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    ruTubeUrl: {
      type: String,
      default: null,
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
    }
  },
  {
    timestamps: true,
  }
);


export default mongoose.model('Meditation', MeditationSchema);
