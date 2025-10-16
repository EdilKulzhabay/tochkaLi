import mongoose from 'mongoose';

const TransitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Название обязательно'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Категория обязательна'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Описание обязательно'],
    },
    planet: {
      type: String,
      required: [true, 'Планета обязательна'],
      trim: true,
      index: true,
    },
    aspect: {
      type: String,
      required: [true, 'Аспект обязателен'],
      trim: true,
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Дата начала обязательна'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'Дата окончания обязательна'],
      index: true,
    },
    affectedZodiacs: {
      type: [String],
      default: [],
    },
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'free',
      required: true,
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

// Индексы для поиска активных транзитов
TransitSchema.index({ startDate: 1, endDate: 1 });
TransitSchema.index({ planet: 1, startDate: -1 });
TransitSchema.index({ isActive: 1 });

// Валидация дат
TransitSchema.pre('save', function (next) {
  if (this.endDate < this.startDate) {
    next(new Error('Дата окончания должна быть после даты начала'));
  }
  next();
});

export default mongoose.model('Transit', TransitSchema);

