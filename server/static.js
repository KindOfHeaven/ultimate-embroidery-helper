'use strict'

const fs = require('fs')
const path = require('path')

const CONTENT_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.ico': 'image/vnd.microsoft.icon',
	'.ttf': 'font/ttf',
	'.eot': 'application/vnd.ms-fontobject',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.svg': 'image/svg+xml',
}

// Отдаёт файл из rootDir или пишет 403/404. Путь жёстко ограничен rootDir:
// иначе GET /../.. прочитал бы любой файл пользователя.
function serveStatic (rootDir, urlPath, res) {
	const relative = path.normalize(decodeURIComponent(urlPath)).replace(/^([/\\]|\.\.)+/, '')
	const filePath = path.resolve(rootDir, relative)

	if (!filePath.startsWith(path.resolve(rootDir) + path.sep)) {
		res.statusCode = 403
		return res.end('Forbidden')
	}

	try {
		const file = fs.readFileSync(filePath)
		res.writeHeader(200, { 'Content-Type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' })
		res.end(file)
	} catch (e) {
		res.statusCode = 404
		res.end('Not found')
	}
}

module.exports = { serveStatic, CONTENT_TYPES }
