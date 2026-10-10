'use strict'

export async function getScheme () {
	const res = await fetch('/api/scheme')
	if (!res.ok) throw new Error(`scheme load failed: ${res.status}`)
	return res.json()
}

export async function toggleStitch (panel, block, item) {
	const res = await fetch('/api/toggle', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ panel, block, item }),
	})
	if (!res.ok) throw new Error(`toggle failed: ${res.status}`)
}
