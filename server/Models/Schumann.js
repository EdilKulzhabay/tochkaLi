import mongoose from 'mongoose';

const SchumannSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Дата обязательна'],
      index: true,
    },
    image: {
      type: String,
      required: [true, 'Изображение обязательно'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Schumann', SchumannSchema);
