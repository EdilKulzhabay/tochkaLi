import mongoose from 'mongoose';

const HoroscopeSchema = new mongoose.Schema(
  {
    startDate: {
      type: String,
      required: [true, 'Начальная дата обязательна'],
      validate: {
        validator: function(v) {
          return /^\d{2}-\d{2}$/.test(v);
        },
        message: 'Дата должна быть в формате MM-DD'
      }
    },
    endDate: {
      type: String,
      required: [true, 'Конечная дата обязательна'],
      validate: {
        validator: function(v) {
          return /^\d{2}-\d{2}$/.test(v);
        },
        message: 'Дата должна быть в формате MM-DD'
      }
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    lines: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        content: {
          type: String,
          required: true,
        },
      }
    ],
    accessType: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'subscription',
      required: true,
    },
    energyCorridor: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Статический метод для получения текущего гороскопа
HoroscopeSchema.statics.getCurrent = async function() {
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const currentDate = `${currentMonth}-${currentDay}`;
  
  // Исключаем гороскопы, у которых в title содержится слово "коридор"
  const allHoroscopes = await this.find({
    energyCorridor: false
  });
  
  for (const horoscope of allHoroscopes) {
    const start = horoscope.startDate;
    const end = horoscope.endDate;
    
    // Проверяем, попадает ли текущая дата в диапазон
    // Учитываем случай, когда период переходит через конец года (например, 12-20 до 01-19)
    if (start <= end) {
      // Обычный случай (например, 03-21 до 04-20)
      if (currentDate >= start && currentDate <= end) {
        return horoscope;
      }
    } else {
      // Период переходит через конец года (например, 12-22 до 01-20)
      if (currentDate >= start || currentDate <= end) {
        return horoscope;
      }
    }
  }
  
  return null;
};

export default mongoose.model('Horoscope', HoroscopeSchema);
