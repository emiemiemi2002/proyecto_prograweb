const Reminder = require('../models/reminder');

exports.createReminder = async (req, res) => {
  try {
    // Validación básica
    const { nombre_medicamento, dosis, frecuencia, hora_programada, fecha_inicio } = req.body;
    
    if (!nombre_medicamento || !dosis || !frecuencia || !hora_programada || !fecha_inicio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const reminderData = {
      id_usuario: req.user.id, // Asume que el usuario está autenticado
      nombre_medicamento,
      dosis,
      frecuencia,
      hora_programada,
      fecha_inicio,
      fecha_fin: req.body.fecha_fin || null,
      metodo_notificacion: req.body.metodo_notificacion || 'correo'
    };

    const reminderId = await Reminder.create(reminderData);
    res.status(201).json({ 
      success: true, 
      message: 'Recordatorio creado', 
      id: reminderId 
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear recordatorio' });
  }
};

exports.getUserReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findByUser(req.user.id);
    res.json(reminders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener recordatorios' });
  }
};

// Otros métodos (update, delete) similares...