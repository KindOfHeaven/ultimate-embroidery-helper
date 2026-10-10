'use strict'

// Собирает 315 блоков data/scheme_{i}_{j}_{k}.json в один data/scheme.json.
// Структура: panels[i] = плоский массив 105 блоков (j=1..3 × k=0..34,
// порядок обхода как в старом UI). Один уровень вложенности — индексация
// в API и рендере: panels[panel][block][item].

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.resolve(__dirname, '..', 'data')

const panels = { 1: [], 2: [], 3: [] }

for (let i = 1; i <= 3; i++) {
	for (let j = 1; j <= 3; j++) {
		for (let k = 0; k <= 34; k++) {
			const name = `scheme_${i}_${j}_${k}.json`
			const block = JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'))

			if (!Array.isArray(block) || block.length !== 100) {
				throw new Error(`${name}: ожидалось 100 клеток, получено ${block && block.length}`)
			}

			panels[i].push(block)
		}
	}
}

const scheme = { scheme: '0Y12-z22', panels }

// Не затирать прогресс пользователя: живём в scheme.json, источники — снапшот.
const target = path.join(DATA_DIR, 'scheme.json')
if (fs.existsSync(target) && !process.argv.includes('--force')) {
	throw new Error('data/scheme.json уже существует — повторный запуск сотрёт отметки. Для перезаписи: node scripts/build-scheme.js --force')
}

// Self-check: собранный массив обязан совпадать с файлами 1-в-1
const flat = (i, j, k) => panels[i][(j - 1) * 35 + k]

for (let i = 1; i <= 3; i++) {
	for (let j = 1; j <= 3; j++) {
		for (let k = 0; k <= 34; k++) {
			const source = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `scheme_${i}_${j}_${k}.json`), 'utf8'))
			const merged = flat(i, j, k)
			for (let cell = 0; cell < 100; cell++) {
				if (JSON.stringify(source[cell]) !== JSON.stringify(merged[cell])) {
					throw new Error(`Расхождение: panels[${i}][${(j - 1) * 35 + k}][${cell}]`)
				}
			}
		}
	}
}

fs.writeFileSync(target, JSON.stringify(scheme, null, 1))

// Self-check записанного: прочитанный с диска файл обязан совпасть с памятью
if (JSON.stringify(JSON.parse(fs.readFileSync(target, 'utf8'))) !== JSON.stringify(scheme)) {
	throw new Error('записанный scheme.json не совпадает с собранным')
}

console.log(`migration OK: 315 блоков, 31500 стежков сверены`)
