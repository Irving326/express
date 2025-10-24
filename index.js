const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

//motor de vistas
app.set('view engine', 'ejs');

//express
const admin = require("firebase-admin");
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));

/*
const serviceAccount = require("./firebase_key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
*/
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Si está en Render, se carga desde la variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  // Si estás en local, se usa el archivo
  serviceAccount = require('./firebase_key.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const db = admin.firestore();// Rutas de la API de productos
 


app.get("/productos", async (req, res) => {
  try {
    const items = await db.collection("productos").get();
    const productos = items.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        imagen: data.imagen
      };
    });
    res.render('inicio', { productos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/productos/add', (req, res) => {
res.render('form', { producto: null, nombre: 'Crear Producto' });
});
app.post('/productos', async (req, res) => {
try {
    const { nombre, precio, descripcion, imagen } = req.body;
    const nuevo = {
    nombre: nombre || '',
    precio: parseFloat(precio) || 0,
    descripcion,
    imagen: imagen || ''
};
await db.collection('productos').add(nuevo);
res.redirect('/productos');
} catch (err) {
    console.error(err);
    res.status(500).send('Error al crear producto');
}
});



 app.get('/productos1', (req, res) => {
  const productos = [
    {
      nombre: 'Audífonos Bluetooth',
      descripcion: 'Sonido de alta calidad y cancelación de ruido.',
      precio: 899.99,
      imagen: 'https://picsum.photos/200'
    },
    {
      nombre: 'Smartwatch Pro',
      descripcion: 'Controla tu salud y recibe notificaciones.',
      precio: 1299.50,
      imagen: 'https://picsum.photos/200?2'
    },
    {
      nombre: 'Cámara 4K',
      descripcion: 'Captura tus momentos con resolución ultra HD.',
      precio: 4999.00,
      imagen: 'https://picsum.photos/200?3'
    }
  ];
  res.render('inicio', { productos });
});


app.listen(port, () => {
  console.log('Servidor inicializado en http://localhost:' + port);
});