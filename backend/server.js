import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем подключение к SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: join(__dirname, 'database.sqlite'),
  logging: false
});

// Определяем модель блока
const Block = sequelize.define('Block', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Новый релиз'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  releaseDate: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0];
    }
  },
  effort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  tasks: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('tasks');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('tasks', JSON.stringify(value));
    }
  }
}, {
  timestamps: true
});

// Синхронизация
await sequelize.sync();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// API ENDPOINTS
// ==========================================

// Получить все блоки
app.get('/api/blocks', async (req, res) => {
  try {
    const blocks = await Block.findAll({
      order: [['releaseDate', 'ASC']]
    });
    res.json(blocks);
  } catch (error) {
    console.error('Ошибка при получении блоков:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новый блок
app.post('/api/blocks', async (req, res) => {
  try {
    const newBlock = await Block.create({
      title: req.body.title || 'Новый релиз',
      description: req.body.description || '',
      releaseDate: req.body.releaseDate || new Date(2026, 0, 15).toISOString().split('T')[0],
      effort: req.body.effort || 0,
      completed: req.body.completed || false,
      tasks: req.body.tasks || []
    });
    
    res.status(201).json(newBlock);
  } catch (error) {
    console.error('Ошибка при создании блока:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить блок
app.put('/api/blocks/:id', async (req, res) => {
  try {
    const block = await Block.findByPk(req.params.id);
    
    if (!block) {
      return res.status(404).json({ error: 'Блок не найден' });
    }
    
    await block.update(req.body);
    res.json(block);
  } catch (error) {
    console.error('Ошибка при обновлении блока:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить блок
app.delete('/api/blocks/:id', async (req, res) => {
  try {
    const block = await Block.findByPk(req.params.id);
    
    if (!block) {
      return res.status(404).json({ error: 'Блок не найден' });
    }
    
    await block.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении блока:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ИНИЦИАЛИЗАЦИЯ - проверка соединения с БД
app.post('/api/init', async (req, res) => {
  try {
    // Проверяем соединение с БД
    await sequelize.authenticate();
    console.log('✅ База данных готова');
    
    // Проверяем, есть ли записи
    const count = await Block.count();
    console.log(`📊 В базе ${count} записей`);
    
    res.json({ success: true, message: 'Инициализация завершена' });
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});