const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const db = require('./db');
const User = require('./models/User');
const Address = require('./models/Address');


function serveStaticFiles(req, res) {
  if (req.url === '/') {
    fs.readFile('./views/form.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading form.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/styles.css') {
    fs.readFile('./public/styles.css', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading styles.css');
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
  }
}


function handleFormSubmission(req, res) {
  if (req.method === 'POST' && req.url === '/submit') {
    let body = '';

    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const formData = querystring.parse(body);

      
      const { name, street, city, country } = formData;

      try {
        
        const user = await User.create({ name });
        await Address.create({
          street,
          city,
          country,
          UserId: user.id,
        });

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Data saved successfully!</h1>');
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Error saving data</h1>');
      }
    });
  }
}


const server = http.createServer((req, res) => {
  if (req.method === 'GET' || req.method === 'POST') {
    serveStaticFiles(req, res);
    handleFormSubmission(req, res);
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});


db.sync().then(() => {
  server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
