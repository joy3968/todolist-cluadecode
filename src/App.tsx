import { useState, useEffect } from 'react'
import './App.css'

interface Todo {
  id: number
  text: string
  completed: boolean
  date: string
}

const STORAGE_KEY = 'todos'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [showCalendar, setShowCalendar] = useState(false)
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY)
    return savedTodos ? JSON.parse(savedTodos) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const handleAddTodo = () => {
    if (inputValue.trim() === '') return

    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      date: selectedDate
    }

    setTodos([...todos, newTodo])
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
  }

  const handleToggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const handleDeleteTodo = (id: number) => {
    const todoElement = document.querySelector(`[data-todo-id="${id}"]`)
    if (todoElement) {
      todoElement.classList.add('deleting')
      setTimeout(() => {
        setTodos(todos.filter(todo => todo.id !== id))
      }, 300)
    } else {
      setTodos(todos.filter(todo => todo.id !== id))
    }
  }

  const groupedTodos = todos.reduce((groups, todo) => {
    const date = todo.date || new Date().toISOString().split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(todo)
    return groups
  }, {} as Record<string, Todo[]>)

  const sortedDates = Object.keys(groupedTodos).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const dateOnly = dateString
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (dateOnly === todayStr) return '오늘'
    if (dateOnly === yesterdayStr) return '어제'

    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const date = new Date(selectedDate)
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const today = new Date().toISOString().split('T')[0]

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSelected = dateStr === selectedDate
      const isToday = dateStr === today

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => {
            setSelectedDate(dateStr)
            setShowCalendar(false)
          }}
        >
          {day}
        </div>
      )
    }

    return days
  }

  const changeMonth = (offset: number) => {
    const date = new Date(selectedDate)
    date.setMonth(date.getMonth() + offset)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  return (
    <div className="app">
      <header className="header">
        <h1>✨ DailyFlow</h1>
      </header>

      <div className="input-section">
        <div className="date-selector">
          <button
            className="date-button"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            📅 {formatDisplayDate(selectedDate)}
          </button>
          {showCalendar && (
            <div className="calendar-popup">
              <div className="calendar-header">
                <button onClick={() => changeMonth(-1)}>‹</button>
                <span>{new Date(selectedDate).getFullYear()}년 {new Date(selectedDate).getMonth() + 1}월</span>
                <button onClick={() => changeMonth(1)}>›</button>
              </div>
              <div className="calendar-weekdays">
                <div>일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div>토</div>
              </div>
              <div className="calendar-days">
                {renderCalendar()}
              </div>
            </div>
          )}
        </div>

        <div className="input-container">
          <input
            type="text"
            className="todo-input"
            placeholder="할 일을 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="add-button" onClick={handleAddTodo}>
            <span>+</span> 추가
          </button>
        </div>
      </div>

      <div className="list-container">
        {sortedDates.length === 0 ? (
          <div className="empty-state">
            <p>할 일을 추가해보세요! ✨</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="date-group">
              <h3 className="date-header">{formatDate(date)}</h3>
              <div className="todos-wrapper">
                {groupedTodos[date].map((todo) => (
                  <div
                    key={todo.id}
                    className={`todo-item ${todo.completed ? 'completed' : ''}`}
                    data-todo-id={todo.id}
                  >
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        className="todo-checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <span className="todo-text">{todo.text}</span>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App
