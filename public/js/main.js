'use strict'

import { getScheme, toggleStitch } from './api.js'
import { renderScheme } from './render.js'

const SAVE_DELAY = 300

// Оптимистичный UI: клик тогглит класс сразу, сохранение на сервер — пачкой.
// pending хранит ключи клеток, ожидающих записи.
const pending = new Set()
let saveTimer = null

function flushSaves () {
	clearTimeout(saveTimer)
	saveTimer = null

	const batch = [...pending]
	pending.clear()
	for (const key of batch) {
		const [panel, block, item] = key.split(':').map(Number)
		toggleStitch(panel, block, item).catch(err => {
			// Возвращаем клетку в очередь — запись не дошла
			pending.add(key)
			console.error('save failed, will retry on next click/flush:', err)
		})
	}
}

function scheduleSave () {
	clearTimeout(saveTimer)
	saveTimer = setTimeout(flushSaves, SAVE_DELAY)
}

document.addEventListener('DOMContentLoaded', async () => {
	const app = document.getElementById('app')

	try {
		const scheme = await getScheme()
		renderScheme(scheme, app)
	} catch (err) {
		document.getElementById('loading').innerText = 'Не удалось загрузить схему: ' + err.message
		return
	}

	const loading = document.getElementById('loading')
	loading.parentNode.removeChild(loading)

	// Один обработчик на всю сетку вместо ~25 000 индивидуальных
	app.addEventListener('click', e => {
		const td = e.target.closest('td[data-item]')
		if (!td || !td.querySelector('div').style.backgroundColor) return

		const key = `${td.dataset.panel}:${td.dataset.block}:${td.dataset.item}`
		pending.add(key)
		td.querySelector('div').classList.toggle('marked')
		scheduleSave()
	})

	// Не терять последние клики при закрытии/уходе со страницы
	window.addEventListener('pagehide', flushSaves)
})
