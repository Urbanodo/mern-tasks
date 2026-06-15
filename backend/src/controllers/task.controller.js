const Task = require('../models/Task');

const getTasks = async (req, res) => {
  try {
    const { status, priority, search, sort } = req.query;
    const filter = { userId: req.user._id };

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

    const tasks = await Task.find(filter).sort(sortBy);
    res.json({ tasks, count: tasks.length });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const createTask = async (req, res) => {
  const { title, description, dueDate, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'Le titre est obligatoire.' });
  try {
    const task = await Task.create({
      userId: req.user._id,
      title, description, dueDate, priority
    });
    res.status(201).json({ task });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Tâche introuvable.' });
    res.json({ task });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!task) return res.status(404).json({ error: 'Tâche introuvable.' });
    res.json({ message: 'Tâche supprimée.' });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
