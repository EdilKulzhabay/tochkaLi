import mongoose from 'mongoose';

const VideoLessonSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('VideoLesson', VideoLessonSchema);

