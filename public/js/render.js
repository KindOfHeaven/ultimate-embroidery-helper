'use strict'

// far — иконки Font Awesome из набора Regular (остальные рисуются Solid),
// список перенесён из старого кода без изменений.
const FAR = new Set([
	'fa-moon', 'fa-arrow-alt-circle-up', 'fa-heart', 'fa-star', 'fa-minus-square',
	'fa-gem', 'fa-play-circle', 'fa-hand-paper', 'fa-calendar-plus', 'fa-lightbulb',
	'fa-grin', 'fa-eye', 'fa-hourglass', 'fa-hand-lizard', 'fa-hdd', 'fa-hand-peace',
	'fa-map', 'fa-paper-plane', 'fa-square', 'fa-bell', 'fa-envelope', 'fa-life-ring',
	'fa-save', 'fa-snowflake', 'fa-thumbs-up', 'fa-user', 'fa-folder-open', 'fa-bookmark',
])

function createBlockStub () {
	// Заготовка блока 10×10: <table><tr><td><div></div></td>…</table>
	const cell = document.createElement('td')
	const div = document.createElement('div')
	cell.appendChild(div)

	const row = document.createElement('tr')
	for (let i = 0; i < 10; i++) row.appendChild(cell.cloneNode(true))

	const tbody = document.createElement('tbody')
	for (let i = 0; i < 10; i++) tbody.appendChild(row.cloneNode(true))

	const table = document.createElement('table')
	table.appendChild(tbody)
	return table
}

function drawBlock (block, panel, blockIdx) {
	const table = createBlockStub()

	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			const item = i * 10 + j
			const stitch = block[item]
			const td = table.querySelector(`tr:nth-child(${i + 1}) > td:nth-child(${j + 1})`)
			const div = td.querySelector('div')

			td.setAttribute('data-panel', panel)
			td.setAttribute('data-block', blockIdx)
			td.setAttribute('data-item', item)

			if (!stitch) continue

			div.style.backgroundColor = stitch.color

			if (stitch.marked) div.classList.add('marked')

			if (stitch.icon && stitch.icon.length > 1) {
				const icon = document.createElement('i')
				icon.className = `${FAR.has(stitch.icon) ? 'far' : 'fas'} ${stitch.icon}`
				div.appendChild(icon)
			} else {
				div.innerText = stitch.icon || ''
			}
		}
	}

	return table
}

function renderPanel (panelBlocks, panel, app) {
	// 105 блоков панели = 3 таблицы × 35 (7 рядов × 5 колонок), как в старом UI
	for (let tableIdx = 0; tableIdx < 3; tableIdx++) {
		const panelTable = document.createElement('table')
		panelTable.className = 'scheme'
		const tbody = document.createElement('tbody')

		for (let r = 0; r < 7; r++) {
			const tr = document.createElement('tr')
			for (let c = 0; c < 5; c++) {
				const td = document.createElement('td')
				const blockIdx = tableIdx * 35 + r * 5 + c
				td.appendChild(drawBlock(panelBlocks[blockIdx], panel, blockIdx))
				tr.appendChild(td)
			}
			tbody.appendChild(tr)
		}

		panelTable.appendChild(tbody)
		app.appendChild(panelTable)
	}
}

// Рисует всю схему во фрагмент и вставляет в DOM одной операцией.
function renderScheme (scheme, app) {
	const fragment = document.createDocumentFragment()

	for (const [panel, panelBlocks] of Object.entries(scheme.panels)) {
		renderPanel(panelBlocks, panel, fragment)
	}

	app.appendChild(fragment)
}

export { renderScheme }
