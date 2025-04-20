// cli.js
import { Command } from 'commander';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { createInterface } from 'readline';

import task1Transform from './transforms/task1Transform.js';
import task5Transform from './transforms/task5Transform.js';

const program = new Command();
const pipe = promisify(pipeline);

program
  .requiredOption('-t, --task <number>', 'номер задачи для выполнения')
  .option('-i, --input <file>', 'входной файл')
  .option('-o, --output <file>', 'выходной файл');

program.parse(process.argv);
const options = program.opts();

// ---------- Ввод и вывод ----------
const inputStream = options.input
  ? getInputStream(options.input)
  : process.stdin;

const outputStream = options.output
  ? getOutputStream(options.output)
  : process.stdout;

function getInputStream(path) {
  if (!fs.existsSync(path) || fs.lstatSync(path).isDirectory()) {
    console.error('❌ Ошибка: Входной файл не существует или это директория');
    process.exit(1);
  }
  return fs.createReadStream(path, 'utf-8');
}

function getOutputStream(path) {
  try {
    return fs.createWriteStream(path, { flags: 'a' });
  } catch (e) {
    console.error('❌ Ошибка: Невозможно записать в выходной файл');
    process.exit(1);
  }
}

// ---------- Выбор задачи ----------
let transform;
switch (options.task) {
  case '1':
    transform = task1Transform();
    break;
  case '5':
    transform = task5Transform();
    break;
  default:
    console.error('❌ Ошибка: Задача не найдена');
    process.exit(1);
}

// ---------- PIPELINE ----------
await pipe(inputStream, transform, outputStream)
  .then(() => console.log('✅ Задача выполнена'))
  .catch((err) => {
    console.error('❌ Ошибка в pipeline:', err.message);
    process.exit(1);
  });