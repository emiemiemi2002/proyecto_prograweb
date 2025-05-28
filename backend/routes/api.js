const express = require('express');
const router = express.Router();
const remindersController = require('../controllers/reminders');
const authMiddleware = require('../middleware/auth');

// Protege todas las rutas con autenticación
router.use(authMiddleware);

// Rutas para recordatorios
router.post('/reminders', remindersController.createReminder);
router.get('/reminders', remindersController.getUserReminders);
router.put('/reminders/:id', remindersController.updateReminder);
router.delete('/reminders/:id', remindersController.deleteReminder);

module.exports = router;