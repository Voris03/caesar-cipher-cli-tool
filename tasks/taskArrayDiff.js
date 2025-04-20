// tasks/taskArrayDiff.js

export default function arrayDiff(a, b) {
    return a.filter(el => !b.includes(el));
  }