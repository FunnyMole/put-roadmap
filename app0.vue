<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden;
  padding: 12px 16px;
}

/* ШАПКА */
.header {
  flex-shrink: 0;
  margin-bottom: 10px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header h1 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
}

.header h1 span {
  color: #3b82f6;
}

.quote {
  font-size: 0.85rem;
  color: #64748b;
  background: white;
  padding: 4px 12px;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
}

.btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-danger {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

.btn-danger:hover {
  background: #fecaca;
  color: #dc2626;
}

/* Обновленная статистика */
.statistics-top {
  display: flex;
  gap: 20px;
  padding: 10px 16px;
  background: white;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;
  font-size: 0.85rem;
  flex-wrap: wrap;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 20px;
  background: #f8fafc;
  transition: all 0.2s;
}

.stat-item:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 1rem;
}

.stat-label {
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-weight: 700;
  color: #0f172a;
  background: white;
  padding: 2px 8px;
  border-radius: 30px;
  min-width: 40px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* Специальные цвета для разных метрик */
.stat-item:nth-child(1) .stat-value { color: #3b82f6; } /* Этапы - синий */
.stat-item:nth-child(2) .stat-value { color: #22c55e; } /* Выполнено - зеленый */
.stat-item:nth-child(3) .stat-value { color: #eab308; } /* В работе - желтый */
.stat-item:nth-child(4) .stat-value { color: #64748b; } /* Всего задач - серый */
.stat-item:nth-child(5) .stat-value { color: #22c55e; } /* Задач выполнено - зеленый */
.stat-item:nth-child(6) .stat-value { 
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  color: white;
}
/* Навигация по месяцам/кварталам */
.nav-months {
  display: flex;
  gap: 4px;
  align-items: center;
  background: white;
  padding: 6px 12px;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
  margin-bottom: 10px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}

.nav-months::-webkit-scrollbar {
  display: none;
}

.nav-month {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border: none;
  background: transparent;
  position: relative;
}

.nav-month.active {
  background: #eef2ff;
  color: #3b82f6;
  font-weight: 600;
}

.month-count {
  background: #3b82f6;
  color: white;
  padding: 2px 6px;
  border-radius: 20px;
  font-size: 0.7rem;
  margin-left: 4px;
}

.nav-controls {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.nav-btn {
  width: 26px;
  height: 26px;
  border-radius: 13px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background: #f1f5f9;
}

/* ОСНОВНОЙ КОНТЕНТ */
.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding-left: 0px;
}

/* Шапка периодов */
.months-header {
  flex-shrink: 0;
  height: 50px;
  background: white;
  border-bottom: 2px solid #3b83f661;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  position: relative;
}

.months-header::-webkit-scrollbar {
  display: none;
}

.months-header-container {
  position: relative;
  height: 100%;
  min-width: 100%;
}


.month-sub {
  font-size: 0.7rem;
  font-weight: 400;
  color: #94a3b8;
}

/* Контейнер с прокруткой */
.timeline-wrapper {
  flex: 1;
  overflow: auto;
  padding: 25px 12px 16px 16px;
  position: relative;
  background: #ffffff;
}

.timeline-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.timeline-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
}

.timeline-wrapper::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 8px;
}

.timeline-container {
  position: relative;
  min-width: min-content;
  padding-left: 20px;
  
}

/* СЕТКА */
.timeline-grid {
  background-image: none !important;
  background-color: transparent !important;
  position: relative;
  z-index: 1;
}

/* Вертикальные разделители месяцев */
.month-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: transparent; /* синий цвет для наглядности */
  opacity: 0.2;
  pointer-events: none;
  z-index: 5;
  transform: translateX(-1px); /* центрируем по границе */
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.3);
  
  
}
/* Горизонтальные линии рядов */
.row-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #cbd5e1;
  opacity: 0.2;
  pointer-events: none;
  z-index: 1;
}

/* Шапка месяцев */
.month-header-cell {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #162132;
  border-right: 1px solid #a9aff194; /* светлая граница */
  background: white;
  box-sizing: border-box;
}

/* Последняя ячейка без границы */
.month-header-cell:last-child {
  border-right: none;
}

/* БЛОКИ */
.block {
  position: absolute;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  transition: all 0.15s;
  z-index: 20;
  min-width: 150px;
  max-height: 600px;
  overflow: auto;
  font-size: 0.8rem;
  padding: 8px 10px;
  box-sizing: border-box;
  cursor: pointer;
  transform: none; 
   overflow: visible !important; /* разрешить выход за границы */
}

.block:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  z-index: 20;
}

.block-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.block-title-container {
  display: flex;
  gap: 4px;
  flex: 1;
}

.block-priority {
  font-size: 0.9rem;
  width: 14px;
  text-align: center;
}

.priority-low { color: #22c55e; }
.priority-medium { color: #eab308; }
.priority-high { color: #f97316; }
.priority-critical { 
  color: #ef4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.block-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #0f172a;
  word-break: break-word;
  line-height: 1.3;
  margin: 0;
}

.block-badge {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 30px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 4px;
}

.block-description {
  display: flex;
  gap: 4px;
  font-size: 0.75rem;
  color: #475569;
  margin-bottom: 6px;
  line-height: 1.3;
}

.description-icon {
  width: 14px;
  text-align: center;
}

.description-text {
  flex: 1;
  font-size: 0.75rem;
  white-space: pre-line;
}

.block-description.placeholder {
  color: #94a3b8;
  font-style: italic;
}

.block-release {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 0.7rem;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
}

.release-icon {
  font-size: 0.8rem;
}

.release-date {
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.release-date:hover {
  background: #e2e8f0;
}
/*статус блоков*/
.block-status {
  font-size: 0.65rem;
  color: #64748b;
  display: block;
  margin-top: 2px;
}

.block-title-wrapper {
  flex: 1;
  min-width: 0;
}

.block-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #0f172a;
  word-break: break-word;
  line-height: 1.3;
  margin: 0;
}

/* Чекбоксы */
.block-checkbox {
  border-top: 1px solid #f1f5f9;
  padding-top: 6px;
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.7rem;
  color: #64748b;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-text {
  transition: color 0.2s;
}

.checkbox-label:hover .checkbox-text {
  color: #3b82f6;
}

/* Выполненные блоки */
.block.completed {
  opacity: 0.6;
  background: #f8fafc !important;
  border-color: #cbd5e1;
}

.block.completed .block-title {
  text-decoration: line-through;
  color: #94a3b8;
}

.block.completed .block-accent {
  opacity: 0.3;
}

.block.completed .block-badge {
  background: #e2e8f0;
  color: #94a3b8;
}

.effort-progress {
  height: 3px;
  background: #f1f5f9;
  overflow: hidden;
  margin-top: 6px;
  border-radius: 0 0 8px 8px;
}

.effort-progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

/* Редактор даты в блоке */
.block-date-editor {
  margin-bottom: 8px;
  padding: 4px 0;
}

.block-date-editor input[type="date"] {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  font-size: 0.75rem;
  background: white;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.block-date-editor input[type="date"]:focus {
  border-color: #2563eb;
}

/* Стиль для блока в режиме редактирования */
.block.editing {
  box-shadow: 0 0 0 2px #3b82f6;
}

/* ===== МОДАЛЬНОЕ ОКНО (УПРОЩЕННОЕ) ===== */
/* ===== МОДАЛЬНОЕ ОКНО ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal {
  background: white;
  border-radius: 24px;
  padding: 20px; /* уменьшили с 24px до 20px */
  width: 560px; /* увеличили с 460px до 560px */
  max-width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px; /* уменьшили с 20px до 16px */
}

.modal-header h3 {
  font-size: 1.4rem; /* чуть уменьшили */
  font-weight: 500;
  color: #0f172a;
  margin: 0;
}

.btn-close {
  width: 32px; /* уменьшили */
  height: 32px; /* уменьшили */
  border-radius: 16px;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

/* Секции */
.modal-section {
  margin-bottom: 20px; /* уменьшили */
  padding-bottom: 16px; /* уменьшили */
  border-bottom: 1px solid #f1f5f9;
}

.modal-section:last-of-type {
  border-bottom: none;
  margin-bottom: 12px;
  padding-bottom: 0;
}

/* Формы */
.form-group {
  margin-bottom: 16px; /* уменьшили */
}

.form-group label {
  display: block;
  font-size: 0.8rem; /* чуть уменьшили */
  color: #64748b;
  margin-bottom: 4px; /* уменьшили */
  font-weight: 500;
  letter-spacing: 0.3px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 14px; /* уменьшили вертикальный padding */
  border: 1px solid #e2e8f0;
  border-radius: 14px; /* чуть уменьшили */
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
  background: #ffffff;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 70px; /* уменьшили */
  line-height: 1.5;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

/* Трудозатраты */
.effort-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px; /* уменьшили */
}

.effort-header label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.effort-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 30px;
}

.effort-input {
  margin-bottom: 6px; /* уменьшили */
}

.effort-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444);
  -webkit-appearance: none;
}

.effort-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; /* чуть уменьшили */
  height: 18px; /* чуть уменьшили */
  border-radius: 50%;
  background: white;
  border: 2px solid #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* Мини-шкала */
.thermal-mini {
  position: relative;
  height: 24px; /* уменьшили */
  margin-top: 4px; /* уменьшили */
}

.thermal-mini-bar {
  display: flex;
  height: 6px; /* уменьшили */
  width: 100%;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px; /* уменьшили */
}

.thermal-mini-segment {
  flex: 1;
  height: 100%;
}

.thermal-mini-indicator {
  position: absolute;
  top: -2px; /* подняли */
  transform: translateX(-50%);
  color: #3b82f6;
  font-size: 1rem; /* уменьшили */
  line-height: 1;
  transition: left 0.2s;
}

/* Футер */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px; /* уменьшили */
  padding-top: 12px; /* уменьшили */
  border-top: 1px solid #f1f5f9;
}

.footer-left {
  display: flex;
  gap: 8px;
}

.footer-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Кнопки */
.btn {
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 8px 18px; /* чуть уменьшили горизонтальный padding */
  border-radius: 30px;
  font-size: 0.85rem; /* чуть уменьшили */
}

.btn-text:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #94a3b8;
}

.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 8px 18px; /* чуть уменьшили */
  border-radius: 30px;
  font-size: 0.85rem; /* чуть уменьшили */
  gap: 6px;
}

.btn-secondary:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #94a3b8;
}

.btn-danger {
  background: white;
  border: 1px solid #fee2e2;
  color: #ef4444;
  width: 38px; /* чуть уменьшили */
  height: 38px; /* чуть уменьшили */
  border-radius: 19px;
  font-size: 1.1rem; /* чуть уменьшили */
  padding: 0;
}

.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Адаптивность */
@media (max-width: 640px) {
  .modal {
    padding: 16px;
    width: 95%;
  }
  
  .modal-header h3 {
    font-size: 1.2rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .btn-text {
    display: none;
  }
  
  .footer-right {
    width: 100%;
    justify-content: flex-end;
  }
}

/* СПИСОК ЗАДАЧ */
.block-tasks {
  margin: 8px 0;
  padding: 6px 8px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.tasks-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-task-btn {
  width: 25px;
  height: 25px;
  border-radius: 15px; /* круглая кнопка */
  border: 1px solid #3b82f6;
  background: white;
  color: #3b82f6;
  font-size: 1rem;
  cursor: pointer;
  display: flex; /* Важно: flex, чтобы центрировать содержимое */
  align-items: center; /* Центрируем по вертикали */
  justify-content: center; /* Центрируем по горизонтали */
  transition: all 0.2s;
  padding: 0; /* Убираем лишние отступы */
  margin: 0; /* Убираем внешние отступы, если есть */
  line-height: 1; /* Чтобы текст не съезжал по высоте */
}

.add-task-btn:hover {
  background: #3b82f6;
  color: white;
}

.tasks-list {
  max-height: 450px;
  overflow-y: auto;
}

.task-item:active {
  cursor: grabbing;
}
/* Отключаем перетаскивание для интерактивных элементов */
.task-checkbox input,
.task-edit-btn,
.task-delete-btn {
  cursor: pointer;
  user-select: none;
}
.task-item:active {
  cursor: grabbing;
}

/* Отключаем перетаскивание для интерактивных элементов */
.task-checkbox input,
.task-edit-btn,
.task-delete-btn {
  cursor: pointer;
  user-select: none;
}

/* Стиль для перетаскиваемого элемента */
.task-item.dragging {
  opacity: 0.5;
  transform: scale(0.98) rotate(1deg);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  cursor: grabbing;
  background: white;
  z-index: 1000;
}

/* Стиль для места вставки */
.task-item.drag-over {
  border: 2px dashed #3b82f6;
  background: #eff6ff;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  position: relative;
}

/* Индикатор позиции */
.task-item.drag-over::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  top: -2px;
  animation: slidePulse 1s infinite;
  border-radius: 3px;
}

@keyframes slidePulse {
  0%, 100% { opacity: 0.5; transform: scaleX(0.8); }
  50% { opacity: 1; transform: scaleX(1); }
}

/* Стиль для пустого списка при перетаскивании */
.tasks-empty {
  min-height: 40px;
  border: 2px dashed #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tasks-empty[draggable="true"]:hover,
.tasks-empty[ondragover] {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: scale(1.02);
}

/* Убираем точечки */
.task-drag-handle {
  display: none; /* полностью скрываем */
}

/* Анимация для перетаскивания */
@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}

.task-item.dragging {
  animation: float 0.3s ease;
}

/* Индикатор позиции при перетаскивании */
.task-item.drag-over::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
  top: -1px;
  animation: pulse 1s infinite;
}


.task-item:last-child {
  border-bottom: none;
}

.task-completed .task-title {
  text-decoration: line-through;
  color: #94a3b8;
}

.task-checkbox {
  flex-shrink: 0;
  padding-top: 2px;
}

.task-checkbox input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
 cursor: text;  /* Меняем курсор на текстовый */
  padding: 4px 6px;
  border-radius: 4px;
  transition: background 0.2s;
}

.task-title:hover {
  background: #1d2025;
  outline: 1px solid #3b82f6;
}


.task-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.task-edit-btn,
.task-delete-btn {
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  color: #64748b;
}

.task-edit-btn:hover {
  background: #e2e8f0;
  color: #3b82f6;
}

.task-delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.tasks-empty {
  text-align: center;
  padding: 8px 0;
}

.empty-text {
  font-size: 0.7rem;
  color: #94a3b8;
  font-style: italic;
}
/* Уведомления */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 30px;
  color: white;
  font-size: 0.85rem;
  z-index: 2500;
  animation: slideIn 0.2s;
}

.notification.success { background: #10b981; }
.notification.error { background: #ef4444; }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Режим редактирования задачи */
.task-edit-mode {
  width: 100%;
}

.task-edit-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  font-size: 0.75rem;
  outline: none;
  background: white;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.task-edit-input:focus {
  border-color: #2563eb;
}
/* Прогресс-бар выполнения задач */
.task-progress {
  margin: 10px 0 8px 0;
  padding: 8px 10px;
  background: #ffffff;
  border-radius: 8px;
  border: 0;
}

.task-progress.empty {
  opacity: 0.7;
  background: #f8fafc;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.7rem;
}

.progress-label {
  color: #475569;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.progress-value {
  color: #0f172a;
  font-weight: 600;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 12px;
}

.progress-bar-container {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 3px;
}
/* Статусы задач */
.task-status {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
  margin-right: 2px;
}

.task-status:hover {
  background: #f1f5f9;
  transform: scale(1.1);
}

.status-icon {
  font-size: 1rem;
  line-height: 1;
  transition: all 0.2s;
}

/* Стили для разных статусов */
.task-done .task-title {
  text-decoration: line-through;
  color: #94a3b8;
}

.task-progress .task-title {
  color: #1e293b;
  font-weight: 500;
}

/* Анимация смены статуса */
.task-status:active {
  transform: scale(0.9);
}

/* Подсветка при наведении */
.task-item:hover .task-status {
  background: #e2e8f0;
}

/* Обновляем существующие стили */
.task-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: grab;
  user-select: none;
  position: relative;
}

.task-checkbox {
  display: none; /* Скрываем старый чекбокс */
}

.task-content {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.task-title {
  font-size: 0.75rem;
  color: #1e293b;
  word-break: break-word;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.task-title:hover {
  background: #e2e8f0;
}

.task-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}


.btn-info {
  background: #64748b;
  color: white;
  border-color: #475569;
}

.btn-info:hover {
  background: #475569;
}
/* Горизонтальный режим */
.horizontal-header {
  flex-shrink: 0;
  height: 40px;
  background: white;
  border-bottom: 2px solid #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  position: relative;
  padding-left: 20px;
  pointer-events: none; /* Запрещает все события мыши */
}

.horizontal-header::-webkit-scrollbar {
  display: none;
}

.horizontal-header-container {
  position: relative;
  height: 100%;
  min-width: 100%;
  padding-left: 20px;
  
}


/* Вертикальные линии для дней */
.horizontal-day-line {
  position: absolute;
  top: -30px;
  bottom: 0;
  width: 1px;
  background: rgba(203, 213, 225, 0.2);
  pointer-events: none;
  z-index: 1;
  transform: translateX(-17px); /* убираем смещения */
}

/* Линии начала месяца */
.horizontal-month-line {
  position: absolute;
  top: -30px;
  bottom: 0;
  width: 2px;
  background: rgba(59, 130, 246, 0.4);
  pointer-events: none;
  z-index: 2;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.3);
  transform: translateX(-17px);
}

/* Убираем возможные смещения у ячеек месяцев */
/* Ячейки месяцев в горизонтальном режиме */
.horizontal-month-cell {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  background: white;
  border-right: 1px solid #e2e8f0;
  box-sizing: border-box;
  transform: translateX(0);
  z-index: 10;
}


/* Слой для линий - под блоками */
.lines-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 5;
}

/* Линия */
.timeline-line {
   position: absolute;
  width: 2px;
  background: #3b82f6;
  opacity: 0.7;
  transition: opacity 0.2s;
  transform: translateX(-50%);
  cursor: grab;
  user-select: none;
  z-index: 15;
  pointer-events: auto; /* ← ЯВНО ВКЛЮЧАЕМ СОБЫТИЯ */
   -webkit-user-drag: element; /* для Safari */
  user-drag: element;
}
.timeline-line:active {
  cursor: grabbing;
}


/* Для последнего дня месяца - дополнительное смещение влево */
.timeline-line[data-lastday="true"] {
  transform: translateX(-50%) translateX(-8px); /* смещение влево */
}

/* Точка у блока */
.timeline-line .line-dot {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  opacity: 0.8;
  transition: all 0.2s;
}

/* Метка с датой */
.timeline-line .line-date {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: white;
  background: #3b82f6;
  padding: 4px 8px;
  border-radius: 16px;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 30;
}

/* Коррекция метки для последнего дня */
.timeline-line[data-lastday="true"] .line-date {
  left: auto;
  right: 0;
  transform: translateX(0);
}

/* Для первого дня месяца */
.timeline-line:first-child .line-date {
  left: 0;
  transform: translateX(-50%);
}


/* Для последнего дня при наведении */
.block:hover ~ .lines-layer .timeline-line[data-lastday="true"][data-block-id] .line-date {
  transform: translateX(0) translateY(-2px);
}

/* Стили для перетаскиваемых линий */
.timeline-line {
  cursor: grab;
  transition: opacity 0.2s, transform 0.2s;
  user-select: none;
  z-index: 15; /* Выше обычных линий, но ниже блоков */
}

.timeline-line:active {
  cursor: grabbing;
}

.timeline-line.line-dragging {
  opacity: 0.8;
  transform: scaleX(1.1);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  z-index: 100;
}

/* Подсветка при наведении */
.timeline-line:hover {
  opacity: 1;
  width: 4px; /* Делаем линию толще при наведении */
  background: #2563eb;
}

.timeline-line:hover .line-dot {
  transform: translateX(-50%) scale(1.5);
  background: #2563eb;
}

.timeline-line:hover .line-date {
  transform: translateX(-50%) translateY(-2px);
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Коррекция для последнего дня месяца */
.timeline-line[data-lastday="true"]:hover .line-date {
  transform: translateX(0) translateY(-2px);
}

/* Индикатор позиции при перетаскивании */
.timeline-grid.drag-over-line {
  outline: 2px dashed #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

/* Визуальная подсказка текущей позиции */
.line-position-indicator {
  position: absolute;
  width: 2px;
  height: 100%;
  background: #3b82f6;
  opacity: 0.5;
  pointer-events: none;
  z-index: 50;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* Стили для перетаскивания шапки блока */
.block-header {
  cursor: grab;
  user-select: none;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
}

.block-header:active {
  cursor: grabbing;
}

.block-header:hover {
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.block-header-dragging {
  opacity: 0.8;
  background: rgba(59, 130, 246, 0.2) !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
  transform: scale(1.02);
}

/* Стили для перетаскиваемой метки даты */
.line-date {
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.line-date:active {
  cursor: grabbing;
}

.line-date:hover {
  transform: translateX(-50%) scale(1.1) !important;
  background: #2563eb !important;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.5) !important;
}

.line-date-dragging {
  opacity: 0.9;
  transform: translateX(-50%) scale(1.2) !important;
  background: #ef4444 !important;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.6) !important;
  z-index: 1002;
}

/* Индикатор, что элемент можно перетаскивать */
[draggable="true"] {
  -webkit-user-drag: element;
  user-drag: element;
}

/* Подсветка блока при перетаскивании его шапки */
.block-header-dragging ~ * {
  opacity: 0.9;
}

/* Стили для блока при перетаскивании */
.block.block-dragging {
  opacity: 0.9;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3) !important;
  border: 2px solid #ef4444 !important;
  transform: scale(1.02);
  transition: none !important;
  z-index: 1001 !important;
}

/* Подсветка связи между блоком и линией */
.block.block-dragging + .lines-layer .timeline-line[data-block-id] {
  opacity: 1;
  width: 4px;
  background: #ef4444;
}

/* Анимация пульсации для блока */
@keyframes blockPulse {
  0% {
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 12px 35px rgba(239, 68, 68, 0.5);
  }
  100% {
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  }
}

.block.block-dragging {
  animation: blockPulse 1.5s infinite;
}

/* Убираем transition у всех элементов во время перетаскивания */
.is-dragging * {
  transition: none !important;
}
</style>