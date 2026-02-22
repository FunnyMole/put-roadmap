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
            :class="{ active: viewMode === 'months' }" 
            @click="setViewMode('months')"
          >
            📅 По месяцам
          </button>
          <button 
            class="btn" 
            :class="{ active: viewMode === 'quarters' }" 
            @click="setViewMode('quarters')"
          >
            📊 По кварталам
          </button>
        </div>

        <div class="toolbar-group">
          <button class="btn btn-primary" @click="createNewBlock">+ Новый этап</button>
          <button class="btn" @click="loadBlocks">🔄</button>
        </div>
      </div>

      <!-- Статистика сверху -->
      <div class="statistics-top">
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-label">Задач:</span>
          <span class="stat-value">{{ blocks.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⚡</span>
          <span class="stat-label">Всего:</span>
          <span class="stat-value">{{ totalEffort }} ч</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📈</span>
          <span class="stat-label">Сред:</span>
          <span class="stat-value">{{ averageEffort }} ч</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🎯</span>
          <span class="stat-label">Макс:</span>
          <span class="stat-value">{{ maxEffort }} ч</span>
        </div>
      </div>

      <!-- Навигация по месяцам -->
      <div class="nav-months">
        <button class="nav-month" 
          v-for="(month, i) in months" 
          :key="i"
          :class="{ active: isMonthVisible(i) }"
          @click="scrollToMonth(i)"
        >
          {{ month.label.substring(0, 3) }}
          <span class="month-count" v-if="getBlocksCountInMonth(i) > 0">
            {{ getBlocksCountInMonth(i) }}
          </span>
        </button>
        <div class="nav-controls">
          <button class="nav-btn" @click="scrollLeft">←</button>
          <button class="nav-btn" @click="scrollRight">→</button>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <div class="main-content">
      <!-- Шапка месяцев (синхронизирована с прокруткой) -->
      <div class="months-header" ref="monthsHeader">
        <div class="months-header-container" :style="{ width: totalWidth + 'px' }">
          <div 
            v-for="(period, index) in visiblePeriods" 
            :key="index"
            class="month-header-cell"
            :style="{ 
              width: periodWidth + 'px',
              left: index * periodWidth + 'px'
            }"
          >
            {{ period.label }}
            <span class="month-sub" v-if="period.sub">{{ period.sub }}</span>
          </div>
        </div>
      </div>

      <!-- Контейнер с прокруткой для блоков -->
      <div 
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
            @dragover.prevent
            @drop="onDrop"
            @mousemove="onMouseMove"
            :style="{ height: totalHeight + 'px' }"
          >
            <!-- Разделители месяцев (вертикальные линии) -->
            <div 
              v-for="(period, index) in visiblePeriods" 
              :key="'divider-' + index"
              class="month-divider"
              :style="{ left: (index + 1) * periodWidth + 'px' }"
              v-if="index < visiblePeriods.length - 1"
            ></div>

            <!-- Горизонтальные линии рядов 
            <div 
              v-for="row in maxRows" 
              :key="'row-' + row"
              class="row-line"
              :style="{ top: (row * (BASE_ROW_HEIGHT + 10)) + 'px' }"
            ></div>-->

            <!-- Блоки -->
            <div
              v-for="block in sortedBlocks"
              :key="block.id"
              class="block"
              :style="{ 
                backgroundColor: getBlockBackgroundColor(block),
                left: getBlockLeft(block) + 'px',
                top: getBlockTop(block) + 'px',
                width: getBlockWidth(block) + 'px',
                minHeight: getBlockMinHeight(block) + 'px'
              }"
              draggable="true"
              @dragstart="onDragStart($event, block)"
              @dragend="onDragEnd"
              @dblclick="editBlock(block)"
            >
              <!-- Верхний акцентный градиент -->
              <div class="block-accent" :style="{ background: getBlockAccentColor(block) }"></div>
              
              <!-- Заголовок с приоритетом -->
              <div class="block-header">
                <div class="block-title-container">
                  <span class="block-priority" :class="getPriorityClass(block.effort)">
                    {{ getPriorityIcon(block.effort) }}
                  </span>
                  <div class="block-title-wrapper">
                    <h3 class="block-title">{{ block.title }}</h3>
                  </div>
                </div>
                <div class="block-badge" :style="{ background: getEffortColor(block.effort, 0.2) }">
                  <span class="badge-icon">⚡</span>
                  <span class="badge-value">{{ block.effort || 0 }}</span>
                </div>
              </div>

              <!-- Описание с иконкой -->
              <div class="block-description" v-if="block.description">
                <span class="description-icon">📋</span>
                <span class="description-text">{{ block.description }}</span>
              </div>
              <div v-else class="block-description placeholder">
                <span class="description-icon">✏️</span>
                <span class="description-text">Добавьте описание...</span>
              </div>

              <!-- Мета-информация -->
              <div class="block-meta">
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span class="meta-text">{{ formatDate(block.startDate) }} - {{ formatDate(block.endDate) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">⏱️</span>
                  <span class="meta-text">{{ getBlockDuration(block) }} дн.</span>
                </div>
              </div>

              <!-- Прогресс-бар трудозатрат -->
              <div class="effort-progress">
                <div 
                  class="effort-progress-bar" 
                  :style="{ 
                    width: getEffortPercent(block.effort) + '%',
                    background: getEffortColor(block.effort)
                  }"
                ></div>
              </div>
            </div>

            <!-- Призрак перетаскивания -->
            <div 
              v-if="draggingBlock"
              class="block ghost"
              :style="{ 
                backgroundColor: getBlockBackgroundColor(draggingBlock),
                left: ghostLeft + 'px',
                top: ghostTop + 'px',
                width: ghostWidth + 'px'
              }"
            >
              <div class="block-accent" :style="{ background: getBlockAccentColor(draggingBlock) }"></div>
              <div class="block-header">
                <div class="block-title-container">
                  <span class="block-priority">{{ getPriorityIcon(draggingBlock.effort) }}</span>
                  <h3 class="block-title">{{ draggingBlock.title }}</h3>
                </div>
                <div class="block-badge">⚡ {{ draggingBlock.effort || 0 }}</div>
              </div>
              <div class="block-description">
                <span class="description-icon">📋</span>
                <span class="description-text">{{ draggingBlock.description || 'Перетаскивание...' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>✏️ Редактировать этап</h3>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        
        <div class="form-group">
          <label>Название</label>
          <input v-model="editingBlock.title" type="text" placeholder="Введите название этапа">
        </div>
        
        <div class="form-group">
          <label>Описание</label>
          <textarea 
            v-model="editingBlock.description" 
            rows="4" 
            placeholder="Подробно опишите задачи, цели и ожидаемые результаты"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Дата начала</label>
            <input v-model="editingBlock.startDate" type="date">
          </div>
          <div class="form-group">
            <label>Дата окончания</label>
            <input v-model="editingBlock.endDate" type="date">
          </div>
        </div>

        <!-- Тепловая индикация для трудозатрат -->
        <div class="form-group">
          <label>⚡ Трудозатраты (часы)</label>
          <div class="effort-input">
            <input 
              v-model.number="editingBlock.effort" 
              type="range" 
              min="0" 
              max="200" 
              step="1"
              class="effort-range"
            >
            <input 
              v-model.number="editingBlock.effort" 
              type="number" 
              min="0" 
              max="1000" 
              step="1"
              class="effort-number"
            >
          </div>
          
          <!-- Визуальная шкала тепловой карты -->
          <div class="thermal-preview">
            <div class="thermal-bar">
              <div class="thermal-segment low" :class="{ active: editingBlock.effort < 30 }">
                <span class="segment-label">Низкие</span>
                <span class="segment-value">0-30</span>
              </div>
              <div class="thermal-segment medium" :class="{ active: editingBlock.effort >= 30 && editingBlock.effort < 70 }">
                <span class="segment-label">Средние</span>
                <span class="segment-value">31-70</span>
              </div>
              <div class="thermal-segment high" :class="{ active: editingBlock.effort >= 70 && editingBlock.effort < 100 }">
                <span class="segment-label">Высокие</span>
                <span class="segment-value">71-100</span>
              </div>
              <div class="thermal-segment critical" :class="{ active: editingBlock.effort >= 100 }">
                <span class="segment-label">Критичные</span>
                <span class="segment-value">100+</span>
              </div>
            </div>
            
            <!-- Предпросмотр цвета блока -->
            <div class="color-preview" :style="{ background: getEffortColor(editingBlock.effort, 0.2) }">
              <span class="preview-value">{{ editingBlock.effort || 0 }} ч.</span>
            </div>
          </div>
          
          <!-- Легенда тепловой карты -->
          <div class="thermal-legend">
            <div class="legend-item">
              <span class="color-dot" style="background: #22c55e;"></span>
              <span>Низкие (0-30)</span>
            </div>
            <div class="legend-item">
              <span class="color-dot" style="background: #eab308;"></span>
              <span>Средние (31-70)</span>
            </div>
            <div class="legend-item">
              <span class="color-dot" style="background: #f97316;"></span>
              <span>Высокие (71-100)</span>
            </div>
            <div class="legend-item">
              <span class="color-dot" style="background: #ef4444;"></span>
              <span>Критичные (100+)</span>
            </div>
          </div>
        </div>
        
        <!-- Футер с кнопками по разным сторонам -->
        <div class="modal-footer">
          <div class="footer-left">
            <button class="btn btn-danger" @click="deleteBlock">
              <span class="btn-icon">🗑️</span>
              <span class="btn-text">Удалить</span>
            </button>
          </div>
          <div class="footer-right">
            <button class="btn btn-text" @click="closeModal">Отмена</button>
            <button class="btn btn-primary" @click="saveBlock">
              <span class="btn-icon">💾</span>
              <span class="btn-text">Сохранить</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'
const blocks = ref([])
const timelineGrid = ref(null)
const timelineWrapper = ref(null)
const monthsHeader = ref(null)

// Константы
const MONTH_WIDTH = 320
const QUARTER_WIDTH = 580
const BASE_ROW_HEIGHT = 160
const SCROLL_STEP = 240

const viewMode = ref(localStorage.getItem('roadmap-view-mode') || 'months')

// Все месяцы
const months = [
  { label: 'Январь 2026', monthIndex: 0 },
  { label: 'Февраль 2026', monthIndex: 1 },
  { label: 'Март 2026', monthIndex: 2 },
  { label: 'Апрель 2026', monthIndex: 3 },
  { label: 'Май 2026', monthIndex: 4 },
  { label: 'Июнь 2026', monthIndex: 5 },
  { label: 'Июль 2026', monthIndex: 6 },
  { label: 'Август 2026', monthIndex: 7 },
  { label: 'Сентябрь 2026', monthIndex: 8 },
  { label: 'Октябрь 2026', monthIndex: 9 },
  { label: 'Ноябрь 2026', monthIndex: 10 },
  { label: 'Декабрь 2026', monthIndex: 11 }
]

// Кварталы
const quarters = [
  { label: 'Q1 2026', sub: 'янв-мар', startMonth: 0, endMonth: 2 },
  { label: 'Q2 2026', sub: 'апр-июн', startMonth: 3, endMonth: 5 },
  { label: 'Q3 2026', sub: 'июл-сен', startMonth: 6, endMonth: 8 },
  { label: 'Q4 2026', sub: 'окт-дек', startMonth: 9, endMonth: 11 }
]

const visiblePeriods = computed(() => {
  return viewMode.value === 'months' ? months : quarters
})

const periodWidth = computed(() => {
  return viewMode.value === 'months' ? MONTH_WIDTH : QUARTER_WIDTH
})

const totalWidth = computed(() => {
  return visiblePeriods.value.length * periodWidth.value + 50
})

const maxRows = computed(() => {
  let max = 0
  blocks.value.forEach(b => {
    if (b.row > max) max = b.row
  })
  return Math.max(max + 1, 8)
})

const totalHeight = computed(() => {
  return maxRows.value * (BASE_ROW_HEIGHT + 10) + 50
})

const sortedBlocks = computed(() => {
  return [...blocks.value].sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    if (dateA < dateB) return -1
    if (dateA > dateB) return 1
    return (b.effort || 0) - (a.effort || 0)
  })
})

// Статистика
const totalEffort = computed(() => {
  return blocks.value.reduce((sum, block) => sum + (block.effort || 0), 0)
})

const averageEffort = computed(() => {
  if (blocks.value.length === 0) return 0
  return Math.round(totalEffort.value / blocks.value.length)
})

const maxEffort = computed(() => {
  return Math.max(...blocks.value.map(b => b.effort || 0), 0)
})

// Цитаты
const quotes = [
  "🚀 Планируй и достигай",
  "⚡ Каждый день важен",
  "🎯 Фокус на главном",
  "💡 Маленькие шаги = большие результаты"
]
const currentQuote = ref(quotes[0])
const quoteElement = ref(null)

// Состояние
const draggingBlock = ref(null)
const ghostLeft = ref(0)
const ghostTop = ref(0)
const ghostWidth = ref(0)
const showModal = ref(false)
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('success')
const editingBlock = ref({
  id: '', title: '', description: '', startDate: '', endDate: '', effort: 0
})

// ==========================================
// ТЕПЛОВАЯ ШКАЛА И ДИЗАЙН
// ==========================================

const getBlockBackgroundColor = (block) => {
  return getEffortColor(block.effort, 0.1)
}

const getBlockAccentColor = (block) => {
  return getEffortColor(block.effort, 1)
}

const getEffortColor = (effort, opacity = 1) => {
  const e = effort || 0
  if (e < 30) return `rgba(34, 197, 94, ${opacity})`
  if (e < 70) return `rgba(234, 179, 8, ${opacity})`
  if (e < 100) return `rgba(249, 115, 22, ${opacity})`
  return `rgba(239, 68, 68, ${opacity})`
}

const getPriorityClass = (effort) => {
  const e = effort || 0
  if (e < 30) return 'priority-low'
  if (e < 70) return 'priority-medium'
  if (e < 100) return 'priority-high'
  return 'priority-critical'
}

const getPriorityIcon = (effort) => {
  const e = effort || 0
  if (e < 30) return '●'
  if (e < 70) return '◆'
  if (e < 100) return '▲'
  return '❗'
}

const getEffortPercent = (effort) => {
  const e = effort || 0
  return Math.min(100, (e / 200) * 100)
}

// Минимальная высота блока
const getBlockMinHeight = (block) => {
  let height = 120
  
  if (block.title && block.title.length > 30) {
    height += 20
  } else if (block.title && block.title.length > 20) {
    height += 10
  }
  
  if (block.description) {
    const descLines = Math.ceil(block.description.length / 40)
    height += descLines * 20
  } else {
    height += 20
  }
  
  return Math.min(height, 250)
}

// ==========================================
// ПОЗИЦИОНИРОВАНИЕ
// ==========================================

const dateToDayOfYear = (dateStr) => {
  const date = new Date(dateStr)
  return date.getMonth() * 30 + date.getDate()
}

const dayOfYearToDate = (dayOfYear) => {
  const month = Math.floor((dayOfYear - 1) / 30)
  const day = ((dayOfYear - 1) % 30) + 1
  return new Date(2026, month, day)
}

const getPeriodIndexByDay = (dayOfYear) => {
  if (viewMode.value === 'months') {
    return Math.floor((dayOfYear - 1) / 30)
  } else {
    return Math.floor((dayOfYear - 1) / 90)
  }
}

const getBlockLeft = (block) => {
  const startDay = dateToDayOfYear(block.startDate)
  const periodIndex = getPeriodIndexByDay(startDay)
  const periodStartDay = periodIndex * (viewMode.value === 'months' ? 30 : 90) + 1
  const dayOffset = startDay - periodStartDay
  return periodIndex * periodWidth.value + (dayOffset * (periodWidth.value / (viewMode.value === 'months' ? 30 : 90))) + 5
}

const getBlockWidth = (block) => {
  const startDay = dateToDayOfYear(block.startDate)
  const endDay = dateToDayOfYear(block.endDate)
  const duration = endDay - startDay + 1
  const calculatedWidth = duration * (periodWidth.value / (viewMode.value === 'months' ? 30 : 90))
  return Math.max(calculatedWidth - 10, 150)
}

const getBlockTop = (block) => {
  return (block.row || 0) * (BASE_ROW_HEIGHT + 10) + 10
}

const getBlocksCountInMonth = (monthIndex) => {
  return blocks.value.filter(b => new Date(b.startDate).getMonth() === monthIndex).length
}

// ==========================================
// НАВИГАЦИЯ И СИНХРОНИЗАЦИЯ ПРОКРУТКИ
// ==========================================

// Синхронизация горизонтальной прокрутки
const syncScroll = () => {
  if (timelineWrapper.value && monthsHeader.value) {
    monthsHeader.value.scrollLeft = timelineWrapper.value.scrollLeft
  }
}

const isMonthVisible = (monthIndex) => {
  if (!timelineWrapper.value) return false
  const wrapper = timelineWrapper.value
  const scrollLeft = wrapper.scrollLeft
  const wrapperWidth = wrapper.clientWidth
  const monthLeft = monthIndex * MONTH_WIDTH
  return monthLeft >= scrollLeft - 50 && monthLeft <= scrollLeft + wrapperWidth + 50
}

const scrollToMonth = (monthIndex) => {
  if (!timelineWrapper.value) return
  timelineWrapper.value.scrollTo({
    left: monthIndex * MONTH_WIDTH - 50,
    behavior: 'smooth'
  })
  // Синхронизация произойдет через syncScroll
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
    timelineWrapper.value.scrollBy({ top: event.deltaY > 0 ? 100 : -100, behavior: 'smooth' })
  }
}

// ==========================================
// ФУНКЦИЯ ПОИСКА СВОБОДНОГО РЯДА
// ==========================================
const findFreeRowForBlock = (block, excludeId = null) => {
  const startDay = dateToDayOfYear(block.startDate)
  const endDay = dateToDayOfYear(block.endDate)
  
  // Проверяем ряды с 0 до 20
  for (let row = 0; row < 20; row++) {
    let isFree = true
    
    for (const b of blocks.value) {
      if (excludeId && b.id === excludeId) continue
      
      // Проверяем блоки в том же ряду
      if (b.row === row) {
        const bStart = dateToDayOfYear(b.startDate)
        const bEnd = dateToDayOfYear(b.endDate)
        
        // Если даты пересекаются, ряд занят
        if (startDay <= bEnd && endDay >= bStart) {
          isFree = false
          break
        }
      }
    }
    
    if (isFree) return row
  }
  
  return 0
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
      row: block.row || 0
    }))
  } catch (error) {
    console.error('Ошибка загрузки:', error)
  }
}

const createNewBlock = async () => {
  try {
    const today = new Date()
    const startDay = dateToDayOfYear(today.toISOString().split('T')[0])
    const endDay = startDay + 7
    
    const startDate = dayOfYearToDate(startDay).toISOString().split('T')[0]
    const endDate = dayOfYearToDate(endDay).toISOString().split('T')[0]
    
    const newBlock = {
      title: `Новый этап`,
      description: '',
      startDate: startDate,
      endDate: endDate,
      effort: 0,
      row: 0
    }
    
    // Находим свободный ряд
    newBlock.row = findFreeRowForBlock(newBlock)
    
    const response = await axios.post(`${API_URL}/blocks`, newBlock)
    blocks.value.push(response.data)
    showNotificationMessage('✅ Этап создан')
  } catch (error) {
    console.error('Ошибка создания:', error)
  }
}

// ==========================================
// DRAG & DROP
// ==========================================

const onDragStart = (event, block) => {
  draggingBlock.value = { ...block }
  
  ghostLeft.value = getBlockLeft(block)
  ghostTop.value = getBlockTop(block)
  ghostWidth.value = getBlockWidth(block)
  
  event.dataTransfer.setData('text/plain', block.id)
  event.dataTransfer.effectAllowed = 'move'
  
  event.target.classList.add('dragging')
}

const onDragEnd = (event) => {
  event.target.classList.remove('dragging')
  draggingBlock.value = null
}

let rafId = null
const targetRow = ref(null)
const onMouseMove = (event) => {
  if (!draggingBlock.value) return

  if (rafId) cancelAnimationFrame(rafId)

  rafId = requestAnimationFrame(() => {
    const rect = timelineGrid.value.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    const maxLeft = visiblePeriods.value.length * periodWidth.value - ghostWidth.value
    ghostLeft.value = Math.max(0, Math.min(mouseX - ghostWidth.value / 2, maxLeft))

    const rowHeightWithGap = BASE_ROW_HEIGHT + 10
    const maxTop = (maxRows.value - 1) * rowHeightWithGap + 70
    ghostTop.value = Math.max(70, Math.min(mouseY - 40, maxTop))
  })
}

// Очистка
onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})

const onDrop = async (event) => {
  event.preventDefault()
  
  if (!draggingBlock.value) return
  
  const blockId = event.dataTransfer.getData('text/plain')
  const block = blocks.value.find(b => b.id === blockId)
  
  if (!block) return
  
  const rect = timelineGrid.value.getBoundingClientRect()
  const dropX = event.clientX - rect.left
  const dropY = event.clientY - rect.top
  
  const totalDays = visiblePeriods.value.length * (viewMode.value === 'months' ? 30 : 90)
  const dayOfYear = Math.floor((dropX / (periodWidth.value * visiblePeriods.value.length)) * totalDays) + 1
  const clampedDay = Math.max(1, Math.min(dayOfYear, totalDays))
  
  const row = Math.floor((dropY - 10) / (BASE_ROW_HEIGHT + 10))
  const clampedRow = Math.max(0, Math.min(row, maxRows.value - 1))
  
  const newStartDate = dayOfYearToDate(clampedDay)
  
  // Сохраняем длительность
  const oldStartDay = dateToDayOfYear(block.startDate)
  const oldEndDay = dateToDayOfYear(block.endDate)
  const duration = oldEndDay - oldStartDay
  
  const newEndDate = new Date(newStartDate)
  newEndDate.setDate(newStartDate.getDate() + duration)
  
  const startStr = newStartDate.toISOString().split('T')[0]
  const endStr = newEndDate.toISOString().split('T')[0]
  
  // Создаем временный блок для проверки
  const tempBlock = {
    ...block,
    startDate: startStr,
    endDate: endStr,
    row: clampedRow
  }
  
  // Проверяем, свободен ли ряд
  const isRowFree = !blocks.value.some(b => {
    if (b.id === block.id) return false
    if (b.row !== clampedRow) return false
    
    const bStart = dateToDayOfYear(b.startDate)
    const bEnd = dateToDayOfYear(b.endDate)
    const tStart = dateToDayOfYear(tempBlock.startDate)
    const tEnd = dateToDayOfYear(tempBlock.endDate)
    
    return tStart <= bEnd && tEnd >= bStart
  })
  
  // Если ряд занят, ищем свободный
  const finalRow = isRowFree ? clampedRow : findFreeRowForBlock(tempBlock, block.id)
  
  const index = blocks.value.findIndex(b => b.id === block.id)
  if (index !== -1) {
    blocks.value[index] = {
      ...block,
      startDate: startStr,
      endDate: endStr,
      row: finalRow
    }
    
    try {
      await axios.put(`${API_URL}/blocks/${block.id}`, {
        ...blocks.value[index],
        row: finalRow
      })
      showNotificationMessage('✅ Блок перемещен')
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }
  
  draggingBlock.value = null
}

// ==========================================
// РЕЖИМ ОТОБРАЖЕНИЯ
// ==========================================

const setViewMode = (mode) => {
  viewMode.value = mode
  localStorage.setItem('roadmap-view-mode', mode)
}

// ==========================================
// ФОРМАТИРОВАНИЕ
// ==========================================

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '')
}

const getBlockDuration = (block) => {
  const start = dateToDayOfYear(block.startDate)
  const end = dateToDayOfYear(block.endDate)
  return end - start + 1
}

// ==========================================
// УВЕДОМЛЕНИЯ
// ==========================================

const showNotificationMessage = (message, type = 'success') => {
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  setTimeout(() => { showNotification.value = false }, 2000)
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
  if (!confirm('Удалить?')) return
  try {
    await axios.delete(`${API_URL}/blocks/${editingBlock.value.id}`)
    blocks.value = blocks.value.filter(b => b.id !== editingBlock.value.id)
    closeModal()
    showNotificationMessage('✅ Удалено')
  } catch (error) {
    console.error('Ошибка удаления:', error)
  }
}

onMounted(() => {
  axios.post(`${API_URL}/init`).then(() => loadBlocks())
  setInterval(() => {
    currentQuote.value = quotes[Math.floor(Math.random() * quotes.length)]
  }, 10000)
})
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
}

.toolbar-group {
  display: flex;
  gap: 6px;
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

/* Статистика */
.statistics-top {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: white;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
  margin-bottom: 10px;
  font-size: 0.85rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 0.9rem;
}

.stat-label {
  color: #64748b;
}

.stat-value {
  font-weight: 600;
  color: #0f172a;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 30px;
  min-width: 40px;
  text-align: center;
}

/* Навигация по месяцам */
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
}

/* Шапка месяцев (синхронизирована с прокруткой) */
.months-header {
  flex-shrink: 0;
  height: 50px;
  background: white;
  border-bottom: 2px solid #3b82f6;
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
  color: #1e293b;
  border-right: 1px solid #f1f5f9;
  background: white;
}

.month-sub {
  font-size: 0.7rem;
  font-weight: 400;
  color: #94a3b8;
}

/* Контейнер с прокруткой для блоков */
.timeline-wrapper {
  flex: 1;
  overflow: auto;
  padding: 16px 12px 16px 16px;
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
}

/* СЕТКА */
.timeline-grid {
  position: relative;
  background-image: linear-gradient(to bottom, #f8fafc 1px, transparent 1px);
  background-size: 100% 170px;
}

.month-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(203, 213, 225, 0.5);
  pointer-events: none;
  z-index: 1;
}

.row-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(203, 213, 225, 0.2);
  pointer-events: none;
  z-index: 1;
}

/* БЛОКИ */
.block {
  position: absolute;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: move;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  transition: all 0.15s;
  z-index: 10;
  min-width: 150px;
  overflow: hidden;
  font-size: 0.8rem;
  padding: 10px 10px 6px 10px;
  box-sizing: border-box;
}

.block:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 8px 16px rgba(0,0,0,0.05);
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
  font-size: 0.95rem;
  color: #0f172a;
  word-break: break-word;
  line-height: 1.3;
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
  margin-bottom: 8px;
  line-height: 1.3;
  min-height: 2.2em;
}
.description-text {
 flex: 1;
  font-size: 14px;        /* Можно увеличить, например до 16px */
  font-weight: 500;       /* Полужирный (от 400 — обычный, до 700 — жирный) */
  white-space: pre-line;  /* Сохраняет переносы строк из текста */
  line-height: 1.4;       /* Улучшает читаемость */
}
.description-icon {
  width: 14px;
  text-align: center;
}

.block-description.placeholder {
  color: #94a3b8;
  font-style: italic;
}

.block-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.7rem;
  color: #64748b;
  border-top: 1px dashed #e2e8f0;
  padding-top: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.meta-icon {
  font-size: 0.7rem;
  opacity: 0.7;
}

.effort-progress {
  height: 3px;
  background: #f1f5f9;
  overflow: hidden;
  margin-top: 6px;
  border-radius: 0 0 12px 12px;
}

.effort-progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

/* Призрак */
.block.ghost {
  opacity: 0.5;
  border: 2px dashed #3b82f6;
  background: #eff6ff;
  z-index: 1000;
}

/* ===== ТЕПЛОВАЯ ИНДИКАЦИЯ В МОДАЛЬНОМ ОКНЕ ===== */
.effort-input {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.effort-range {
  flex: 3;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444);
  -webkit-appearance: none;
}

.effort-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.effort-number {
  flex: 1;
  min-width: 80px;
}

.thermal-preview {
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
}

.thermal-bar {
  display: flex;
  height: 60px;
  width: 100%;
}

.thermal-segment {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  opacity: 0.5;
}

.thermal-segment.low {
  background: #22c55e;
}

.thermal-segment.medium {
  background: #eab308;
}

.thermal-segment.high {
  background: #f97316;
}

.thermal-segment.critical {
  background: #ef4444;
}

.thermal-segment.active {
  opacity: 1;
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 2;
}

.segment-label {
  font-weight: 600;
  margin-bottom: 2px;
}

.segment-value {
  font-size: 0.65rem;
  opacity: 0.9;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
}

.preview-icon {
  font-size: 1rem;
}

.preview-text {
  flex: 1;
  color: #1e293b;
}

.preview-value {
  font-weight: 600;
  padding: 2px 8px;
  background: rgba(255,255,255,0.5);
  border-radius: 30px;
}

.thermal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #475569;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 6px;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 24px;
  padding: 20px;
  width: 500px;
  max-width: 90%;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #0f172a;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  color: #94a3b8;
}

.btn-close:hover {
  background: #f1f5f9;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: #475569;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

/* Футер с кнопками по разным сторонам */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px solid #f1f5f9;
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

.btn-danger {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

.btn-danger:hover {
  background: #fecaca;
  color: #dc2626;
}

.btn-text {
  background: transparent;
  border-color: transparent;
}

.btn-text:hover {
  background: #f1f5f9;
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
</style>