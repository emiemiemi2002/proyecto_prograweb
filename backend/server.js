const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Configuración de MySQL (la misma que usas para el login)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'proyecto_prograweb',
  waitForConnections: true,
  connectionLimit: 10
});

// --- RUTAS --- //

// 1. Ruta de login (existente)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND contraseña = ?',
      [username, password]
    );
    if(rows.length > 0){
      res.json({ success: true, message: 'Login exitoso', id: rows[0].id_usuario })
      console.log(rows[0]);
    }else{
      res.status(400).json({ error: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// 2. Ruta para crear recordatorios
app.post('/api/recordatorios', async (req, res) => {
  console.log("test");
  const {
    nombre_medicamento,
    dosis,
    frecuencia,
    hora_programada,
    fecha_inicio,
    fecha_fin,
    id_usuario
  } = req.body;

  // Validación básica
  if (!nombre_medicamento || !dosis || !frecuencia || !hora_programada || !fecha_inicio || !id_usuario) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO recordatorios SET ?`,
      {
        id_usuario,
        nombre_medicamento,
        dosis,
        frecuencia,
        hora_programada,
        fecha_inicio,
        fecha_fin: fecha_fin || null,
        metodo_notificacion: 'correo', // Valor por defecto
        estado: 'activo'
      }
    );
    
    res.json({ 
      success: true,
      id: result.insertId,
      message: 'Recordatorio creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear recordatorio:', error);
    res.status(500).json({ error: 'Error al guardar el recordatorio' });
  }
});

// 3. Ruta para obtener recordatorios por usuario
// 3. Ruta para obtener recordatorios por usuario (actualizada)
app.get('/api/recordatorios/:id_usuario', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id_recordatorio,
        id_usuario,
        nombre_medicamento,
        dosis,
        frecuencia,
        TIME_FORMAT(hora_programada, '%H:%i') as hora_programada,
        DATE_FORMAT(fecha_inicio, '%Y-%m-%d') as fecha_inicio,
        DATE_FORMAT(fecha_fin, '%Y-%m-%d') as fecha_fin,
        metodo_notificacion,
        estado
       FROM recordatorios 
       WHERE id_usuario = ? AND estado = 'activo'
       ORDER BY fecha_inicio, hora_programada`,
      [req.params.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    res.status(500).json({ error: 'Error al cargar recordatorios' });
  }
});

// 4. Ruta para actualizar recordatorios
app.put('/api/recordatorios/:id', async (req, res) => {
  const {
    nombre_medicamento,
    dosis,
    frecuencia,
    hora_programada,
    fecha_inicio,
    fecha_fin
  } = req.body;
console.log(req.body);
  // Validación básica
  if (!nombre_medicamento || !dosis || !frecuencia || !hora_programada || !fecha_inicio) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE recordatorios SET 
        nombre_medicamento = ?,
        dosis = ?,
        frecuencia = ?,
        hora_programada = ?,
        fecha_inicio = ?,
        fecha_fin = ?
       WHERE id_recordatorio = ?`,
      [
        nombre_medicamento,
        dosis,
        frecuencia,
        hora_programada,
        fecha_inicio,
        fecha_fin || null,
        req.params.id
      ]
    );
    
    res.json({ 
      success: true,
      message: 'Recordatorio actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar recordatorio:', error);
    res.status(500).json({ error: 'Error al actualizar el recordatorio' });
  }
});

// 5. Ruta para obtener un recordatorio específico
app.get('/api/recordatorios/single/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id_recordatorio,
        nombre_medicamento,
        dosis,
        frecuencia,
        TIME_FORMAT(hora_programada, '%H:%i') as hora_programada,
        DATE_FORMAT(fecha_inicio, '%Y-%m-%d') as fecha_inicio,
        DATE_FORMAT(fecha_fin, '%Y-%m-%d') as fecha_fin
       FROM recordatorios 
       WHERE id_recordatorio = ?`,
      [req.params.id]
    );
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Recordatorio no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener recordatorio:', error);
    res.status(500).json({ error: 'Error al cargar el recordatorio' });
  }
});

// 6. Ruta para eliminar recordatorios (borrado lógico)
app.delete('/api/recordatorios/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE recordatorios SET estado = 'inactivo' WHERE id_recordatorio = ?`,
      [req.params.id]
    );
    console.log(req.params.id);
    
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Recordatorio eliminado exitosamente' });
    } else {
      res.status(404).json({ error: 'Recordatorio no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    res.status(500).json({ error: 'Error al eliminar el recordatorio' });
  }
});

// Endpoint de registro
app.post('/api/registro', async (req, res) => {
  const { nombre, apellido, telefono, email, direccion, password } = req.body;

  // Validación básica
  if (!nombre || !apellido || !telefono || !direccion || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Todos los campos obligatorios deben ser completados' 
    });
  }

  // Validar formato de teléfono (10 dígitos)
  if (!/^\d{10}$/.test(telefono)) {
    return res.status(400).json({
      success: false,
      error: 'El teléfono debe tener 10 dígitos'
    });
  }

  // Validar contraseña (mínimo 8 caracteres)
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'La contraseña debe tener al menos 8 caracteres'
    });
  }

  try {
    // Verificar si el correo ya está registrado (si se proporcionó)
    if (email) {
      const [emailRows] = await pool.query(
        'SELECT id_usuario FROM usuarios WHERE email = ?',
        [email]
      );
      
      if (emailRows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'El correo electrónico ya está registrado'
        });
      }
    }

    // Verificar si el teléfono ya está registrado
    const [telefonoRows] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE telefono = ?',
      [telefono]
    );
    
    if (telefonoRows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'El número de teléfono ya está registrado'
      });
    }


    // Insertar nuevo usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios 
       (nombre, apellido, telefono, email, direccion, contraseña)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, telefono, email || null, direccion, password]
    );

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor al procesar el registro',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});