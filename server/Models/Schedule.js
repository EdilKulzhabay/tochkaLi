import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      trim: true,
    },
    eventDate: {
      type: Date,
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    eventLink: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Schedule', ScheduleSchema);

