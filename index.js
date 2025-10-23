const express = require("express");
const app = express();
const port = 3000;

// Vistas
app.use(express.json());
app.set("view engine", "ejs");

// Dependencias
const admin = require("firebase-admin");
const cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Credenciales Firebase
const serviceAccount = require("./firebase_key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// RUTA PRINCIPAL: redirige a /productos
app.get("/", (req, res) => {
  res.redirect("/productos");
});

// MOSTRAR PRODUCTOS
app.get("/productos", async (req, res) => {
  try {
    const items = await db.collection("productos").get();
    const productos = items.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        imagen: data.imagen,
      };
    });

    res.render("inicio", { productos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FORMULARIO PARA CREAR PRODUCTO
app.get("/productos/add", (req, res) => {
  res.render("form", { producto: null, nombre: "Crear producto" });
});

// GUARDAR NUEVO PRODUCTO
app.post("/productos", async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen } = req.body;
    const nuevoProducto = {
      nombre: nombre || '',
      descripcion,
      precio: parseFloat(precio) || 0,
      imagen: imagen || '',
    };

    await db.collection("productos").add(nuevoProducto);
    res.redirect("/productos");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
