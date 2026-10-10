'use strict'

const fs = require('fs')
const path = require('path')

const SCHEME_FILE = 'scheme.json'

function readScheme (dataDir) {
	return JSON.parse(fs.readFileSync(path.join(dataDir, SCHEME_FILE), 'utf8'))
}

function writeScheme (dataDir, scheme) {
	fs.writeFileSync(path.join(dataDir, SCHEME_FILE), JSON.stringify(scheme, null, 1))
}

function readBody (req) {
	return new Promise((resolve, reject) => {
		const chunks = []
		req.on('error', reject)
		req.on('data', chunk => chunks.push(chunk))
		req.on('end', () => {
			try {
				resolve(JSON.parse(Buffer.concat(chunks).toString()))
			} catch (e) {
				reject(e)
			}
		})
	})
}

// createApiRouter возвращает обработчик: true — запрос обработан, false — не API.
function createApiRouter (dataDir) {
	return async function handleApi (req, res, url) {
		try {
			if (req.method === 'GET' && url.pathname === '/api/scheme') {
				res.setHeader('Content-Type', 'application/json')
				res.end(JSON.stringify(readScheme(dataDir)))
				return true
			}

			if (req.method === 'POST' && url.pathname === '/api/toggle') {
				const { panel, block, item } = await readBody(req)
				const scheme = readScheme(dataDir)
				const stitch = scheme.panels[panel]?.[block]?.[item]

				if (!stitch) {
					res.statusCode = 400
					res.end('Unknown stitch')
					return true
				}

				stitch.marked = !stitch.marked
				writeScheme(dataDir, scheme)
				res.end('Success')
				return true
			}

			if (req.method === 'POST' && url.pathname === '/api/create') {
				const { name, data } = await readBody(req)

				if (!/^[\w-]+\.json$/.test(name)) {
					res.statusCode = 400
					res.end('Bad name')
					return true
				}

				fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data))
				res.end('Success')
				return true
			}
		} catch (e) {
			res.statusCode = 500
			res.end(`Error: ${e.message}`)
			return true
		}

		return false
	}
}

module.exports = { createApiRouter }
