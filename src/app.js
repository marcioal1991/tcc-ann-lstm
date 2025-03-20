import http from 'http';

const server = http.createServer((req, res) => {
    res.write('Hello, Docker!');
    res.end();
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});