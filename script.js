const fs = require('fs')
const url = require('url')
const http = require('node:http');

async function createFile (fileName, data) {
    return fs.writeFileSync(`./data/${fileName}`, data);
}
async function readFile (fileName, data) {
    return fs.readFileSync(`./data/${fileName}`);
}

const server =  http.createServer(async function (request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');

    if (request.url === '/create' && request.method === 'POST') {
        let body = []
        request
            .on('error', err => {
                response.statusCode = 500
                response.end(`Error: ${err}`)
            })
            .on('data', chunk => body.push(chunk))
            .on('end', () => {
                body = JSON.parse(Buffer.concat(body).toString())
                createFile(body.name, JSON.stringify(body.data))
                    .then((data) => {
                        response.end('Success')
                    })
                    .catch((err) => {
                        throw err
                    })
            })
    } else if (request.method === 'GET') {
        if (request.url.includes('change')) {
            const {query} = url.parse(request.url, true);

            readFile(query.name)
                .then((data) => {
                    const jsonData = JSON.parse(data)

                    jsonData[query.item].marked = !jsonData[query.item].marked

                    createFile(query.name, JSON.stringify(jsonData))
                        .then((data) => {
                            response.end('Success')
                        })
                        .catch((err) => {
                            throw err
                        })
                })
                .catch((err) => {
                    response.statusCode = 500
                    response.end(`Error: ${err}`)
                })

        } else if (request.url.includes('table')) {
            const {query} = url.parse(request.url, true);
            readFile(query.name)
                .then((data) => {
                    response.setHeader('Content-Type', 'application/json');
                    response.end(JSON.stringify(JSON.parse(data)))
                })
                .catch((err) => {
                    response.statusCode = 500
                    response.end(`Error: ${err}`)
                })
        } else if (request.url.includes('.')) {
            console.log(request.url.slice(1))
            try {
                const file = fs.readFileSync(request.url.slice(1))

                const ContentType = request.url.includes('.css') ? 'style/css' : (
                        request.url.includes('.html') ? 'text/html' : (request.url.includes('.ico') ? 'image/vnd.microsoft.icon' : (
                                request.url.includes('.ttf') ? 'font/ttf' : (request.url.includes('.eot') ? 'application/vnd.ms-fontobject' : (request.url.includes('woff') ? 'font/woff' : 'font/woff2' ))
                            ))
                    )

                response.writeHeader(200, {"Content-Type": ContentType});
                response.write(file);
                response.end();
            } catch (e) {
                response.statusCode = 404;
                response.end();
            }
        } else {
            const file = fs.readFileSync('./index.html')

            response.writeHeader(200, {"Content-Type": 'text/html'});
            response.write(file);
            response.end();
        }
    } else {
        response.end('?')
    }
})

server.listen(3000, function(){ console.log("Сервер запущен по адресу http://localhost:3000") })
