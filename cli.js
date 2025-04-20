// cli.js
import { Command } from 'commander';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import readline from 'readline';
import { Writable, Readable } from 'stream';

import task1Transform from './transforms/task1Transform.js';
import taskArrayDiffTransform from './transforms/taskArrayDiffTransform.js';

const program = new Command();

program
  .requiredOption('-t, --task <number>', 'Номер задачи для выполнения')
  .option('-i, --input <path>', 'Путь к входному файлу')
  .option('-o, --output <path>', 'Путь к выходному файлу');

program.parse(process.argv);
const options = program.opts();

// ------------------ Выбор задачи ------------------
let transform;

switch (options.task) {
  case '1':
    transform = task1Transform();
    break;
  case '100':
    transform = taskArrayDiffTransform();
    break;
  default:
    console.error(`❌ Задача с номером ${options.task} не реализована`);
    process.exit(1);
}

// ------------------ Потоки ------------------

function getInputStream(path) {
  if (!fs.existsSync(path) || fs.lstatSync(path).isDirectory()) {
    console.error(`❌ Ошибка: Файл "${path}" не существует или это директория`);
    process.exit(1);
  }
  return fs.createReadStream(path, 'utf-8');
}

function getOutputStream(path) {
  try {
    return fs.createWriteStream(path, { flags: 'a' });
  } catch (err) {
    console.error(`❌ Ошибка записи в файл "${path}": ${err.message}`);
    process.exit(1);
  }
}

// ------------------ REPL-safe stdout ------------------
const safeStdout = new Writable({
  write(chunk, encoding, callback) {
    process.stdout.write(chunk, encoding, callback);
  }
});

// ------------------ Режим: Чтение из файла ------------------

if (options.input) {
  const input = getInputStream(options.input);
  const output = options.output ? getOutputStream(options.output) : process.stdout;

  pipeline(input, transform, output)
    .then(() => console.log('✅ Задача успешно выполнена'))
    .catch(err => {
      console.error('❌ Ошибка обработки:', err.message);
      process.exit(1);
    });
}

// ------------------ Режим: stdin (REPL) ------------------

else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Ввод: '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const inputStream = Readable.from([line]);
    const output = options.output ? getOutputStream(options.output) : safeStdout;

    try {
      await pipeline(inputStream, transform, output);
    } catch (err) {
      console.error('❌ Ошибка обработки:', err.message);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('👋 Завершение работы');
    process.exit(0);
  });
}
