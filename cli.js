// cli.js
import { Command } from 'commander';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import task1Transform from './transforms/task1Transform.js';
import readline from 'readline';

const program = new Command();

program
  .requiredOption('-t, --task <number>', 'номер задачи (только 1 реализован)')
  .option('-i, --input <path>', 'входной файл')
  .option('-o, --output <path>', 'выходной файл');

program.parse(process.argv);
const options = program.opts();

// ---------- ВЫБОР ЗАДАЧИ ----------
let transform;
if (options.task === '1') {
  transform = task1Transform();
} else {
  console.error('❌ Поддерживается только задача 1 (номер телефона)');
  process.exit(1);
}

// ---------- ВХОД ----------

function getInputStream(path) {
  if (!fs.existsSync(path) || fs.lstatSync(path).isDirectory()) {
    console.error(`❌ Файл "${path}" не найден или это директория`);
    process.exit(1);
  }
  return fs.createReadStream(path, 'utf-8');
}

// ---------- ВЫХОД ----------

function getOutputStream(path) {
  try {
    return fs.createWriteStream(path, { flags: 'a' });
  } catch (err) {
    console.error(`❌ Невозможно записать в "${path}": ${err.message}`);
    process.exit(1);
  }
}

// ---------- ФАЙЛОВЫЙ РЕЖИМ ----------
if (options.input) {
  const input = getInputStream(options.input);
  const output = options.output ? getOutputStream(options.output) : process.stdout;

  pipeline(input, transform, output)
    .then(() => console.log('✅ Задача выполнена'))
    .catch(err => {
      console.error('❌ Ошибка обработки:', err.message);
      process.exit(1);
    });
}

// ---------- REPL РЕЖИМ ----------
else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Введи массив чисел: '
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const inputStream = ReadableFromString(line);
    const output = options.output ? getOutputStream(options.output) : process.stdout;

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

// ---------- Вспомогательная функция ----------
import { Readable } from 'stream';
function ReadableFromString(str) {
  return Readable.from([str]);
}