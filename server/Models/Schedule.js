import mongoose from 'mongoose';
import { generateICSFile, deleteICSFile } from '../utils/icsGenerator.js';

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

// Hook после сохранения (создание и обновление через save())
ScheduleSchema.post('save', async function (doc) {
  try {
    // Удаляем старый файл, если он существует (при обновлении)
    await deleteICSFile(doc._id.toString()).catch(() => {
      // Игнорируем ошибку, если файл не существует
    });
    
    // Генерируем новый .ics файл
    await generateICSFile(doc);
    console.log(`[Schedule] ✓ .ics файл создан для события ${doc._id}`);
  } catch (error) {
    console.error(`[Schedule] Ошибка при генерации .ics файла для события ${doc._id}:`, error.message);
    // Не прерываем выполнение, если не удалось создать .ics файл
  }
});

// Hook после обновления через findOneAndUpdate / findByIdAndUpdate
ScheduleSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return; // Если документ не найден, ничего не делаем
  
  try {
    // Удаляем старый файл
    await deleteICSFile(doc._id.toString()).catch(() => {
      // Игнорируем ошибку, если файл не существует
    });
    
    // Генерируем новый .ics файл с обновленными данными
    await generateICSFile(doc);
    console.log(`[Schedule] ✓ .ics файл обновлен для события ${doc._id}`);
  } catch (error) {
    console.error(`[Schedule] Ошибка при обновлении .ics файла для события ${doc._id}:`, error.message);
    // Не прерываем выполнение, если не удалось обновить .ics файл
  }
});

// Hook после удаления через findOneAndDelete / findByIdAndDelete
ScheduleSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return; // Если документ не найден, ничего не делаем
  
  try {
    await deleteICSFile(doc._id.toString());
    console.log(`[Schedule] ✓ .ics файл удален для события ${doc._id}`);
  } catch (error) {
    // Игнорируем ошибку, если файл не существует
    if (error.code !== 'ENOENT') {
      console.error(`[Schedule] Ошибка при удалении .ics файла для события ${doc._id}:`, error.message);
    }
    // Не прерываем выполнение, если не удалось удалить .ics файл
  }
});

export default mongoose.model('Schedule', ScheduleSchema);

