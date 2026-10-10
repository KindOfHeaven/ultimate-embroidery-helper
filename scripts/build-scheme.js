'use strict'

// Собирает 315 блоков data/scheme_{i}_{j}_{k}.json в один data/scheme.json
// в ТОМ ЖЕ порядке обхода, что и старый UI (i,j = 1..3, k = 0..34),
// и сверяет результат cell-by-cell с исходниками.

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.resolve(__dirname, '..', 'data')

const panels = {}
let blockCount = 0

for (let i = 1; i <= 3; i++) {
	panels[i] = {}
	for (let j = 1; j <= 3; j++) {
		panels[i][j] = []
		for (let k = 0; k <= 34; k++) {
			const name = `scheme_${i}_${j}_${k}.json`
			const block = JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'))

			if (!Array.isArray(block) || block.length !== 100) {
				throw new Error(`${name}: ожидалось 100 клеток, получено ${block && block.length}`)
			}

			panels[i][j].push(block)
			blockCount++
		}
	}
}

const scheme = { scheme: '0Y12-z22', panels }

// Self-check: собранный массив обязан совпадать с файлами 1-в-1
let checked = 0
for (let i = 1; i <= 3; i++) {
	for (let j = 1; j <= 3; j++) {
		for (let k = 0; k <= 34; k++) {
			const source = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `scheme_${i}_${j}_${k}.json`), 'utf8'))
			const merged = scheme.panels[i][j][k]
			for (let cell = 0; cell < 100; cell++) {
				if (JSON.stringify(source[cell]) !== JSON.stringify(merged[cell])) {
					throw new Error(`Расхождение: panels[${i}][${j}][${k}][${cell}]`)
				}
			}
			checked++
		}
	}
}

fs.writeFileSync(path.join(DATA_DIR, 'scheme.json'), JSON.stringify(scheme, null, 1))

console.log(`migration OK: ${blockCount} блоков, ${checked * 100} стежков сверены`)
