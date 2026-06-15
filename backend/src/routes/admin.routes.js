const express = require('express');
const { getAllTasks } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/tasks', getAllTasks);

module.exports = router;