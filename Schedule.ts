import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  eventTitle: string;
  eventDate: Date;
  location: string;
  eventLink?: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Индекс для поиска предстоящих событий
ScheduleSchema.index({ eventDate: 1, isActive: 1 });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);


