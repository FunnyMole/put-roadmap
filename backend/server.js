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

// Синхронизируем модель с базой данных
await sequelize.sync({ force: true }); // force: true пересоздаст таблицу
console.log('✅ База данных пересоздана');

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

// Инициализация с тестовыми данными
app.post('/api/init', async (req, res) => {
  try {
    const count = await Block.count();
    
    if (count === 0) {
      // Создаем тестовые блоки с уникальными ID и задачами со статусами
      const testBlocks = [
        {
          title: 'Тайм-трекинг',
          description: 'Учёт времени на задачи',
          releaseDate: '2026-01-15',
          effort: 80,
          completed: false,
          tasks: [
            { 
              id: 't1-1', 
              title: 'Разработать интерфейс', 
              status: 'done',
              order: 0 
            },
            { 
              id: 't1-2', 
              title: 'Написать бэкенд', 
              status: 'progress',
              order: 1 
            },
            { 
              id: 't1-3', 
              title: 'Протестировать', 
              status: 'todo',
              order: 2 
            }
          ]
        },
        {
          title: 'Диаграммы Ганта',
          description: 'Визуализация сроков',
          releaseDate: '2026-01-20',
          effort: 64,
          completed: false,
          tasks: [
            { 
              id: 't2-1', 
              title: 'Спроектировать алгоритм', 
              status: 'done',
              order: 0 
            },
            { 
              id: 't2-2', 
              title: 'Реализовать отрисовку', 
              status: 'progress',
              order: 1 
            },
            { 
              id: 't2-3', 
              title: 'Оптимизировать производительность', 
              status: 'todo',
              order: 2 
            },
            { 
              id: 't2-4', 
              title: 'Написать документацию', 
              status: 'todo',
              order: 3 
            }
          ]
        },
        {
          title: 'AI-помощники',
          description: 'Автоматизация рутины',
          releaseDate: '2026-02-15',
          effort: 80,
          completed: false,
          tasks: [
            { 
              id: 't3-1', 
              title: 'Исследование рынка', 
              status: 'done',
              order: 0 
            },
            { 
              id: 't3-2', 
              title: 'Выбор модели', 
              status: 'done',
              order: 1 
            },
            { 
              id: 't3-3', 
              title: 'Интеграция API', 
              status: 'progress',
              order: 2 
            }
          ]
        },
        {
          title: 'Отчеты по проектам',
          description: 'Контроль отклонений от графика',
          releaseDate: '2026-02-28',
          effort: 48,
          completed: false,
          tasks: []
        },
        {
          title: 'Массовая работа с задачами',
          description: 'Редактирование сотен задач за минуты',
          releaseDate: '2026-03-10',
          effort: 40,
          completed: false,
          tasks: [
            { 
              id: 't5-1', 
              title: 'UI/UX дизайн', 
              status: 'todo',
              order: 0 
            }
          ]
        }
      ];
      
      // Создаем каждый блок отдельно, чтобы гарантировать уникальные ID
      for (const blockData of testBlocks) {
        await Block.create(blockData);
      }
      
      console.log('✅ Тестовые релизы с задачами созданы');
      console.log('📊 Статусы задач: done (✅), progress (⏳), todo (○)');
    }
    
    res.json({ message: 'Инициализация выполнена' });
  } catch (error) {
    console.error('Ошибка при инициализации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});