<template>
   <div class="app">
    <header class="header">
      <div class="header-top">
        <h1>⚡ <span>Путь</span> — роадмап 2026</h1>
        <div class="quote" ref="quoteElement">{{ currentQuote }}</div>
      </div>

      <div class="toolbar">
        <div class="toolbar-group">
           <button 
            class="btn" 
            :class="{ active: viewMode === 'horizontal' }" 
            @click="setViewMode('horizontal')"
          >
            📅 По месяцам
          </button>
        <!--  <button 
            class="btn" 
            :class="{ active: viewMode === 'months' }" 
            @click="setViewMode('months')"
          >
            📅 По месяцам
          </button>-->
          <button 
            class="btn" 
            :class="{ active: viewMode === 'quarters' }" 
            @click="setViewMode('quarters')"
          >
            📊 По кварталам
          </button>
          <!-- НОВАЯ КНОПКА ТЕПЛОВОЙ КАРТЫ -->
            <button 
              class="btn" 
              :class="{ active: viewMode === 'heatmap' }" 
              @click="setViewMode('heatmap')"
            >
              🔥 Тепловая карта
            </button>
        </div>
        <div class="toolbar-group">
          <button class="btn btn-primary" @click="createNewBlock">+ Новый этап</button>
          <button class="btn" @click="loadBlocks">🔄</button>
          <button class="btn" @click="exportAsPNG">📸 PNG</button>
          <button class="btn" @click="exportAsPDF">📄 PDF</button>
        </div>
      </div>

      <!-- Статистика сверху -->
      <div class="statistics-top" v-if="viewMode !== 'heatmap'">
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-label">Этапов:</span>
          <span class="stat-value">{{ blocks.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">✅</span>
          <span class="stat-label">Завершено:</span>
          <span class="stat-value">{{ completedReleasesCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⏳</span>
          <span class="stat-label">В работе:</span>
          <span class="stat-value">{{ inProgressReleasesCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📋</span>
          <span class="stat-label">Всего задач:</span>
          <span class="stat-value">{{ totalTasksCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">✅</span>
          <span class="stat-label">Задач выполнено:</span>
          <span class="stat-value">{{ completedTasksCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📈</span>
          <span class="stat-label">Прогресс:</span>
          <span class="stat-value">{{ overallProgress }}%</span>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <div class="main-content">

  <!-- Шапка для горизонтального режима (только месяцы) -->
        <div v-if="viewMode === 'horizontal'" class="horizontal-header" ref="horizontalHeader" @wheel.prevent>
          <div class="horizontal-header-container" :style="{ width: totalWidth + 'px' }">
               <!-- Месяцы (каждый занимает свою ширину) -->
            <div 
              v-for="(month, monthIndex) in months" 
              :key="'month-'+monthIndex"
              class="horizontal-month-cell"
              :style="{ 
                left: monthIndex * HORIZONTAL_MONTH_WIDTH + 'px',
                width: HORIZONTAL_MONTH_WIDTH + 'px'
              }"
            >
              {{ month.label }}
            </div>
          </div>
        </div>
      <!-- Шапка месяцев/кварталов -->
                 <div v-if="viewMode === 'months' || viewMode === 'quarters'" class="months-header" ref="monthsHeader" @wheel.prevent>
  <div class="months-header-container" :style="{ width: totalWidth + 'px' }">
    <div
      v-for="(period, index) in visiblePeriods"
      :key="index"
      class="month-header-cell"
              :style="{ 
                width: periodWidth + 'px',
                left: index * periodWidth + 'px',
                right: 'auto'
              }"
            >
              {{ period.label }}
              <span class="month-sub" v-if="period.sub">{{ period.sub }}</span>
            </div>
          </div>
        </div>

    <!-- ТЕПЛОВАЯ КАРТА - БЛОКИ С ЗАДАЧАМИ В ВИДЕ КВАДРАТИКОВ -->
<div v-if="viewMode === 'heatmap'" class="heatmap-view">
  <div class="heatmap-header">
    <div class="heatmap-title-section">
      <h2>🔥 Тепловая карта трудозатрат</h2>
      <div class="heatmap-legend">
        <div class="legend-item">
          <span class="legend-color" :style="{ background: getEffortColor(50, 1) }"></span>
          <span>50 ч</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" :style="{ background: getEffortColor(250, 1) }"></span>
          <span>250 ч</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" :style="{ background: getEffortColor(500, 1) }"></span>
          <span>500 ч</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" :style="{ background: getEffortColor(800, 1) }"></span>
          <span>800+ ч</span>
        </div>
      </div>
    </div>
    
    <div class="heatmap-stats">
      <div class="heatmap-stat">
        <span class="stat-icon">📊</span>
        <span class="stat-label">Этапов:</span>
        <span class="stat-value">{{ blocks.length }}</span>
      </div>
      <div class="heatmap-stat">
        <span class="stat-icon">⚡</span>
        <span class="stat-label">Всего трудозатрат:</span>
        <span class="stat-value">{{ totalEffort }} ч</span>
      </div>
      <div class="heatmap-stat">
        <span class="stat-icon">✅</span>
        <span class="stat-label">Выполнено:</span>
        <span class="stat-value">{{ completedEffort }} ч ({{ completedEffortPercent }}%)</span>
      </div>
    </div>
  </div>
  
  <div class="heatmap-container">
    <!-- СЕТКА для блоков -->
    <div class="heatmap-grid">
      <div 
        v-for="block in sortedByEffort" 
        :key="block.id"
        class="heatmap-block"
        :style="getBlockGridStyle(block)"
        @click="editBlock(block)"
        :title="`${block.title}: ${block.effort || 0} ч`"
      >
        <!-- Название этапа и трудозатраты -->
        <div class="heatmap-block-header">
          <div class="heatmap-block-title">{{ block.title }}</div>
          <div class="heatmap-block-effort">{{ block.effort || 0 }} ч</div>
        </div>
        
        <!-- Задачи в виде квадратиков -->
        <div class="heatmap-tasks-grid">
          <div 
            v-for="task in block.tasks" 
            :key="task.id"
            class="heatmap-task-square"
            :style="{ backgroundColor: getTaskColor(task) }"
            :title="`${task.title} - ${task.effort || 0}ч`"
          ></div>
          <div v-if="!block.tasks?.length" class="heatmap-no-tasks">
            <span>⚪</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


      <!-- Контейнер с прокруткой для блоков -->
     <div 
 v-if="viewMode !== 'heatmap'"
    class="timeline-wrapper" 
    ref="timelineWrapper"
    @wheel="onWheel"
    @scroll="syncScroll"
    tabindex="0"
>
  <div class="timeline-container" :style="{ width: totalWidth + 'px' }">
  <!-- Сетка с блоками -->
          <div 
          class="timeline-grid"
              ref="timelineGrid"
              :style="{ height: totalHeight + 'px' }"
              @dragover="onGridDragOver"
              @dragleave="removePositionIndicator"
              @drop="onGridDrop"
          >
    <!-- Вертикальные линии для дней (очень тонкие) -->
    <template v-if="viewMode === 'horizontal'">
      <!-- Линии для каждого дня -->
      <div 
        v-for="day in 365" 
        :key="'day-line-'+day"
        class="horizontal-day-line"
        :style="{ left: (day - 1) * HORIZONTAL_DAY_WIDTH + 'px' }"
      ></div>
      
      <!-- Линии начала месяца (более заметные) -->
      <div 
        v-for="month in 12" 
        :key="'month-line-'+month"
        class="horizontal-month-line"
        :style="{ left: (month - 1) * HORIZONTAL_MONTH_WIDTH + 'px' }"
      ></div>
      <!-- Линия конца года (последний день) -->
      <div 
        class="horizontal-month-line"
        :style="{ left: 12 * HORIZONTAL_MONTH_WIDTH + 'px' }"
      ></div>
    </template>

    <!-- БЛОКИ -->
              <div
              v-for="block in sortedBlocks"
              :key="block.id"
              class="block"
              :data-block-id="block.id"
              :class="{ 
                completed: block.completed, 
                editing: block.editing,
                'block-dragging': isDraggingLine && draggedBlockId === block.id
              }"
              :style="{ 
                backgroundColor: getBlockBackgroundColor(block),
                left: (isDraggingLine && draggedBlockId === block.id) ? blockDragCurrentX + 'px' : getBlockLeft(block) + 'px',
                top: getBlockTop(block) + 'px',
                width: viewMode === 'horizontal' ? HORIZONTAL_MONTH_WIDTH - 10 + 'px' : periodWidth - 10 + 'px',
                minHeight: getBlockMinHeight(block) + 'px'
              }"
            >
      <!-- Верхний акцентный градиент -->
      <div class="block-accent" :style="{ background: getBlockAccentColor(block) }"></div>
      
      <!-- Заголовок с приоритетом и статусом -->
            <div 
          class="block-header"
          draggable="true"
          @dragstart="onBlockHeaderDragStart($event, block)"
          @dragend="onBlockHeaderDragEnd"
        >
          <div class="block-title-container">
            <span class="block-priority" :class="getPriorityClass(block.effort)">
              {{ getPriorityIcon(block.effort) }}
            </span>
            <div class="block-title-wrapper">
              <h3 class="block-title" @click.stop="editBlock(block)">{{ block.title }}</h3>
            </div>
          </div>
          <div class="block-badge" :style="{ background: getEffortColor(block.effort, 0.2) }">
            <span class="badge-icon">⚡</span>
            <span class="badge-value">{{ block.effort || 0 }}</span>
          </div>
        </div>

      <!-- Описание с иконкой (если есть) -->
      <div class="block-description" v-if="block.description">
        <span class="description-text">{{ block.description }}</span>
      </div>

      <!-- СПИСОК ЗАДАЧ -->
      <div class="block-tasks">
        <div class="tasks-header">
          <span class="tasks-title">📋 Задачи</span>
          <button class="add-task-btn" @click.stop="addTask(block)" title="Добавить задачу">+</button>
        </div>
        
        <div 
          class="tasks-list" 
          v-if="block.tasks && block.tasks.length > 0"
          @dragover.prevent
          @drop.prevent="onTaskDrop($event, block, null)"
        >
          <div 
            v-for="task in [...block.tasks].sort((a, b) => (a.order || 0) - (b.order || 0))" 
            :key="task.id"
            class="task-item"
            :class="{ 
              'task-done': task.status === 'done',
              'task-progress': task.status === 'progress',
              'drag-over': dragOverBlock?.id === block.id && dragOverTask?.id === task.id,
              'dragging': draggedTask?.id === task.id
            }"
            draggable="true"
            @dragstart="onTaskDragStart($event, block, task)"
            @dragend="onTaskDragEnd"
            @dragover="onTaskDragOver"
            @drop="onTaskDrop($event, block, task)"
            @dragenter="onTaskDragEnter(block, task)"
            @dragleave="onTaskDragLeave"
          >
            <!-- Статус задачи (кликабельный) -->
            <div class="task-status" @click.stop="cycleTaskStatus(block, task, $event)" :title="getStatusTitle(task.status)">
              <span class="status-icon" :style="{ color: getStatusColor(task.status) }">
                {{ getStatusIcon(task.status) }}
              </span>
            </div>
            
            <div class="task-content">
              <div v-if="task.isEditing" class="task-edit-mode">
              <input 
                type="text" 
                v-model="task.editValue" 
                @keyup.enter="saveTaskEdit(block, task, $event)"
                @keyup.esc="cancelTaskEdit(task)"
                @blur="saveTaskEdit(block, task, $event)"
                @click.stop
                class="task-edit-input"
                ref="taskInput"
                autofocus 
              >
            </div>
              
              <!-- Обычный режим (перетаскивание за всю область) -->
              <div 
                v-else 
                class="task-title" 
                @click.stop="startTaskEdit(block, task, $event)"
              >
                {{ task.title }}
              </div>
            </div>
            
            <!-- Кнопки действий -->
            <div class="task-actions">
              <button class="task-edit-btn" @click.stop="startTaskEdit(block, task, $event)" title="Редактировать (двойной клик)">✏️</button>
              <button class="task-delete-btn" @click.stop="deleteTask(block, task, $event)" title="Удалить">🗑️</button>
            </div>
          </div>
        </div>
        
        <!-- Пустой список -->
        <div 
          v-else
          class="tasks-empty"
          @dragover.prevent
          @drop.prevent="onTaskDrop($event, block, null)"
        >
          <span class="empty-text">Нет задач (перетащите сюда)</span>
        </div>
      </div>
      
      <!-- Прогресс выполнения задач -->
      <div class="task-progress" v-if="block.tasks && block.tasks.length > 0">
        <div class="progress-header">
          <span class="progress-label">Прогресс этапа</span>
          <span class="progress-value">{{ getTaskProgress(block) }}% ({{ getCompletedTasksCount(block) }}/{{ block.tasks.length }})</span>
        </div>
        <div class="progress-bar-container">
          <div 
            class="progress-bar-fill" 
            :style="{ 
              width: getTaskProgress(block) + '%',
              backgroundColor: getProgressColor(getTaskProgress(block))
            }"
          ></div>
        </div>
      </div>

      <!-- Если задач нет, показываем заглушку -->
      <div class="task-progress empty" v-else>
        <div class="progress-header">
          <span class="progress-label">Прогресс этапа</span>
          <span class="progress-value">0%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: 0%;"></div>
        </div>
      </div>
    
      <!-- Дата -->
      <div class="block-release" v-if="!block.editingDate">
        <span class="release-icon">📅</span>
        <span class="release-date" @click.stop="startEditingDate(block)">
          {{ formatDate(block.releaseDate) }}
        </span>
      </div>

      <!-- Редактор даты -->
      <div class="block-date-editor" v-else>
        <input 
          type="date" 
          v-model="block.editDateValue" 
          @change="saveDate(block)"
          @blur="cancelDateEdit(block)"
          @click.stop
        >
      </div>
      
     
    </div> <!-- Закрытие блока -->

   <!-- ===== НОВЫЙ СЛОЙ С ЛИНИЯМИ (ПОД БЛОКАМИ) ===== -->
        <div v-if="viewMode === 'horizontal'" class="lines-layer">
  <div 
    v-for="block in sortedBlocks" 
    :key="'line-'+block.id"
    class="timeline-line"
    :class="{ 'line-dragging-active': isDraggingLine && draggedLineBlock?.id === block.id }"
    :data-date="formatDate(block.releaseDate)"
    :data-block-id="block.id"
    :data-lastday="isLastDayOfMonth(block.releaseDate)"
    :style="{ 
      left: (isDraggingLine && draggedLineBlock?.id === block.id) ? dragCurrentX + 'px' : getLinePosition(block) + 'px',
      top: '-30px',
      height: (getBlockTop(block) + 10) + 'px'
    }"
    draggable="true"
    @dragstart="onLineDragStart($event, block)"
    @dragend="onLineDragEnd"
  >
    <!-- Точка у блока (снизу линии) -->
    <span class="line-dot"></span>
    
     <!-- Метка с датой - СДЕЛАЕМ ПЕРЕТАСКИВАЕМОЙ -->
    <span 
      class="line-date"
      :class="{ 'line-date-dragging': isDraggingLine && draggedLineBlock?.id === block.id }"
      draggable="true"
      @dragstart="onLineDragStart($event, block)"
      @dragend="onLineDragEnd"
    >
      {{ (isDraggingLine && draggedLineBlock?.id === block.id) ? previewDate : formatDate(block.releaseDate) }}
    </span>
  </div>
</div>
    <!-- ============================================= -->

  </div> <!-- Закрытие timeline-grid -->
</div> <!-- Закрытие timeline-container -->
                    </div>
      </div>


       <!-- Модальное окно редактирования (только информация о этапе) -->
<div v-if="showModal" class="modal-overlay" @click="closeModal">
  <div class="modal" @click.stop>
    <div class="modal-header">
      <h3>✏️ Редактировать этап</h3>
      <button class="btn-close" @click="closeModal">✕</button>
    </div>
    
    <!-- Основная информация -->
    <div class="modal-section">
      <div class="form-group">
        <label>Название этапа</label>
        <input v-model="editingBlock.title" type="text" placeholder="Например: Тайм-трекинг">
      </div>
      
      <div class="form-group">
        <label>Описание</label>
        <textarea 
          v-model="editingBlock.description" 
          rows="3" 
          placeholder="Краткое описание целей этапа..."
        ></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>🚀 Дата</label>
          <input v-model="editingBlock.releaseDate" type="date">
        </div>
      </div>
    </div>

    <!-- Трудозатраты -->
    <div class="modal-section">
      <div class="effort-header">
        <label>⚡ Трудозатраты</label>
        <span class="effort-value">{{ editingBlock.effort || 0 }} ч</span>
      </div>
      <div class="effort-input">
        <input 
          v-model.number="editingBlock.effort" 
          type="range" 
          min="0" 
          max="1000" 
          step="1"
          class="effort-range"
        >
      </div>
      
      <!-- Мини-шкала тепловой карты -->
      <div class="thermal-mini">
        <div class="thermal-mini-bar">
            </div>
          </div>
    </div>

    
    <!-- Футер с кнопками -->
<div class="modal-footer">
  <button class="btn btn-text" @click="closeModal">Отмена</button>
  <div class="footer-actions">
    <button class="btn btn-danger" @click="deleteBlock">
      🗑️
    </button>
    <button class="btn btn-secondary" @click="saveBlock">
      💾 Сохранить
    </button>
  </div>
</div>
  </div>
</div>

    <!-- Уведомление -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import html2canvas from 'html2canvas'

const API_URL = 'http://localhost:3001/api'
const blocks = ref([])
const timelineWrapper = ref(null)
const monthsHeader = ref(null)
const timelineGrid = ref(null)

// Константы
const MONTH_WIDTH = 320
const QUARTER_WIDTH = 580
const BASE_ROW_HEIGHT = 70
const SCROLL_STEP = 240
const HORIZONTAL_ROW_HEIGHT = 100 // высота строки месяца
const HORIZONTAL_COLUMN_WIDTH = 20 // ширина колонки даты
// Константы для горизонтального режима
const HORIZONTAL_MONTH_WIDTH = 400 // ширина одного месяца в пикселях (увеличена)
const HORIZONTAL_DAY_WIDTH = 10 // ширина одного дня (для позиционирования блоков)
// Состояние для перетаскивания линии
const draggedLineBlock = ref(null)
const isDraggingLine = ref(false)
const dragStartX = ref(0) // Начальная позиция
const dragCurrentX = ref(0) // Текущая позиция
const dragOffset = ref(0) // Смещение
const previewDate = ref('') // Дата для предпросмотра
const viewMode = ref(localStorage.getItem('roadmap-view-mode') || 'horizontal')
// Добавляем новый режим: 'months', 'quarters', 'horizontal'

// Все месяцы
const months = [
  { label: 'Январь 2026', monthIndex: 0, type: 'month' },
  { label: 'Февраль 2026', monthIndex: 1, type: 'month' },
  { label: 'Март 2026', monthIndex: 2, type: 'month' },
  { label: 'Апрель 2026', monthIndex: 3, type: 'month' },
  { label: 'Май 2026', monthIndex: 4, type: 'month' },
  { label: 'Июнь 2026', monthIndex: 5, type: 'month' },
  { label: 'Июль 2026', monthIndex: 6, type: 'month' },
  { label: 'Август 2026', monthIndex: 7, type: 'month' },
  { label: 'Сентябрь 2026', monthIndex: 8, type: 'month' },
  { label: 'Октябрь 2026', monthIndex: 9, type: 'month' },
  { label: 'Ноябрь 2026', monthIndex: 10, type: 'month' },
  { label: 'Декабрь 2026', monthIndex: 11, type: 'month' }
]

// Кварталы
const quarters = [
  { label: 'Q1 2026', sub: 'янв-мар', startMonth: 0, endMonth: 2, type: 'quarter' },
  { label: 'Q2 2026', sub: 'апр-июн', startMonth: 3, endMonth: 5, type: 'quarter' },
  { label: 'Q3 2026', sub: 'июл-сен', startMonth: 6, endMonth: 8, type: 'quarter' },
  { label: 'Q4 2026', sub: 'окт-дек', startMonth: 9, endMonth: 11, type: 'quarter' }
]

// Новая переменная для горизонтального режима
const isHorizontal = computed(() => viewMode.value === 'horizontal')

// Видимые периоды (для горизонтального режима показываем месяцы как строки)
const visiblePeriods = computed(() => {
  if (viewMode.value === 'months') return months
  if (viewMode.value === 'quarters') return quarters
  if (viewMode.value === 'horizontal') return months // месяцы как строки
   if (viewMode.value === 'heatmap') return [] // для тепловой карты периоды не нужны
})

// Ширина периода (для горизонтального режима фиксированная)
const periodWidth = computed(() => {
    if (viewMode.value === 'months') return MONTH_WIDTH
  if (viewMode.value === 'quarters') return QUARTER_WIDTH  // ← это должно быть
  if (viewMode.value === 'horizontal') return HORIZONTAL_COLUMN_WIDTH
  return 0
})

const totalWidth = computed(() => {
  if (viewMode.value === 'horizontal') {
    // Ширина = отступ + количество месяцев * ширина месяца
    return 50 + months.length * HORIZONTAL_MONTH_WIDTH + 50
  }
  return visiblePeriods.length * periodWidth.value + 50
})


// Ширина для блоков (обычная)
const blocksTotalWidth = computed(() => {
  if (viewMode.value === 'horizontal') {
    return months.length * HORIZONTAL_MONTH_WIDTH + 50
  }
  return visiblePeriods.length * periodWidth.value + 50
})

// Ширина для шапки (на один день больше)
const headerTotalWidth = computed(() => {
  if (viewMode.value === 'horizontal') {
    // Добавляем ширину одного дня к последнему месяцу
    const extraDay = HORIZONTAL_MONTH_WIDTH / 30 // ширина одного дня
    return months.length * HORIZONTAL_MONTH_WIDTH + extraDay + 50
  }
  return blocksTotalWidth.value
})


// Вычисляем максимальное количество блоков в периоде
const maxRows = computed(() => {
  const blocksByPeriod = {}
  
  blocks.value.forEach(block => {
    if (!block.releaseDate) return
    
    const month = new Date(block.releaseDate).getMonth()
    let periodKey
    
    if (viewMode.value === 'months') {
      periodKey = month
    } else {
      periodKey = Math.floor(month / 3)
    }
    
    if (!blocksByPeriod[periodKey]) blocksByPeriod[periodKey] = 0
    blocksByPeriod[periodKey]++
  })
  
  const max = Math.max(...Object.values(blocksByPeriod), 0)
  return Math.max(max, 5)
})

const totalHeight = computed(() => {
  if (isHorizontal.value) {
    // В горизонтальном режиме высота = количество месяцев * высота строки
    return months.length * HORIZONTAL_ROW_HEIGHT + 50
  }
  return maxRows.value * (BASE_ROW_HEIGHT + 20) + 50
})

const sortedBlocks = computed(() => {
  // Сортируем все блоки по дате релиза
  const sorted = [...blocks.value].sort((a, b) => {
    return new Date(a.releaseDate) - new Date(b.releaseDate)
  })
  
  // ГОРИЗОНТАЛЬНЫЙ РЕЖИМ
  if (viewMode.value === 'horizontal') {
    // Группируем по месяцам
    const blocksByMonth = {}
    sorted.forEach(block => {
      const month = new Date(block.releaseDate).getMonth()
      if (!blocksByMonth[month]) blocksByMonth[month] = []
      blocksByMonth[month].push(block)
    })
    
    // Для каждого месяца рассчитываем вертикальные позиции
    Object.keys(blocksByMonth).forEach(month => {
      const monthBlocks = blocksByMonth[month]
      let currentTop = 10 // начальный отступ сверху
      
      monthBlocks.forEach(block => {
        // Устанавливаем позицию текущего блока
        block.positionInMonth = currentTop
        // Увеличиваем отступ на высоту блока + отступ между блоками
        currentTop += calculateBlockHeight(block) + 90
      })
    })
  }
  
  // РЕЖИМ ПО МЕСЯЦАМ
  else if (viewMode.value === 'months') {
    // Группируем по месяцам
    const blocksByMonth = {}
    sorted.forEach(block => {
      const month = new Date(block.releaseDate).getMonth()
      if (!blocksByMonth[month]) blocksByMonth[month] = []
      blocksByMonth[month].push(block)
    })
    
    // Для каждого месяца рассчитываем позиции
    Object.keys(blocksByMonth).forEach(month => {
      const monthBlocks = blocksByMonth[month]
      let currentTop = 10 // начальный отступ сверху
      
      monthBlocks.forEach(block => {
        block.positionInMonth = currentTop
        currentTop += calculateBlockHeight(block) + 50  
      })
    })
  }
  
  // РЕЖИМ ПО КВАРТАЛАМ
  else if (viewMode.value === 'quarters') {
    // Группируем по кварталам
    const blocksByQuarter = {}
    sorted.forEach(block => {
      const month = new Date(block.releaseDate).getMonth()
      const quarter = Math.floor(month / 3)
      if (!blocksByQuarter[quarter]) blocksByQuarter[quarter] = []
      blocksByQuarter[quarter].push(block)
    })
    
    // Для каждого квартала рассчитываем позиции
    Object.keys(blocksByQuarter).forEach(quarter => {
      const quarterBlocks = blocksByQuarter[quarter]
      let currentTop = 10 // начальный отступ сверху
      
      quarterBlocks.forEach(block => {
        block.positionInMonth = currentTop
        currentTop += calculateBlockHeight(block) + 50
      })
    })
  }
  
  return sorted
})


// ==========================================
// функция для позиционирования в горизонтальном режиме
// ==========================================

const getBlockLeft = (block) => {
  if (!block.releaseDate) return 0
  
  if (viewMode.value === 'horizontal') {
    const month = new Date(block.releaseDate).getMonth()
    return month * HORIZONTAL_MONTH_WIDTH - 10
  }
  
  const releaseMonth = new Date(block.releaseDate).getMonth()
  let periodIndex

  if (viewMode.value === 'months') {
  periodIndex = visiblePeriods.value.findIndex(p => p.monthIndex === releaseMonth)
} else {
  const quarterIndex = Math.floor(releaseMonth / 3)
  periodIndex = visiblePeriods.value.findIndex(p => p.startMonth === quarterIndex * 3)
}

  // Убираем все лишние смещения, оставляем только periodIndex * periodWidth
  return periodIndex === -1 ? 0 : (periodIndex * periodWidth.value) - 30
}


const getBlockTop = (block) => {
  if (viewMode.value === 'horizontal') {
    // В горизонтальном режиме: блоки вертикально друг под другом
    // Используем positionInMonth, который вычисляется в sortedBlocks
    return (block.positionInMonth || 0) + 10
  }
  return block.positionInMonth || 10
}


// Проверка, является ли день последним в месяце
const isLastDayOfMonth = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth()
  const day = date.getDate()
  const daysInMonth = new Date(2026, month + 1, 0).getDate()
  return day === daysInMonth
}

// ==========================================
// РАСЧЕТ ВЫСОТЫ БЛОКА
// ==========================================

const calculateBlockHeight = (block) => {
  let height = 80 // базовая высота
  
  // Заголовок
  if (block.title && block.title.length > 30) height += 20
  else if (block.title && block.title.length > 20) height += 10
  
  // Описание
  if (block.description) height += 20
  
  // Задачи
  if (block.tasks && block.tasks.length > 0) {
    height += 40 // заголовок задач
    height += block.tasks.length * 30 // каждая задача
  } else {
    height += 40 // место для пустого списка задач
  }
  
  // Прогресс-бар
  height += 50
  
  // Дата этапа
  height += 40
  
  return Math.min(height, 700)
}
// ==========================================
// ОБНОВЛЕННАЯ СТАТИСТИКА
// ==========================================

// Количество выполненных этапов (все задачи выполнены)
const completedReleasesCount = computed(() => {
  return blocks.value.filter(block => {
    if (!block.tasks || block.tasks.length === 0) return false
    return block.tasks.every(task => task.status === 'done')
  }).length
})

// Количество этапов в работе (хотя бы одна задача в работе)
const inProgressReleasesCount = computed(() => {
  return blocks.value.filter(block => {
    if (!block.tasks || block.tasks.length === 0) return false
    const hasProgress = block.tasks.some(task => task.status === 'progress')
    const hasTodo = block.tasks.some(task => task.status === 'todo')
    return hasProgress || hasTodo
  }).length
})

// Общее количество задач во всех этапов
const totalTasksCount = computed(() => {
  return blocks.value.reduce((sum, block) => {
    return sum + (block.tasks?.length || 0)
  }, 0)
})

// Количество выполненных задач (status === 'done')
const completedTasksCount = computed(() => {
  return blocks.value.reduce((sum, block) => {
    if (!block.tasks) return sum
    return sum + block.tasks.filter(task => task.status === 'done').length
  }, 0)
})

// Общий прогресс по всем задачам
const overallProgress = computed(() => {
  if (totalTasksCount.value === 0) return 0
  return Math.round((completedTasksCount.value / totalTasksCount.value) * 100)
})



// Цитаты
const quotes = [
   "🚀 Мечты не работают, пока не работаешь ты",
  "⚡ Каждый день — это шанс стать ближе к цели",
  "🎯 Фокус на главном — ключ к результату",
  "💡 Маленькие шаги каждый день приводят к большим результатам",
  "🌟 Будущее зависит от того, что ты делаешь сегодня",
  "📈 Прогресс — это движение, даже если оно медленное",
  "⏰ Лучшее время начать — сейчас",
  "💪 Ты можешь больше, чем думаешь",
  "🎯 Цели без плана — просто мечты",
  "✨ Верь в процесс, даже когда не видишь результата",
  "📊 Каждая выполненная задача приближает к успеху",
  "⚡ Энергия и настойчивость побеждают всё",
  "🌅 Утро начинается не с кофе, а с плана на день",
  "🏆 Успех — это сумма маленьких усилий, повторяющихся день за днём",
  "🔄 Не бойся менять планы, бойся оставаться без цели",
  "📝 Записывай идеи — они материальны",
  "🎯 Чем яснее цель, тем быстрее путь",
  "💫 Делай сегодня то, что другие не хотят, завтра будешь жить так, как другие не могут",
  "🌟 Звёзды видны тем, кто идёт в темноте",
  "🚀 Не жди идеального момента, создавай его",
  "💎 Каждый день — это новая возможность",
  "🌈 Даже самая длинная дорога начинается с первого шага",
  "⚡ Твой потенциал безграничен, просто начни",
  "🎯 Визуализируй цель и иди к ней"
]
const currentQuote = ref(quotes[0])
const quoteElement = ref(null)

// Состояние
const showModal = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')
const editingBlock = ref({
  id: '', title: '', description: '', releaseDate: '', effort: 0, completed: false
})
const dateInput = ref(null)

// ==========================================
// ТЕПЛОВАЯ ШКАЛА И ДИЗАЙН
// ==========================================

const getBlockBackgroundColor = (block) => {
  if (!block.tasks || block.tasks.length === 0) {
    return '#f3f4f6' // серый - нет задач
  }
  
  const hasProgressTasks = block.tasks.some(task => task.status === 'progress')
  const hasDoneTasks = block.tasks.some(task => task.status === 'done')
  const allTasksDone = block.tasks.every(task => task.status === 'done')
  
  if (allTasksDone) {
    return '#dcfce7' // зеленый - все задачи выполнены
  } else if (hasProgressTasks || hasDoneTasks) {
    return '#dbeafe' // синий - есть задачи в работе ИЛИ есть выполненные
  } else {
    return '#f3f4f6' // серый - только не начатые задачи
  }
}

const getBlockAccentColor = (block) => {
   // Верхняя полоска остается от трудозатрат
  return getEffortColor(block.effort, 1)
}
//текстовое описание статуса этапа
const getStageStatus = (block) => {
  const progress = getTaskProgress(block)
  
  if (progress === 0) return '⚪ Не начат'
  if (progress === 100) return '✅ Завершен'
  return `🟢 В работе (${progress}%)`
}

const getEffortColor = (effort, opacity = 1) => {
  const e = effort || 0
  if (e < 250) return `rgba(34, 197, 94, ${opacity})`
  if (e < 400) return `rgba(234, 179, 8, ${opacity})`
  if (e < 800) return `rgba(249, 115, 22, ${opacity})`
  return `rgba(239, 68, 68, ${opacity})`
}

const getPriorityClass = (effort) => {
  const e = effort || 0
  if (e < 40) return 'priority-low'
  if (e < 80) return 'priority-medium'
  if (e < 120) return 'priority-high'
  return 'priority-critical'
}

const getPriorityIcon = (effort) => {
  const e = effort || 0
  if (e < 40) return '●'
  if (e < 80) return '◆'
  if (e < 120) return '▲'
  return '❗'
}

const getEffortPercent = (effort) => {
  const e = effort || 0
  return Math.min(100, (e / 200) * 100)
}
//ЦВЕТ ПРОГРЕССА
const getProgressColor = (percent) => {
  if (percent < 30) return '#ef4444' // красный - мало сделано
  if (percent < 70) return '#f97316' // оранжевый - в процессе
  if (percent < 100) return '#eab308' // желтый - почти готово
  return '#22c55e' // зеленый - выполнено
}

// ==========================================
// ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ПОЗИЦИЙ
// ==========================================

const forceUpdatePositions = () => {
  blocks.value = blocks.value.map(block => ({
    ...block,
    positionInMonth: undefined,
    // Сохраняем порядок задач
    tasks: block.tasks ? [...block.tasks].sort((a, b) => (a.order || 0) - (b.order || 0)) : []
  }))
  
  // Прогресс пересчитается автоматически через computed
  console.log('🔄 Позиции и прогресс обновлены')
}

// Минимальная высота блока (используем calculateBlockHeight)
const getBlockMinHeight = (block) => {
  return calculateBlockHeight(block)
}
// ==========================================
// УПРАВЛЕНИЕ ЗАДАЧАМИ
// ==========================================

// Добавить задачу в блок
const addTask = async (block) => {
  const newTask = {
    id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    title: 'Новая задача',
    status: 'todo',  // по умолчанию 'не начато'
    order: block.tasks ? block.tasks.length : 0
  }
  
  const updatedTasks = block.tasks ? [...block.tasks, newTask] : [newTask]
  
  try {
    const updatedBlock = { ...block, tasks: updatedTasks }
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
    
    forceUpdatePositions()
    showNotificationMessage('✅ Задача добавлена')
  } catch (error) {
    console.error('Ошибка при добавлении задачи:', error)
    showNotificationMessage('❌ Ошибка добавления', 'error')
  }
}

// Переключить статус задачи
const toggleTask = async (block, task, event) => {
  event.stopPropagation()
  
  const updatedTasks = block.tasks.map(t => 
    t.id === task.id ? { ...t, completed: !t.completed } : t
  )
  
  try {
    const updatedBlock = { 
      ...block, 
      tasks: updatedTasks 
    }
    
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
    
    // Принудительно обновляем позиции
    forceUpdatePositions()
    
    // Показываем уведомление с прогрессом
    const progress = getTaskProgress(updatedBlock)
    showNotificationMessage(
      task.completed ? 
      '📋 Задача возвращена' : 
      `✅ Задача выполнена (Прогресс: ${progress}%)`
    )
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error)
  }
}

// Удалить задачу
const deleteTask = async (block, task, event) => {
  event.stopPropagation()
  
  if (!confirm(`Удалить задачу "${task.title}"?`)) return
  
  const updatedTasks = block.tasks.filter(t => t.id !== task.id)
  
  try {
    const updatedBlock = { 
      ...block, 
      tasks: updatedTasks 
    }
    
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
    // 🔥 ПРИНУДИТЕЛЬНО ОБНОВЛЯЕМ ПОЗИЦИИ
    forceUpdatePositions()

    showNotificationMessage('✅ Задача удалена')
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error)
  }
}

// Редактировать задачу
const editTask = async (block, task, newTitle, event) => {
  if (event) event.stopPropagation()
  
  if (!newTitle || newTitle.trim() === '') return
  
  const updatedTasks = block.tasks.map(t => 
    t.id === task.id ? { ...t, title: newTitle } : t
  )
  
  try {
    const updatedBlock = { 
      ...block, 
      tasks: updatedTasks 
    }
    
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
    
    showNotificationMessage('✅ Задача обновлена')
  } catch (error) {
    console.error('Ошибка при редактировании задачи:', error)
  }
}


// ==========================================
// РЕДАКТИРОВАНИЕ ЗАДАЧ
// ==========================================
const taskInput = ref(null)

const startTaskEdit = (block, task, event) => {
  event.stopPropagation()
  
  // Закрываем редактирование у всех других задач
  block.tasks.forEach(t => {
    if (t.id !== task.id) {
      t.isEditing = false
      delete t.editValue
    }
  })
  
  task.isEditing = true
  task.editValue = task.title
  
  // Фокус и выделение текста
  setTimeout(() => {
    const inputs = document.querySelectorAll('.task-edit-input')
    if (inputs.length > 0) {
      const input = inputs[inputs.length - 1]
      input.focus()
      input.select() // Выделяем текст для быстрой замены
    }
  }, 50)
}

const saveTaskEdit = async (block, task, event) => {
  if (event) event.stopPropagation()
  
  if (!task.editValue || task.editValue.trim() === '') {
    task.isEditing = false
    delete task.editValue
    return
  }
  
  const newTitle = task.editValue.trim()
  
  const updatedTasks = block.tasks.map(t => 
    t.id === task.id ? { ...t, title: newTitle, isEditing: false } : t
  )
  
  try {
    const updatedBlock = { 
      ...block, 
      tasks: updatedTasks 
    }
    
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
     // 🔥 ПРИНУДИТЕЛЬНО ОБНОВЛЯЕМ ПОЗИЦИИ
    forceUpdatePositions()

    showNotificationMessage('✅ Задача обновлена')
  } catch (error) {
    console.error('Ошибка при редактировании задачи:', error)
    showNotificationMessage('❌ Ошибка обновления', 'error')
  }
}

const cancelTaskEdit = (task) => {
  task.isEditing = false
  delete task.editValue
}
// ==========================================
// DRAG & DROP ЗАДАЧ
// ==========================================

// Состояние перетаскивания
const draggedTask = ref(null)
const draggedFromBlock = ref(null)
const dragOverBlock = ref(null)
const dragOverTask = ref(null)

// Начало перетаскивания задачи
const onTaskDragStart = (event, block, task) => {
  event.stopPropagation()
  
  // Не начинаем перетаскивание, если это клик по чекбоксу или кнопке
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON') {
    event.preventDefault()
    return
  }
  
  draggedTask.value = task
  draggedFromBlock.value = block
  
  // Сохраняем данные для переноса
  event.dataTransfer.setData('text/plain', JSON.stringify({
    taskId: task.id,
    blockId: block.id,
    taskTitle: task.title
  }))
  event.dataTransfer.effectAllowed = 'move'
  
  // Устанавливаем курсор при перетаскивании
  event.dataTransfer.dropEffect = 'move'
  
  // Добавляем класс для визуального эффекта
  setTimeout(() => {
    event.target.classList.add('task-dragging')
  }, 0)
}

// Окончание перетаскивания
const onTaskDragEnd = (event) => {
  // Убираем классы со всех элементов
  document.querySelectorAll('.task-dragging').forEach(el => {
    el.classList.remove('task-dragging')
  })
  
  draggedTask.value = null
  draggedFromBlock.value = null
  dragOverBlock.value = null
  dragOverTask.value = null
}

// Разрешаем сброс
const onTaskDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

// Вход в зону задачи
const onTaskDragEnter = (block, task) => {
  if (draggedTask.value && draggedTask.value.id !== task.id) {
    dragOverBlock.value = block
    dragOverTask.value = task
  }
}

// Выход из зоны задачи
const onTaskDragLeave = (event) => {
  // Проверяем, не перешли ли мы на дочерний элемент
  const relatedTarget = event.relatedTarget
  if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
    return
  }
  
  dragOverBlock.value = null
  dragOverTask.value = null
}

// Сброс задачи
const onTaskDrop = async (event, targetBlock, targetTask = null) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (!draggedTask.value || !draggedFromBlock.value) return
  
  // Получаем данные о перетаскиваемой задаче
  const sourceBlock = draggedFromBlock.value
  const sourceTask = draggedTask.value
  
  // Если сбрасываем в тот же блок
  if (sourceBlock.id === targetBlock.id) {
    await reorderTaskInsideBlock(sourceBlock, sourceTask, targetTask)
  } else {
    // Перемещаем в другой блок
    await moveTaskBetweenBlocks(sourceBlock, targetBlock, sourceTask, targetTask)
  }
  
  // Сбрасываем состояние
  draggedTask.value = null
  draggedFromBlock.value = null
  dragOverBlock.value = null
  dragOverTask.value = null
}

// Переупорядочивание внутри блока
const reorderTaskInsideBlock = async (block, sourceTask, targetTask) => {
  if (!targetTask || sourceTask.id === targetTask.id) return
  
  // Копируем задачи
  const newTasks = [...block.tasks]
  
  // Находим индексы
  const sourceIndex = newTasks.findIndex(t => t.id === sourceTask.id)
  const targetIndex = newTasks.findIndex(t => t.id === targetTask.id)
  
  if (sourceIndex === -1 || targetIndex === -1) return
  
  // Удаляем и вставляем
  const [movedTask] = newTasks.splice(sourceIndex, 1)
  newTasks.splice(targetIndex, 0, movedTask)
  
  // Обновляем порядок
  newTasks.forEach((task, idx) => {
    task.order = idx
  })
  
  try {
    const updatedBlock = { ...block, tasks: newTasks }
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
    
    forceUpdatePositions()
    showNotificationMessage('✅ Порядок задач изменен')
  } catch (error) {
    console.error('Ошибка при переупорядочивании задач:', error)
    showNotificationMessage('❌ Ошибка', 'error')
  }
}

// Перемещение между блоками
const moveTaskBetweenBlocks = async (sourceBlock, targetBlock, sourceTask, targetTask) => {
  // Удаляем задачу из исходного блока
  const sourceTasks = sourceBlock.tasks.filter(t => t.id !== sourceTask.id)
  
  // Подготавливаем задачу для вставки
  const taskToMove = { 
    ...sourceTask,
    // Сбрасываем состояние редактирования
    isEditing: false 
  }
  
  // Вставляем в целевой блок
  let targetTasks
  if (targetTask) {
    // Вставляем перед конкретной задачей
    const targetIndex = targetBlock.tasks.findIndex(t => t.id === targetTask.id)
    targetTasks = [...targetBlock.tasks]
    targetTasks.splice(targetIndex, 0, taskToMove)
  } else {
    // Добавляем в конец
    targetTasks = [...targetBlock.tasks, taskToMove]
  }
  
  // Обновляем порядок в обоих блоках
  sourceTasks.forEach((task, idx) => { task.order = idx })
  targetTasks.forEach((task, idx) => { task.order = idx })
  
  try {
    // Обновляем исходный блок
    const updatedSourceBlock = { ...sourceBlock, tasks: sourceTasks }
    await axios.put(`${API_URL}/blocks/${sourceBlock.id}`, updatedSourceBlock)
    
    // Обновляем целевой блок
    const updatedTargetBlock = { ...targetBlock, tasks: targetTasks }
    await axios.put(`${API_URL}/blocks/${targetBlock.id}`, updatedTargetBlock)
    
    // Обновляем локальное состояние
    const sourceIndex = blocks.value.findIndex(b => b.id === sourceBlock.id)
    const targetIndex = blocks.value.findIndex(b => b.id === targetBlock.id)
    
    if (sourceIndex !== -1) blocks.value[sourceIndex] = updatedSourceBlock
    if (targetIndex !== -1) blocks.value[targetIndex] = updatedTargetBlock
    
    // Копируем массив для обновления
    blocks.value = [...blocks.value]
    
    forceUpdatePositions()
    showNotificationMessage(`✅ Задача перенесена в "${targetBlock.title}"`)
  } catch (error) {
    console.error('Ошибка при перемещении задачи:', error)
    showNotificationMessage('❌ Ошибка', 'error')
  }
}
// ==========================================
// СТАТУСЫ ЗАДАЧ
// ==========================================

// Получить иконку статуса
const getStatusIcon = (status) => {
  switch(status) {
    case 'done':
      return '✅'
    case 'progress':
      return '⏳'
    case 'todo':
      return '○'
    default:
      return '○'
  }
}

// Получить цвет статуса
const getStatusColor = (status) => {
  switch(status) {
    case 'done':
      return '#22c55e' // зеленый
    case 'progress':
      return '#eab308' // желтый
    case 'todo':
      return '#94a3b8' // серый
    default:
      return '#94a3b8'
  }
}

// Получить следующий статус
const getNextStatus = (currentStatus) => {
  switch(currentStatus) {
    case 'todo':
      return 'progress'
    case 'progress':
      return 'done'
    case 'done':
      return 'todo'
    default:
      return 'todo'
  }
}

// Переключение статуса задачи
const cycleTaskStatus = async (block, task, event) => {
  event.stopPropagation()
  
  const nextStatus = getNextStatus(task.status || 'todo')
  
  const updatedTasks = block.tasks.map(t => 
    t.id === task.id ? { ...t, status: nextStatus } : t
  )
  
  try {
    const updatedBlock = { ...block, tasks: updatedTasks }
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
    
    forceUpdatePositions()
    
    // Показываем уведомление о смене статуса
    const statusMessages = {
      todo: '📋 Задача не начата',
      progress: '⏳ Задача в работе',
      done: '✅ Задача выполнена'
    }
    showNotificationMessage(statusMessages[nextStatus])
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error)
    showNotificationMessage('❌ Ошибка обновления', 'error')
  }
}


// ==========================================
// РЕДАКТИРОВАНИЕ ДАТЫ ПРЯМО В БЛОКЕ
// ==========================================

const startEditingDate = (block) => {
  block.editingDate = true
  block.editDateValue = block.releaseDate
}

const saveDate = async (block) => {
  if (!block.editDateValue) return
  
  try {
    const updatedBlock = { 
      ...block, 
      releaseDate: block.editDateValue,
      editingDate: false 
    }
    
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
    
    showNotificationMessage('✅ Дата обновлена')
  } catch (error) {
    console.error('Ошибка при обновлении даты:', error)
    showNotificationMessage('❌ Ошибка обновления', 'error')
  }
}

const cancelDateEdit = (block) => {
  block.editingDate = false
  delete block.editDateValue
}



// ==========================================
// НАВИГАЦИЯ И СИНХРОНИЗАЦИЯ ПРОКРУТКИ
// ==========================================
const horizontalHeader = ref(null)
// Синхронизация горизонтальной прокрутки
const syncScroll = () => {
  if (!timelineWrapper.value) return
  
  if (viewMode.value === 'horizontal') {
    // Для горизонтального режима - синхронизируем horizontalHeader
    if (horizontalHeader.value) {
      // Убедимся, что значение прокрутки применяется
      horizontalHeader.value.scrollLeft = timelineWrapper.value.scrollLeft
      
      // Для отладки - можно раскомментировать
      // console.log('Sync scroll:', timelineWrapper.value.scrollLeft)
    }
  } else {
    // Для месяцев и кварталов - синхронизируем monthsHeader
    if (monthsHeader.value) {
      monthsHeader.value.scrollLeft = timelineWrapper.value.scrollLeft
    }
  }
}
const isPeriodVisible = (period) => {
  if (!timelineWrapper.value) return false
  
  const wrapper = timelineWrapper.value
  const scrollLeft = wrapper.scrollLeft
  const wrapperWidth = wrapper.clientWidth
  
  const periodIndex = visiblePeriods.findIndex(p => 
    p.type === period.type && 
    (p.monthIndex === period.monthIndex || p.startMonth === period.startMonth)
  )
  
  if (periodIndex === -1) return false
  
  const periodLeft = periodIndex * periodWidth.value
  return periodLeft >= scrollLeft - 50 && periodLeft <= scrollLeft + wrapperWidth - 50
}

const scrollToPeriod = (period) => {
  if (!timelineWrapper.value) return
  
  const periodIndex = visiblePeriods.findIndex(p => 
    p.type === period.type && 
    (p.monthIndex === period.monthIndex || p.startMonth === period.startMonth)
  )
  
  if (periodIndex === -1) return
  
  timelineWrapper.value.scrollTo({
    left: periodIndex * periodWidth.value - 50,
    behavior: 'smooth'
  })
}

const scrollLeft = () => {
  if (!timelineWrapper.value) return
  timelineWrapper.value.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
}

const scrollRight = () => {
  if (!timelineWrapper.value) return
  timelineWrapper.value.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
}

const onWheel = (event) => {
  event.preventDefault()
  if (event.shiftKey) {
    timelineWrapper.value.scrollBy({ left: event.deltaY > 0 ? SCROLL_STEP : -SCROLL_STEP, behavior: 'smooth' })
  } else {
    timelineWrapper.value.scrollBy({ top: event.deltaY > 0 ? 50 : -50, behavior: 'smooth' })
  }
}

const getStatusTitle = (status) => {
  switch(status) {
    case 'done':
      return 'Выполнено'
    case 'progress':
      return 'В работе'
    case 'todo':
      return 'Не начато'
    default:
      return 'Не начато'
  }
}
// ==========================================
// ЗАГРУЗКА И СОХРАНЕНИЕ
// ==========================================

const loadBlocks = async () => {
  try {
    const response = await axios.get(`${API_URL}/blocks`)
    blocks.value = response.data.map(block => ({
      ...block,
      description: block.description || '',
      effort: block.effort || 0,
      completed: block.completed || false,
      releaseDate: block.releaseDate || block.startDate,
      tasks: block.tasks || []
    }))
  } catch (error) {
    console.error('Ошибка загрузки:', error)
  }
}

const createNewBlock = async () => {
  try {
    const today = new Date()
    const releaseDate = new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0]
    
    const newBlock = {
      title: `Новый этап`,
      description: '',
      releaseDate: releaseDate,
      effort: 40,
      completed: false,
      tasks: []
    }
    
    const response = await axios.post(`${API_URL}/blocks`, newBlock)
    blocks.value.push(response.data)
    showNotificationMessage('✅ Этап создан')
  } catch (error) {
    console.error('Ошибка создания:', error)
  }
}

const clearAllBlocks = async () => {
  if (!confirm('Вы уверены, что хотите удалить все этапы?')) return
  try {
    for (const block of blocks.value) {
      await axios.delete(`${API_URL}/blocks/${block.id}`)
    }
    blocks.value = []
    showNotificationMessage('✅ Все этапы удалены')
  } catch (error) {
    console.error('Ошибка при очистке:', error)
  }
}

// ==========================================
// ЧЕКБОКСЫ ВЫПОЛНЕНИЯ
// ==========================================

const toggleBlockCompletion = async (block, event) => {
  event.stopPropagation()
  try {
    const updatedBlock = { ...block, completed: !block.completed }
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) blocks.value[index] = updatedBlock
    showNotificationMessage(updatedBlock.completed ? '✅ Этап выполнен' : '📋 Этап возвращён в работу')
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error)
  }
}

// ==========================================
// РЕДАКТИРОВАНИЕ
// ==========================================

const editBlock = (block) => {
  editingBlock.value = { ...block }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveBlock = async () => {
  try {
    await axios.put(`${API_URL}/blocks/${editingBlock.value.id}`, editingBlock.value)
    const index = blocks.value.findIndex(b => b.id === editingBlock.value.id)
    if (index !== -1) blocks.value[index] = { ...editingBlock.value }
    closeModal()
    showNotificationMessage('✅ Сохранено')
  } catch (error) {
    console.error('Ошибка сохранения:', error)
  }
}

const deleteBlock = async () => {
  if (!confirm('Удалить этап?')) return
  try {
    await axios.delete(`${API_URL}/blocks/${editingBlock.value.id}`)
    blocks.value = blocks.value.filter(b => b.id !== editingBlock.value.id)
    closeModal()
    showNotificationMessage('✅ Удалено')
  } catch (error) {
    console.error('Ошибка удаления:', error)
  }
}

const setViewMode = (mode) => {
  // Проверяем, что режим допустим
  const validModes = ['horizontal', 'quarters', 'heatmap']
  if (!validModes.includes(mode)) return
  
  viewMode.value = mode
  localStorage.setItem('roadmap-view-mode', mode)
  
  // Сбрасываем позиции блоков только для режимов с временной шкалой
  if (mode !== 'heatmap') {
    blocks.value = blocks.value.map(block => {
      const newBlock = { ...block }
      delete newBlock.positionInMonth
      return newBlock
    })
  }
  
  // Сбрасываем прокрутку
  if (timelineWrapper.value) {
    timelineWrapper.value.scrollTo({ left: 0, top: 0 })
  }
  
  // Принудительно синхронизируем шапку
  setTimeout(() => {
    syncScroll()
  }, 50)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

const showNotificationMessage = (message, type = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  setTimeout(() => { showNotification.value = false }, 2000)
}

// Следим за изменением режима отображения
watch(viewMode, () => {
  // Принудительно обновляем блоки
  blocks.value = [...blocks.value]
})

onMounted(() => {
  axios.post(`${API_URL}/init`).then(() => loadBlocks())
  setInterval(() => {
    currentQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
  }, 10000)
})

// ==========================================
// ПРОГРЕСС ВЫПОЛНЕНИЯ ЗАДАЧ
// ==========================================

const getTaskProgress = (block) => {
  if (!block.tasks || block.tasks.length === 0) return 0
  
  // Считаем выполненные задачи (status === 'done')
  const completedTasks = block.tasks.filter(task => task.status === 'done').length
  return Math.round((completedTasks / block.tasks.length) * 100)
}

const getCompletedTasksCount = (block) => {
  if (!block.tasks) return 0
  return block.tasks.filter(task => task.status === 'done').length
}

// ==========================================
// ЦВЕТ БЛОКА НА ОСНОВЕ ПРОГРЕССА
// ==========================================

const getBlockColorByProgress = (block) => {
  const progress = getTaskProgress(block)
  
  if (progress === 0) {
    // Нет выполненных задач - красноватый оттенок
    return 'rgba(254, 202, 202, 0.3)' // очень светлый красный
  } else if (progress === 100) {
    // Все задачи выполнены - зеленый
    return 'rgba(187, 247, 208, 0.4)' // очень светлый зеленый
  } else {
    // Градиент от красного к зеленому в зависимости от прогресса
    // Красный: rgb(254, 202, 202)
    // Зеленый: rgb(187, 247, 208)
    
    const redStart = 254
    const greenStart = 202
    const blueStart = 202
    
    const redEnd = 187
    const greenEnd = 247
    const blueEnd = 208
    
    // Интерполяция между начальным и конечным цветом
    const r = Math.round(redStart + (redEnd - redStart) * (progress / 100))
    const g = Math.round(greenStart + (greenEnd - greenStart) * (progress / 100))
    const b = Math.round(blueStart + (blueEnd - blueStart) * (progress / 100))
    
    return `rgba(${r}, ${g}, ${b}, 0.3)`
  }
}

// Альтернативная функция с более яркими цветами
const getBlockColorByProgressVibrant = (block) => {
  const progress = getTaskProgress(block)
  
  if (progress === 0) {
    return '#fee2e2' // светло-красный
  } else if (progress === 100) {
    return '#dcfce7' // светло-зеленый
  } else {
    // Градиент от красного к зеленому
    const r = Math.round(255 - (progress * 1.5)) // от 255 до 105
    const g = Math.round(155 + progress) // от 155 до 255
    const b = Math.round(155 + progress * 0.5) // от 155 до 205
    
    return `rgb(${r}, ${g}, ${b})`
  }
}

// ==========================================
// ЭКСПОРТ В PNG И PDF
// ==========================================
// ==========================================
// ЭКСПОРТ В PNG И PDF (полная версия)
// ==========================================

const exportAsPNG = async () => {
  try {
    showNotificationMessage('🔄 Подготовка изображения...', 'info')
    
    // Находим основной контейнер с роадмапом
    const mainContent = document.querySelector('.main-content')
    const timelineWrapper = document.querySelector('.timeline-wrapper')
    const timelineGrid = document.querySelector('.timeline-grid')
    const monthsHeaderElement = document.querySelector('.months-header')
    const horizontalHeaderElement = document.querySelector('.horizontal-header')
    
    if (!mainContent || !timelineWrapper || !timelineGrid) return
    
    // Сохраняем исходные стили
    const originalMainHeight = mainContent.style.height
    const originalWrapperHeight = timelineWrapper.style.height
    const originalWrapperOverflow = timelineWrapper.style.overflow
    const originalGridHeight = timelineGrid.style.height
    
    // Временно убираем ограничения высоты
    mainContent.style.height = 'auto'
    timelineWrapper.style.height = 'auto'
    timelineWrapper.style.overflow = 'visible'
    
    // Определяем нужную шапку в зависимости от режима
    const header = viewMode.value === 'horizontal' ? horizontalHeaderElement : monthsHeaderElement
    
    // Вычисляем полную высоту контента
    const fullHeight = timelineGrid.scrollHeight + (header?.scrollHeight || 0) + 40
    
    // Создаем временный контейнер
    const tempContainer = document.createElement('div')
    tempContainer.style.width = timelineWrapper.scrollWidth + 'px'
    tempContainer.style.backgroundColor = '#ffffff'
    tempContainer.style.padding = '20px'
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.zIndex = '-1000'
    
    // Клонируем шапку (если есть)
    if (header) {
      const headerClone = header.cloneNode(true)
      headerClone.style.margin = '0 0 20px 0'
      headerClone.style.borderBottom = '2px solid #3b82f6'
      headerClone.style.pointerEvents = 'auto' // Сбрасываем pointer-events для клона
      headerClone.style.overflow = 'visible' // Показываем всю шапку
      
      // Для горизонтальной шапки убираем лишние ограничения
      if (viewMode.value === 'horizontal') {
        headerClone.style.pointerEvents = 'auto'
        headerClone.style.height = '50px' // Фиксируем высоту
      }
      
      tempContainer.appendChild(headerClone)
    }
    
    // Клонируем сетку с блоками
    const gridClone = timelineGrid.cloneNode(true)
    gridClone.style.height = 'auto'
    gridClone.style.minHeight = fullHeight + 'px'
    gridClone.style.overflow = 'visible'
    
    // Убираем классы перетаскивания у клона
    gridClone.querySelectorAll('.line-dragging-active, .block-dragging, .block-header-dragging').forEach(el => {
      el.classList.remove('line-dragging-active', 'block-dragging', 'block-header-dragging')
    })
    
    tempContainer.appendChild(gridClone)
    
    document.body.appendChild(tempContainer)
    
    // Даем время на рендер
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Создаем canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      allowTaint: false,
      useCORS: true,
      logging: false,
      windowWidth: tempContainer.scrollWidth,
      windowHeight: tempContainer.scrollHeight,
      onclone: (clonedDoc) => {
        // Убираем скроллы в клоне
        const clonedElements = clonedDoc.querySelectorAll('.timeline-wrapper, .main-content, .horizontal-header, .months-header')
        clonedElements.forEach(el => {
          if (el) {
            el.style.overflow = 'visible'
            el.style.height = 'auto'
            el.style.pointerEvents = 'auto'
          }
        })
        
        // Для горизонтальной шапки убираем pointer-events: none
        const clonedHeader = clonedDoc.querySelector('.horizontal-header')
        if (clonedHeader) {
          clonedHeader.style.pointerEvents = 'auto'
          clonedHeader.style.overflow = 'visible'
        }
      }
    })
    
    // Удаляем временный контейнер
    document.body.removeChild(tempContainer)
    
    // Восстанавливаем исходные стили
    mainContent.style.height = originalMainHeight
    timelineWrapper.style.height = originalWrapperHeight
    timelineWrapper.style.overflow = originalWrapperOverflow
    timelineGrid.style.height = originalGridHeight
    
    // Создаем ссылку для скачивания
    const modeName = viewMode.value === 'horizontal' ? 'horizontal' : 
                    viewMode.value === 'quarters' ? 'quarters' : 'months'
    
    const link = document.createElement('a')
    link.download = `roadmap-${modeName}-${new Date().toISOString().slice(0,10)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    showNotificationMessage(`✅ Изображение сохранено (${modeName})`)
  } catch (error) {
    console.error('Ошибка при экспорте PNG:', error)
    showNotificationMessage('❌ Ошибка экспорта', 'error')
    
    // Восстанавливаем стили в случае ошибки
    const mainContent = document.querySelector('.main-content')
    const timelineWrapper = document.querySelector('.timeline-wrapper')
    const timelineGrid = document.querySelector('.timeline-grid')
    
    if (mainContent) mainContent.style.height = ''
    if (timelineWrapper) {
      timelineWrapper.style.height = ''
      timelineWrapper.style.overflow = ''
    }
    if (timelineGrid) timelineGrid.style.height = ''
  }
}
const exportAsPDF = async () => {
  try {
    showNotificationMessage('🔄 Подготовка PDF (А4, альбомная)...', 'info')
    
    // Находим основные элементы
    const mainContent = document.querySelector('.main-content')
    const timelineWrapper = document.querySelector('.timeline-wrapper')
    const timelineGrid = document.querySelector('.timeline-grid')
    const monthsHeaderElement = document.querySelector('.months-header')
    const horizontalHeaderElement = document.querySelector('.horizontal-header')
    
    if (!mainContent || !timelineWrapper || !timelineGrid) return
    
    // Сохраняем исходные стили
    const originalMainHeight = mainContent.style.height
    const originalWrapperHeight = timelineWrapper.style.height
    const originalWrapperOverflow = timelineWrapper.style.overflow
    const originalGridHeight = timelineGrid.style.height
    
    // Временно убираем ограничения высоты
    mainContent.style.height = 'auto'
    timelineWrapper.style.height = 'auto'
    timelineWrapper.style.overflow = 'visible'
    
    // Определяем нужную шапку
    const header = viewMode.value === 'horizontal' ? horizontalHeaderElement : monthsHeaderElement
    
    // Вычисляем полную высоту контента
    const fullHeight = timelineGrid.scrollHeight + (header?.scrollHeight || 0) + 40
    
    // Создаем временный контейнер
    const tempContainer = document.createElement('div')
    tempContainer.style.width = timelineWrapper.scrollWidth + 'px'
    tempContainer.style.backgroundColor = '#ffffff'
    tempContainer.style.padding = '20px'
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.zIndex = '-1000'
    
    // Клонируем шапку (если есть)
    if (header) {
      const headerClone = header.cloneNode(true)
      headerClone.style.margin = '0 0 20px 0'
      headerClone.style.borderBottom = '2px solid #3b82f6'
      headerClone.style.pointerEvents = 'auto'
      headerClone.style.overflow = 'visible'
      
      if (viewMode.value === 'horizontal') {
        headerClone.style.pointerEvents = 'auto'
        headerClone.style.height = '50px'
      }
      
      tempContainer.appendChild(headerClone)
    }
    
    // Клонируем сетку с блоками
    const gridClone = timelineGrid.cloneNode(true)
    gridClone.style.height = 'auto'
    gridClone.style.minHeight = fullHeight + 'px'
    gridClone.style.overflow = 'visible'
    
    // Убираем классы перетаскивания
    gridClone.querySelectorAll('.line-dragging-active, .block-dragging, .block-header-dragging').forEach(el => {
      el.classList.remove('line-dragging-active', 'block-dragging', 'block-header-dragging')
    })
    
    tempContainer.appendChild(gridClone)
    
    document.body.appendChild(tempContainer)
    
    // Даем время на рендер
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Создаем canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      allowTaint: false,
      useCORS: true,
      logging: false,
      windowWidth: tempContainer.scrollWidth,
      windowHeight: tempContainer.scrollHeight
    })
    
    // Удаляем временный контейнер
    document.body.removeChild(tempContainer)
    
    // Восстанавливаем исходные стили
    mainContent.style.height = originalMainHeight
    timelineWrapper.style.height = originalWrapperHeight
    timelineWrapper.style.overflow = originalWrapperOverflow
    timelineGrid.style.height = originalGridHeight
    
    // Получаем изображение
    const imgData = canvas.toDataURL('image/png')
    
    // Создаем PDF
    const { jsPDF } = await import('jspdf')
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    const margin = 10
    const imgWidth = pageWidth - (margin * 2)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // Добавляем изображение в PDF
    if (imgHeight <= pageHeight - (margin * 2)) {
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight)
    } else {
      let yPosition = margin
      let remainingHeight = imgHeight
      let pageNum = 1
      
      while (remainingHeight > 0) {
        if (pageNum > 1) {
          pdf.addPage()
          yPosition = margin - ((pageNum - 1) * (pageHeight - (margin * 2)))
        }
        
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight, undefined, 'FAST')
        
        remainingHeight -= (pageHeight - (margin * 2))
        pageNum++
      }
    }
    
    // Добавляем информацию о режиме
    const modeName = viewMode.value === 'horizontal' ? 'Горизонтальный' : 
                    viewMode.value === 'quarters' ? 'По кварталам' : 'По месяцам'
    
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text(
      `Роадмап 2026 • ${modeName} • ${new Date().toLocaleDateString('ru-RU')}`, 
      pageWidth - 100, 
      pageHeight - 5
    )
    
    pdf.save(`roadmap-${viewMode.value}-${new Date().toISOString().slice(0,10)}.pdf`)
    
    showNotificationMessage(`✅ PDF сохранен (${modeName})`)
  } catch (error) {
    console.error('Ошибка при экспорте PDF:', error)
    showNotificationMessage('❌ Ошибка экспорта', 'error')
    
    // Восстанавливаем стили
    const mainContent = document.querySelector('.main-content')
    const timelineWrapper = document.querySelector('.timeline-wrapper')
    const timelineGrid = document.querySelector('.timeline-grid')
    
    if (mainContent) mainContent.style.height = ''
    if (timelineWrapper) {
      timelineWrapper.style.height = ''
      timelineWrapper.style.overflow = ''
    }
    if (timelineGrid) timelineGrid.style.height = ''
  }
}


// Расчет позиции линии по дате (в пикселях от начала месяца)
const getDatePosition = (block) => {
  if (!block.releaseDate) return 0
  
  const date = new Date(block.releaseDate)
  const month = date.getMonth()
  const day = date.getDate()
  
  // Получаем количество дней в месяце
  const daysInMonth = new Date(2026, month + 1, 0).getDate()
  
  // Ширина дня с учетом реального количества дней
  const dayWidth = HORIZONTAL_MONTH_WIDTH / daysInMonth
  
  return month * HORIZONTAL_MONTH_WIDTH + (day - 1) * dayWidth + (dayWidth / 2)
}
// Расчет позиции линии по дате (в пикселях от левого края)
const getLinePosition = (block) => {
  if (!block.releaseDate) return 0
  
  const date = new Date(block.releaseDate)
  const month = date.getMonth()
  const day = date.getDate()
  
  const daysInMonth = new Date(2026, month + 1, 0).getDate()
  const dayWidth = HORIZONTAL_MONTH_WIDTH / daysInMonth
  
  // Просто центр дня, никаких смещений
  return month * HORIZONTAL_MONTH_WIDTH + (day - 1) * dayWidth + (dayWidth / 2)
}

//отладочная функция для линии
const checkLinePositions = () => {
  console.log('=== ПРОВЕРКА ЛИНИЙ ===')
  document.querySelectorAll('.block-date-connection').forEach((line, i) => {
    const rect = line.getBoundingClientRect()
    const left = line.style.left
    console.log(`Линия ${i}:`, {
      left: left,
      actualX: rect.left,
      visible: rect.width > 0 && rect.height > 0,
      parent: line.parentElement?.className
    })
  })
}


// Начало перетаскивания линии

// Начало перетаскивания линии
const onLineDragStart = (event, block) => {
  event.stopPropagation()
  
  console.log('🚀 Начало перетаскивания линии для блока:', block.title)
  
  // Сохраняем блок, который перетаскиваем
  draggedLineBlock.value = block
  draggedBlockId.value = block.id
  isDraggingLine.value = true
  
  // Получаем текущую позицию линии
  const currentLeft = getLinePosition(block)
  
  // Запоминаем позиции
  dragStartX.value = currentLeft
  dragCurrentX.value = currentLeft
  blockOriginalLeft.value = getBlockLeft(block)
  blockDragCurrentX.value = getBlockLeft(block)
  
  // Устанавливаем данные для перетаскивания
  event.dataTransfer.setData('text/plain', JSON.stringify({
    blockId: block.id,
    type: 'line'
  }))
  event.dataTransfer.effectAllowed = 'move'
  
  // Скрываем стандартное изображение
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  event.dataTransfer.setDragImage(canvas, 0, 0)
  
  // Добавляем классы
  event.target.classList.add('line-dragging')
  
  // Показываем подсказку с текущей датой
  previewDate.value = formatDate(block.releaseDate)
  document.body.classList.add('is-dragging')
}

// Окончание перетаскивания

// Окончание перетаскивания
const onLineDragEnd = async (event) => {
  // Если есть новое положение, применяем его
  if (isDraggingLine.value && draggedLineBlock.value && previewDate.value) {
    try {
      // Конвертируем previewDate обратно в формат YYYY-MM-DD
      const [day, month, year] = previewDate.value.split('.')
      const newDate = `${year}-${month}-${day}`
      
      // Обновляем дату блока
      await updateBlockDate(draggedLineBlock.value, newDate)
      
      showNotificationMessage(`📅 Дата изменена на ${previewDate.value}`)
    } catch (error) {
      console.error('Ошибка при обновлении даты:', error)
      showNotificationMessage('❌ Ошибка при изменении даты', 'error')
    }
  }
  
  // Убираем классы и восстанавливаем transitions
  document.querySelectorAll('.line-dragging, .line-dragging-active, .block-dragging').forEach(el => {
    el.classList.remove('line-dragging', 'line-dragging-active', 'block-dragging')
    el.style.transition = ''
    el.style.left = ''
  })
  
  // Сбрасываем состояние
  draggedLineBlock.value = null
  draggedBlockId.value = null
  isDraggingLine.value = false
  isDraggingHeader.value = false
  draggingBlockHeader.value = null
  dragStartX.value = 0
  dragCurrentX.value = 0
  blockDragCurrentX.value = 0
  previewDate.value = ''
  removePositionIndicator()
  document.body.classList.remove('is-dragging')
}

// перетаскивания блока
const draggedBlockId = ref(null)
const blockDragCurrentX = ref(0)
const blockOriginalLeft = ref(0)

// Конвертация позиции в пикселях в дату (улучшенная версия)
const positionToDate = (x) => {
  const container = document.querySelector('.timeline-container')
  const containerLeft = container ? container.offsetLeft : 20
  const adjustedX = x - containerLeft - 20
  
  if (adjustedX < 0) return null
  
  // Определяем месяц с учетом ширины
  const monthIndex = Math.floor(adjustedX / HORIZONTAL_MONTH_WIDTH)
  if (monthIndex < 0 || monthIndex >= 12) return null
  
  // Определяем день
  const monthStartX = monthIndex * HORIZONTAL_MONTH_WIDTH
  const dayOffset = adjustedX - monthStartX
  const daysInMonth = new Date(2026, monthIndex + 1, 0).getDate()
  const dayWidth = HORIZONTAL_MONTH_WIDTH / daysInMonth
  
  // Более точное вычисление дня
  let day = Math.floor(dayOffset / dayWidth) + 1
  day = Math.max(1, Math.min(day, daysInMonth))
  
  // Корректировка для границ
  if (dayOffset < dayWidth * 0.3) day = 1
  if (dayOffset > HORIZONTAL_MONTH_WIDTH - dayWidth * 0.3) day = daysInMonth
  
  const date = new Date(2026, monthIndex, day)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const dayStr = day.toString().padStart(2, '0')
  
  return `${year}-${month}-${dayStr}`
}

// Обновление даты блока
const updateBlockDate = async (block, newDate) => {
  try {
    const updatedBlock = { 
      ...block, 
      releaseDate: newDate
    }
    
    await axios.put(`${API_URL}/blocks/${block.id}`, updatedBlock)
    
    // Обновляем локальное состояние
    const index = blocks.value.findIndex(b => b.id === block.id)
    if (index !== -1) {
      blocks.value[index] = updatedBlock
    }
    
    // Принудительно обновляем позиции
    forceUpdatePositions()
    
  } catch (error) {
    console.error('Ошибка при обновлении даты:', error)
    throw error
  }
}
// Отображение индикатора позиции при перетаскивании
const showPositionIndicator = (x) => {
  // Удаляем старый индикатор
  const oldIndicator = document.querySelector('.line-position-indicator')
  if (oldIndicator) oldIndicator.remove()
  
  // Создаем новый
  const indicator = document.createElement('div')
  indicator.className = 'line-position-indicator'
  indicator.style.left = x + 'px'
  
  const grid = document.querySelector('.timeline-grid')
  if (grid) grid.appendChild(indicator)
}

// Плавное обновление позиции линии
const updateLinePosition = (blockId, x) => {
  const line = document.querySelector(`.timeline-line[data-block-id="${blockId}"]`)
  if (line) {
    line.style.transition = 'none'
    line.style.left = x + 'px'
    // Принудительный ререндер
    line.offsetHeight
  }
}

// Обновляем обработчик dragover на timeline-grid
const onGridDragOver = (event) => {
  event.preventDefault()
  
  if ((isDraggingLine.value || isDraggingHeader.value) && draggedLineBlock.value) {
    // Получаем позицию курсора
    const gridRect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - gridRect.left + timelineWrapper.value.scrollLeft
    
    // Ограничиваем позицию
    const maxX = months.length * HORIZONTAL_MONTH_WIDTH + 50
    const constrainedX = Math.max(20, Math.min(x, maxX))
    
    // Обновляем позиции
    dragCurrentX.value = constrainedX
    
    // Вычисляем позицию блока (центрируем относительно линии)
    // Блок смещен влево на 10px относительно линии, как в getBlockLeft
    const blockX = constrainedX - 10
    
    // Обновляем позицию блока
    blockDragCurrentX.value = blockX
    
    // Получаем дату для текущей позиции
    const newDate = positionToDate(constrainedX)
    if (newDate) {
      previewDate.value = formatDate(newDate)
    }
    
    // Показываем индикатор
    showPositionIndicator(constrainedX)
    
    // Обновляем стили напрямую для плавности
    updateElementPositions(draggedLineBlock.value.id, constrainedX, blockX)
  }
}

// Функция для обновления позиций элементов
const updateElementPositions = (blockId, lineX, blockX) => {
  // Обновляем линию
  const line = document.querySelector(`.timeline-line[data-block-id="${blockId}"]`)
  if (line) {
    line.style.transition = 'none'
    line.style.left = lineX + 'px'
    line.classList.add('line-dragging-active')
  }
  
  // Обновляем блок
  const block = document.querySelector(`.block[data-block-id="${blockId}"]`)
  if (block) {
    block.style.transition = 'none'
    block.style.left = blockX + 'px'
    block.classList.add('block-dragging')
  }
}
const removePositionIndicator = () => {
  const indicator = document.querySelector('.line-position-indicator')
  if (indicator) indicator.remove()
}

// Обработка сброса на сетку
const onGridDrop = async (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  if (!draggedLineBlock.value) return
  
  try {
    // Получаем данные о перетаскивании
    const dragData = JSON.parse(event.dataTransfer.getData('text/plain'))
    
    // Проверяем, что это действительно линия
    if (dragData.type !== 'line') return
    
    // Получаем блок, который перетаскиваем
    const sourceBlock = draggedLineBlock.value
    
    // Получаем позицию сброса относительно контейнера
    const rect = event.currentTarget.getBoundingClientRect()
    
    // Вычисляем позицию в пикселях относительно левого края с учетом прокрутки
    const dropX = event.clientX - rect.left + timelineWrapper.value.scrollLeft
    
    // Конвертируем позицию в дату
    const newDate = positionToDate(dropX)
    
    if (!newDate) {
      showNotificationMessage('❌ Не удалось определить дату', 'error')
      return
    }
    
    // Обновляем дату блока
    await updateBlockDate(sourceBlock, newDate)
    
    showNotificationMessage(`📅 Дата изменена на ${formatDate(newDate)}`)
    
    // Убираем индикатор
    removePositionIndicator()
    
  } catch (error) {
    console.error('Ошибка при перемещении линии:', error)
    showNotificationMessage('❌ Ошибка при изменении даты', 'error')
  }
  
  // Сбрасываем состояние
  draggedLineBlock.value = null
  isDraggingLine.value = false
}
// Состояние для перетаскивания шапки блока
const draggingBlockHeader = ref(null)
const isDraggingHeader = ref(false)

// Начало перетаскивания шапки блока
// Начало перетаскивания шапки блока
const onBlockHeaderDragStart = (event, block) => {
  event.stopPropagation()
  
  console.log('🚀 Начало перетаскивания шапки блока:', block.title)
  
  // Сохраняем блок
  draggingBlockHeader.value = block
  draggedBlockId.value = block.id
  isDraggingHeader.value = true
  isDraggingLine.value = true
  draggedLineBlock.value = block
  
  // Получаем текущие позиции
  const currentLeft = getLinePosition(block)
  const blockLeft = getBlockLeft(block)
  
  // Запоминаем позиции
  dragStartX.value = currentLeft
  dragCurrentX.value = currentLeft
  blockOriginalLeft.value = blockLeft
  blockDragCurrentX.value = blockLeft
  
  // Устанавливаем данные для перетаскивания
  event.dataTransfer.setData('text/plain', JSON.stringify({
    blockId: block.id,
    type: 'header'
  }))
  event.dataTransfer.effectAllowed = 'move'
  
  // Скрываем стандартное изображение
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  event.dataTransfer.setDragImage(canvas, 0, 0)
  
  // Добавляем классы
  event.target.classList.add('block-header-dragging')
  
  // Показываем подсказку
  previewDate.value = formatDate(block.releaseDate)
}

// Окончание перетаскивания шапки
const onBlockHeaderDragEnd = async (event) => {
  // Обновляем дату, если есть новое положение
  if (isDraggingHeader.value && draggingBlockHeader.value && previewDate.value) {
    try {
      const [day, month, year] = previewDate.value.split('.')
      const newDate = `${year}-${month}-${day}`
      
      await updateBlockDate(draggingBlockHeader.value, newDate)
      showNotificationMessage(`📅 Блок перемещен на ${previewDate.value}`)
    } catch (error) {
      console.error('Ошибка при обновлении даты:', error)
      showNotificationMessage('❌ Ошибка при перемещении', 'error')
    }
  }
  
  // Убираем классы
  document.querySelectorAll('.block-header-dragging, .line-dragging-active').forEach(el => {
    el.classList.remove('block-header-dragging', 'line-dragging-active')
  })
  
  // Сбрасываем состояние
  draggingBlockHeader.value = null
  isDraggingHeader.value = false
  draggedLineBlock.value = null
  isDraggingLine.value = false
  dragStartX.value = 0
  dragCurrentX.value = 0
  previewDate.value = ''
  removePositionIndicator()
}

// Синхронизация позиций линии и блока
const syncBlockAndLine = (blockId, date) => {
  const block = blocks.value.find(b => b.id === blockId)
  if (!block) return
  
  // Вычисляем новые позиции
  const month = new Date(date).getMonth()
  const lineX = month * HORIZONTAL_MONTH_WIDTH + 200 // центр месяца
  const blockX = lineX - 10
  
  // Обновляем в DOM
  updateElementPositions(blockId, lineX, blockX)
}

// Цвет от синего (мало) до красного (много)
const getHeatColor = (effort) => {
  return getEffortColor(effort, 0.8) // 0.8 - небольшая прозрачность для красоты
}
// Стиль для блока (пропорционально трудозатратам)
const getBlockStyle = (block) => {
  const effort = block.effort || 0
  const percentOfTotal = totalEffort.value > 0 ? (effort / totalEffort.value) * 100 : 0
  
  return {
    height: percentOfTotal + '%',
    backgroundColor: getHeatColor(effort),
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.2s',
    overflow: 'hidden',
    minHeight: '30px',
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
  }
}
// ==========================================
// ТЕПЛОВАЯ КАРТА - ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
// ==========================================

// Общая сумма трудозатрат
const totalEffort = computed(() => {
  if (!blocks.value || !Array.isArray(blocks.value)) return 0
  return blocks.value.reduce((sum, block) => sum + (block.effort || 0), 0)
})

// Выполненные трудозатраты (по задачам)
const completedEffort = computed(() => {
  if (!blocks.value || !Array.isArray(blocks.value)) return 0
  return blocks.value.reduce((sum, block) => {
    if (!block.tasks || !Array.isArray(block.tasks)) return sum
    const completedTasks = block.tasks.filter(t => t && t.status === 'done')
    return sum + completedTasks.reduce((taskSum, task) => taskSum + (task.effort || 0), 0)
  }, 0)
})

// Процент выполненных трудозатрат
const completedEffortPercent = computed(() => {
  if (totalEffort.value === 0) return 0
  return Math.round((completedEffort.value / totalEffort.value) * 100)
})

// Блоки, отсортированные по трудозатратам (для тепловой карты)
const sortedByEffort = computed(() => {
  if (!blocks.value || !Array.isArray(blocks.value)) return []
  return [...blocks.value].sort((a, b) => (b.effort || 0) - (a.effort || 0))
})


// Функция для расчета прямоугольников с точным заполнением
const getRectangleStyle = (block) => {
  const effort = block.effort || 0
  const total = totalEffort.value
  
  if (total === 0) return {}
  
  // Процент от общих трудозатрат
  const percent = (effort / total) * 100
  
  // Используем CSS Grid для точного позиционирования
  // Здесь мы не задаем фиксированные размеры,
  // а полагаемся на CSS Grid в родительском контейнере
  
  return {
    backgroundColor: getHeatColor(effort),
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    // Минимальные размеры для читаемости
    minWidth: '120px',
    minHeight: '120px',
    // Автоматическое масштабирование
    flex: `1 1 ${percent}%`
  }
}

// Функция для расчета стиля блока на основе процента трудозатрат
const getBlockAreaStyle = (block) => {
  const effort = block.effort || 0
  const total = totalEffort.value
  
  if (total === 0) return {}
  
  // Процент от общих трудозатрат
  const percent = (effort / total) * 100
  
  // Конвертируем процент в площадь для Grid
  // Используем grid-area с span
  
  return {
    backgroundColor: getHeatColor(effort),
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    // Блок будет занимать площадь пропорционально проценту
    // Это будет обработано через CSS Grid в родителе
  }
}

// Функция для расчета позиции блока в сетке
// Функция для расчета позиции блока в сетке (квадратные блоки)
const getBlockPosition = (block, index, allBlocks) => {
  const effort = block.effort || 0
  const total = totalEffort.value
  
  if (total === 0) return {}
  
  // Процент от общих трудозатрат
  const percent = (effort / total) * 100
  
  // Конвертируем процент в количество ячеек сетки (100x100 = 10000 ячеек)
  const totalCells = 10000
  const blockCells = Math.max(50, Math.floor((percent / 100) * totalCells))
  
  // Делаем блок квадратным - одинаковые ширина и высота
  const blockSize = Math.max(3, Math.min(30, Math.floor(Math.sqrt(blockCells))))
  
  return {
    '--width': blockSize,
    '--height': blockSize
  }
}
// Более сложный алгоритм для идеального заполнения
const calculateBlockPositions = (blocks) => {
  if (!blocks.length) return []
  
  const total = totalEffort.value
  const grid = [] // 2D массив для отслеживания занятых ячеек
  const positions = []
  
  // Инициализируем сетку 100x100
  for (let i = 0; i < 100; i++) {
    grid[i] = Array(100).fill(false)
  }
  
  // Сортируем блоки по убыванию (самые большие первыми)
  const sortedBlocks = [...blocks].sort((a, b) => (b.effort || 0) - (a.effort || 0))
  
  sortedBlocks.forEach(block => {
    const effort = block.effort || 0
    const percent = (effort / total) * 100
    const targetCells = Math.round((percent / 100) * 10000)
    
    // Ищем оптимальный размер блока
    let bestSize = { cols: 1, rows: 1 }
    let bestDiff = Infinity
    
    for (let cols = 1; cols <= 50; cols++) {
      for (let rows = 1; rows <= 50; rows++) {
        const cells = cols * rows
        const diff = Math.abs(cells - targetCells)
        if (diff < bestDiff) {
          bestDiff = diff
          bestSize = { cols, rows }
        }
      }
    }
    
    // Ищем свободное место для блока
    let placed = false
    for (let row = 0; row < 100 - bestSize.rows + 1 && !placed; row++) {
      for (let col = 0; col < 100 - bestSize.cols + 1 && !placed; col++) {
        // Проверяем, свободны ли все ячейки
        let free = true
        for (let r = 0; r < bestSize.rows && free; r++) {
          for (let c = 0; c < bestSize.cols && free; c++) {
            if (grid[row + r][col + c]) free = false
          }
        }
        
        if (free) {
          // Занимаем ячейки
          for (let r = 0; r < bestSize.rows; r++) {
            for (let c = 0; c < bestSize.cols; c++) {
              grid[row + r][col + c] = true
            }
          }
          
          positions.push({
            block,
            col,
            row,
            cols: bestSize.cols,
            rows: bestSize.rows
          })
          placed = true
        }
      }
    }
  })
  
  return positions
}

// Цвет задачи в зависимости от статуса
const getTaskColor = (task) => {
  switch(task.status) {
    case 'done': return '#22c55e' // зеленый - выполнено
    case 'progress': return '#eab308' // желтый - в работе
    case 'todo': return '#94a3b8' // серый - не начато
    default: return '#94a3b8'
  }
}

// Размер блока в зависимости от трудозатрат
const getBlockGridStyle = (block) => {
  const effort = block.effort || 0
  const maxEffort = Math.max(...blocks.value.map(b => b.effort || 0), 1)
  
  // Размер от 150px до 350px
  const minSize = 150
  const maxSize = 350
  const size = minSize + (effort / maxEffort) * (maxSize - minSize)
  
  return {
    width: size + 'px',
    height: size + 'px',
    backgroundColor: getEffortColor(effort, 0.9),
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }
}
</script>

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

/* ========== ШАПКА ========== */
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

/* ========== ТУЛБАР ========== */
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

/* ========== СТАТИСТИКА ========== */
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

.stat-item:nth-child(1) .stat-value { color: #3b82f6; }
.stat-item:nth-child(2) .stat-value { color: #22c55e; }
.stat-item:nth-child(3) .stat-value { color: #eab308; }
.stat-item:nth-child(4) .stat-value { color: #64748b; }
.stat-item:nth-child(5) .stat-value { color: #22c55e; }
.stat-item:nth-child(6) .stat-value { 
  background: linear-gradient(135deg, #3b82f6, #22c55e);
  color: white;
}

/* ========== НАВИГАЦИЯ ========== */
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

/* ========== ОСНОВНОЙ КОНТЕНТ ========== */
.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* ========== ШАПКИ ПЕРИОДОВ ========== */
.months-header{
  flex-shrink: 0;
  height: 50px;
  background: white;
  border-bottom: 2px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  position: relative;
}


.horizontal-header {
   flex-shrink: 0;
  height: 40px; /* Используем 40px */
  background: white;
  border-bottom: 2px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  position: relative;
  padding-left: 20px;
  pointer-events: auto;
}


.months-header::-webkit-scrollbar,
.horizontal-header::-webkit-scrollbar {
  display: none;
}

.months-header-container,
.horizontal-header-container {
  position: relative;
  height: 100%;
  min-width: 100%;
}

.horizontal-header-container {
  padding-left: 20px;
}

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
  border-right: 1px solid rgba(169, 175, 241, 0.6);
  background: white;
  box-sizing: border-box;
}

.month-header-cell:last-child,
.horizontal-month-cell:last-child {
  border-right: none;
}

.month-sub {
  font-size: 0.7rem;
  font-weight: 400;
  color: #94a3b8;
}

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
  z-index: 10;
}

/* ========== КОНТЕЙНЕР С ПРОКРУТКОЙ ========== */
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

/* ========== СЕТКА ========== */
.timeline-grid {
  background-image: none !important;
  background-color: transparent !important;
  position: relative;
  z-index: 1;
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
  transform: translateX(-17px);
}

/* Линии начала месяца */
.horizontal-month-line,
.month-divider {
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

/* ========== БЛОКИ ========== */
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
  font-size: 0.8rem;
  padding: 8px 10px;
  box-sizing: border-box;
  cursor: pointer;
  overflow: visible !important;
}

.block:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  z-index: 21;
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
  cursor: grab;
  user-select: none;
  padding: 4px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
}

.block-header:active {
  cursor: grabbing;
}

.block-header:hover {
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
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

.block-status {
  font-size: 0.65rem;
  color: #64748b;
  display: block;
  margin-top: 2px;
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

.block.editing {
  box-shadow: 0 0 0 2px #3b82f6;
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

/* ========== ЗАДАЧИ ========== */
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
  border-radius: 15px;
  border: 1px solid #3b82f6;
  background: white;
  color: #3b82f6;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  line-height: 1;
}

.add-task-btn:hover {
  background: #3b82f6;
  color: white;
}

.tasks-list {
  max-height: 450px;
  overflow-y: auto;
}

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

.task-item:active {
  cursor: grabbing;
}

.task-item.dragging {
  opacity: 0.5;
  transform: scale(0.98) rotate(1deg);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  cursor: grabbing;
  background: white;
  z-index: 1000;
  animation: float 0.3s ease;
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}

.task-item.drag-over {
  border: 2px dashed #3b82f6;
  background: #eff6ff;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  position: relative;
}

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

.task-item:last-child {
  border-bottom: none;
}

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

.task-done .task-title {
  text-decoration: line-through;
  color: #94a3b8;
}

.task-progress .task-title {
  color: #1e293b;
  font-weight: 500;
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
  cursor: text;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.task-title:hover {
  background: #e2e8f0;
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

.tasks-empty {
  min-height: 40px;
  border: 2px dashed #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px 0;
}

.tasks-empty[draggable="true"]:hover,
.tasks-empty[ondragover] {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: scale(1.02);
}

.empty-text {
  font-size: 0.7rem;
  color: #94a3b8;
  font-style: italic;
}

/* ========== ПРОГРЕСС ========== */
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

/* ========== ЛИНИИ ========== */
.lines-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 5;
}

.timeline-line {
  position: absolute;
  width: 2px;
  background: #3b82f6;
  opacity: 0.7;
  transition: opacity 0.2s, width 0.2s, background 0.2s;
  transform: translateX(-50%);
  cursor: grab;
  user-select: none;
  z-index: 15;
  pointer-events: auto;
  -webkit-user-drag: element;
  user-drag: element;
  will-change: left, width, background;
}

.timeline-line:active {
  cursor: grabbing;
}

.timeline-line[data-lastday="true"] {
  transform: translateX(-50%) translateX(-8px);
}

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
  transition: all 0.2s;
  pointer-events: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 30;
  cursor: grab;
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

.timeline-line[data-lastday="true"] .line-date {
  left: auto;
  right: 0;
  transform: translateX(0);
}

.timeline-line[data-lastday="true"]:hover .line-date {
  transform: translateX(0) translateY(-2px) !important;
}

.timeline-line:hover {
  opacity: 1;
  width: 4px;
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

/* ========== ПЕРЕТАСКИВАНИЕ ========== */
.timeline-line.line-dragging-active,
.timeline-line.line-dragging-active .line-date {
  transition: none !important;
}

.timeline-line.line-dragging-active {
  opacity: 1 !important;
  width: 4px !important;
  background: #2069d6 !important;
  box-shadow: 0 0 20px rgba(37, 21, 162, 0.8) !important;
  z-index: 1000 !important;
}

.timeline-line.line-dragging-active .line-dot {
  width: 12px !important;
  height: 12px !important;
  background: #2069d6 !important;
  box-shadow: 0 0 15px rgba(37, 21, 162, 0.8)!important;
}

.timeline-line.line-dragging-active .line-date,
.line-date-dragging {
  background: #2069d6 !important;
  transform: translateX(-50%) scale(1.2) !important;
  box-shadow: 0 4px 20px rgba(37, 21, 162, 0.8) !important;
  font-weight: bold !important;
  z-index: 1001 !important;
}

.timeline-line.line-dragging-active[data-lastday="true"] .line-date {
  transform: translateX(0) scale(1.2) !important;
}

.block-header-dragging {
  opacity: 0.8;
  background: rgba(59, 130, 246, 0.2) !important;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3) !important;
  transform: scale(1.02);
}

.block.block-dragging {
  opacity: 0.9;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3) !important;
  border: 2px solid #2069d6 !important;
  transform: scale(1.02);
  transition: none !important;
  z-index: 1001 !important;
  animation: blockPulse 1.5s infinite;
}

@keyframes blockPulse {
  0% { box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 12px 35px rgba(239, 68, 68, 0.5); }
  100% { box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3); }
}



.is-dragging * {
  transition: none !important;
}

[draggable="true"] {
  -webkit-user-drag: element;
  user-drag: element;
}

/* ========== ИНДИКАТОР ПОЗИЦИИ ========== */
.line-position-indicator {
  position: absolute;
  width: 2px;
  height: 100%;
  background: #3b82f6;
  opacity: 0.5;
  pointer-events: none;
  z-index: 50;
  animation: indicatorPulse 1s infinite;
}

@keyframes indicatorPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* ========== МОДАЛЬНОЕ ОКНО ========== */
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
  padding: 20px;
  width: 560px;
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
  margin-bottom: 16px;
}

.modal-header h3 {
  font-size: 1.4rem;
  font-weight: 500;
  color: #0f172a;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
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

.modal-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-section:last-of-type {
  border-bottom: none;
  margin-bottom: 12px;
  padding-bottom: 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
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
  min-height: 70px;
  line-height: 1.5;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.effort-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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
  margin-bottom: 6px;
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
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.footer-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ========== УВЕДОМЛЕНИЯ ========== */
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

/* ========== АДАПТИВНОСТЬ ========== */
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
  
  .footer-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
/* ========== ТЕПЛОВАЯ КАРТА - БЛОКИ С ЗАДАЧАМИ ========== */
.heatmap-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  background: #f8fafc;
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
  background: white;
  padding: 16px 20px;
  border: 0px solid #e2e8f0;
}

.heatmap-title-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.heatmap-legend {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #475569;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.heatmap-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.heatmap-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.heatmap-stat .stat-icon {
  font-size: 1.1rem;
}

.heatmap-stat .stat-label {
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
}

.heatmap-stat .stat-value {
  font-weight: 600;
  color: #0f172a;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.heatmap-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: white;
  border: 1px solid #e2e8f0;
}

/* СЕТКА для блоков */
.heatmap-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5x;
  justify-content: flex-start;
  align-items: flex-start;
}

.heatmap-block {
  border-radius: 0px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

.heatmap-block:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  z-index: 10;
}

.heatmap-block-header {
  margin-bottom: 12px;
}

.heatmap-block-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.heatmap-block-effort {
  font-size: 0.9rem;
  font-weight: 500;
  background: rgba(0,0,0,0.2);
  padding: 2px 8px;
  border-radius: 20px;
  display: inline-block;
}

/* Сетка задач */
.heatmap-tasks-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  max-height: 60%;
  overflow-y: auto;
  padding: 4px;
  background: rgba(0,0,0,0.1);
  border-radius: 8px;
}

.heatmap-task-square {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.heatmap-task-square:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.heatmap-no-tasks {
  width: 100%;
  text-align: center;
  padding: 8px;
  color: rgba(255,255,255,0.7);
  font-size: 0.8rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .heatmap-grid {
    justify-content: center;
  }
  
  .heatmap-block {
    width: 100% !important;
    height: auto !important;
    min-height: 200px;
  }
  
  .heatmap-task-square {
    width: 20px;
    height: 20px;
  }
}

</style>