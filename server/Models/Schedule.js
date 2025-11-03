import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      required: [true, 'Название события обязательно'],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Дата события обязательна'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Место проведения обязательно'],
      trim: true,
    },
    eventLink: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Описание обязательно'],
    },
  },
  {
    timestamps: true,
  }
);

// Индекс для поиска предстоящих событий
ScheduleSchema.index({ eventDate: 1 });

export default mongoose.model('Schedule', ScheduleSchema);

