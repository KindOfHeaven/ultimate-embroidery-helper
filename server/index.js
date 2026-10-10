'use strict'

const http = require('http')
const path = require('path')
const url = require('url')

const { createApiRouter } = require('./api')
const { serveStatic } = require('./static')

const PORT = 3000
const HOST = '127.0.0.1'
const ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const DATA_DIR = path.join(ROOT, 'data')

const handleApi = createApiRouter(DATA_DIR)

const server = http.createServer(async function (req, res) {
	const parsed = url.parse(req.url, true)

	if (await handleApi(req, res, parsed)) return

	let urlPath = parsed.pathname
	if (urlPath === '/' || !urlPath.includes('.')) urlPath = '/index.html'

	serveStatic(PUBLIC_DIR, urlPath, res)
})

server.listen(PORT, HOST, function () {
	console.log(`Сервер запущен по адресу http://${HOST}:${PORT}`)
})
