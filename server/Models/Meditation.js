import mongoose from 'mongoose';

const MeditationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Название обязательно'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
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
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model('Meditation', MeditationSchema);
