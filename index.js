import http from 'node:http';
import fs from 'node:fs/promises';
import mysql2 from 'mysql2';

const pool = mysql2.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'miniproyecto',
});

const obtenerUsuarios = async () => {
  const [rows] = await pool.promise().query('SELECT * FROM usuarios');
  return rows;
};

const exportarUsuariosCSV = async () => {
  try {
    const usuarios = await obtenerUsuarios();
    const csvContent = usuarios
      .map(user => Object.values(user).join(','))
      .join('\n');
    const filePath = './usuarios.csv';  
    await fs.writeFile(filePath, csvContent);
    console.log('Usuarios exportados a usuarios.csv');
  } catch (error) {
    console.error('Error al exportar usuarios a CSV:', error);
    throw error;
  }
};

const importarUsuariosCSV = async () => {
  try {
    const inputStream = fs.createReadStream('./usuarios.csv'); 
    const rl = require('readline').createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      const data = line.split(',');
      console.log(data);
      // Aquí puedes procesar cada línea de datos e insertar en la base de datos
    }

    console.log('Datos importados exitosamente');
  } catch (error) {
    console.error('Error al importar usuarios:', error);
    throw error;
  }
};

const server = http.createServer(async (req, res) => {
  const { url, method } = req;

  if (url === '/') {
    try {
      const filePath = './home.html';
      const fileContent = await fs.readFile(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fileContent);
    } catch (error) {
      console.error('Error al leer el archivo HTML:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error interno del servidor');
    }
  } else if (url === '/api/usuarios' && method === 'GET') {
    try {
      const usuarios = await obtenerUsuarios();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(usuarios));
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error al obtener usuarios');
    }
  } else if (url === '/api/usuarios/export' && method === 'GET') {
    try {
      await exportarUsuariosCSV();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Usuarios exportados a usuarios.csv');
    } catch (error) {
      console.error('Error al exportar usuarios a CSV:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error al exportar usuarios a CSV');
    }
  } else if (url === '/api/usuarios/import' && method === 'POST') {
    try {
      await importarUsuariosCSV();
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Datos importados exitosamente');
    } catch (error) {
      console.error('Error al importar usuarios:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error al importar usuarios');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Ruta no encontrada' }));
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
