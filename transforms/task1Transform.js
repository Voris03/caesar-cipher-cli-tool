import { Transform } from 'stream';

function createPhoneNumber(numbers) {
  const str = numbers.join('');
  return `(${str.slice(0, 3)}) ${str.slice(3, 6)}-${str.slice(6)}`;
}

export default function task1Transform() {
  return new Transform({
    transform(chunk, encoding, callback) {
      try {
        const input = chunk.toString().trim();
        const arr = JSON.parse(input);

        if (!Array.isArray(arr) || arr.length !== 10 || !arr.every(n => Number.isInteger(n) && n >= 0 && n <= 9)) {
          throw new Error('Ожидается массив из 10 целых чисел от 0 до 9');
        }

        const result = createPhoneNumber(arr);
        callback(null, result + '\n');
      } catch (err) {
        callback(new Error('Ошибка: ' + err.message));
      }
    }
  });
}