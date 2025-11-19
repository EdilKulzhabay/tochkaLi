import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      index: true,
    },
    endDate: {
      type: Date,
      index: true,
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

