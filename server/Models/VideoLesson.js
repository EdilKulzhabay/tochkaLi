import mongoose from 'mongoose';

const VideoLessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Название обязательно'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Подзаголовок обязателен'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Категория обязательна'],
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Краткое описание обязательно'],
      maxlength: [500, 'Краткое описание не должно превышать 500 символов'],
    },
    fullDescription: {
      type: String,
      required: [true, 'Полное описание обязательно'],
    },
    imageUrl: {
      type: String,
      required: [true, 'URL изображения обязателен'],
    },
    videoUrl: {
      type: String,
      required: [true, 'URL видео обязателен'],
    },
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'free',
      required: true,
    },
    duration: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

VideoLessonSchema.index({ category: 1, accessType: 1 });

export default mongoose.model('VideoLesson', VideoLessonSchema);

