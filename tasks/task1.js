// tasks/task1.js
export default function createPhoneNumber(numbers) {
    const str = numbers.join('');
    return `(${str.slice(0, 3)}) ${str.slice(3, 6)}-${str.slice(6)}`;
  }