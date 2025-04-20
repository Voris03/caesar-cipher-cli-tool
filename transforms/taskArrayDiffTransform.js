// transforms/taskArrayDiffTransform.js

import { Transform } from 'stream';
import arrayDiff from '../tasks/taskArrayDiff.js';

export default function taskArrayDiffTransform() {
  return new Transform({
    transform(chunk, encoding, callback) {
      try {
        const input = chunk.toString().trim();
        const [aStr, bStr] = input.split(':');
        const arrA = JSON.parse(aStr);
        const arrB = JSON.parse(bStr);

        if (!Array.isArray(arrA) || !Array.isArray(arrB)) {
          throw new Error('Ожидаются два массива в формате [a]:[b]');
        }

        const result = arrayDiff(arrA, arrB);
        callback(null, JSON.stringify(result) + '\n');
      } catch (err) {
        callback(new Error('Ошибка в taskArrayDiff: ' + err.message));
      }
    }
  });
}