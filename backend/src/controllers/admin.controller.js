const Task = require('../models/Task');
const User = require('../models/User');

const getAllTasks = async (req, res) => {
  try {
    const { status, priority, search, sort, userId } = req.query;
    const filter = {};

    if (userId)   filter.userId   = userId;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (search)   filter.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];

    const sortOptions = {
      'dueDate':   { dueDate: 1 },
      'priority':  { priority: -1 },
      'createdAt': { createdAt: -1 },
      'title':     { title: 1 }
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const tasks = await Task.find(filter).sort(sortBy).populate('userId', 'name email');
    const users = await User.find({}, 'name email isAdmin');

    const stats = {
      total:      tasks.length,
      todo:       tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed:  tasks.filter(t => t.status === 'completed').length,
      totalUsers: users.length
    };

    res.json({ tasks, users, stats });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

module.exports = { getAllTasks };