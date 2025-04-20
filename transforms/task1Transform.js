import { Transform } from 'stream';
import createPhoneNumber from '../tasks/task1.js';

export default function task1Transform() {
  return new Transform({
    transform(chunk, encoding, callback) {
      try {
        const input = chunk.toString().trim();
        const arr = JSON.parse(input);

        if (!Array.isArray(arr) || arr.length !== 10 || !arr.every(n => Number.isInteger(n) && n >= 0 && n <= 9)) {
          throw new Error('Ожидается массив из 10 чисел от 0 до 9');
        }

        const result = createPhoneNumber(arr);
        callback(null, result + '\n');
      } catch (err) {
        callback(new Error('Ошибка: ' + err.message));
      }
    }
  });
}