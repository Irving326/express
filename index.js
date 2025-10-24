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

// --- Ver un producto por ID envía a detalle.ejs
app.get('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('productos').doc(id).get();
    if (!doc.exists) {
      return res.status(404).render('404', { mensaje: 'Producto no encontrado' }); // opcional
    }
    const data = doc.data();
    const producto = {
      id: doc.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      imagen: data.imagen
    };
    res.render('detalle', { producto });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el producto');
  }
});

// Elimina el producto y redirige al listado
app.post('/productos/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection('productos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).send('Producto no encontrado');
    }
    await docRef.delete();
    // redirige al listado
    res.redirect('/productos');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el producto');
  }
});





// por metodo DELETE (API)
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = db.collection('productos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Producto no encontrado' });
    await docRef.delete();
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});






app.listen(port, () => {
  console.log('Servidor inicializado en http://localhost:' + port);
});