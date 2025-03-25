import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import DatePicker from 'react-datepicker'
import RichTextEditor from './components/RichTextEditor'
import CreateTaskDialog from './components/CreateTaskDialog'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import "react-datepicker/dist/react-datepicker.css"
import './App.css'

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  dueDate: Date | null;
  completed: boolean;
  isEditing?: boolean;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

function AppContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      tasks: []
    }
  ])

  const addTask = (newTask: Omit<Task, 'id' | 'completed' | 'isEditing'>) => {
    const newTaskObj = { 
      id: Date.now(), 
      ...newTask,
      completed: false,
      isEditing: false
    }
    setColumns(columns.map(column => 
      column.id === 'todo' 
        ? { ...column, tasks: [...column.tasks, newTaskObj] }
        : column
    ))
  }

  const startEditing = (taskId: number) => {
    setColumns(columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => 
        task.id === taskId ? { ...task, isEditing: true } : task
      )
    })))
  }

  const saveEdit = (taskId: number, editedTask: Omit<Task, 'id' | 'completed' | 'isEditing'>) => {
    setColumns(columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...editedTask, isEditing: false }
          : task
      )
    })))
  }

  const cancelEdit = (taskId: number) => {
    setColumns(columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => 
        task.id === taskId ? { ...task, isEditing: false } : task
      )
    })))
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)
    
    if (!sourceColumn || !destColumn) return

    const sourceTasks = [...sourceColumn.tasks]
    const destTasks = source.droppableId === destination.droppableId 
      ? sourceTasks 
      : [...destColumn.tasks]
    
    const [removed] = sourceTasks.splice(source.index, 1)
    destTasks.splice(destination.index, 0, {
      ...removed,
      completed: destination.droppableId === 'done'
    })

    setColumns(columns.map(column => {
      if (column.id === source.droppableId) {
        return { ...column, tasks: sourceTasks }
      }
      if (column.id === destination.droppableId) {
        return { ...column, tasks: destTasks }
      }
      return column
    }))
  }

  return (
    <div className="container">
      <div className="header">
        <h1>✨ Todo App</h1>
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <CreateTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={addTask}
      />
      
      <button
        className="add-task-button standalone"
        onClick={() => setIsDialogOpen(true)}
      >
        + Add New Task
      </button>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {columns.map(column => (
            <div key={column.id} className="column">
              <h2 className="column-title">
                {column.id === 'todo' ? '📝 To Do' : 
                 column.id === 'in-progress' ? '⚡ In Progress' : 
                 '✅ Done'}
              </h2>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`task-list ${snapshot.isDraggingOver ? 'droppable' : ''}`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-item ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            {task.isEditing ? (
                              <div className="task-edit-form">
                                <input
                                  type="text"
                                  defaultValue={task.title}
                                  className="input"
                                  placeholder="Task title..."
                                />
                                <RichTextEditor
                                  content={task.description}
                                  onChange={(content) => {
                                    const title = (document.querySelector(`#task-${task.id} .input:nth-child(1)`) as HTMLInputElement).value;
                                    const assignee = (document.querySelector(`#task-${task.id} .input:nth-child(3)`) as HTMLInputElement).value;
                                    saveEdit(task.id, { 
                                      title, 
                                      description: content, 
                                      assignee,
                                      dueDate: task.dueDate 
                                    });
                                  }}
                                />
                                <div className="form-row">
                                  <input
                                    type="text"
                                    defaultValue={task.assignee}
                                    className="input"
                                    placeholder="Assignee..."
                                  />
                                  <DatePicker
                                    selected={task.dueDate}
                                    onChange={(date) => {
                                      const title = (document.querySelector(`#task-${task.id} .input:nth-child(1)`) as HTMLInputElement).value;
                                      const assignee = (document.querySelector(`#task-${task.id} .input:nth-child(3)`) as HTMLInputElement).value;
                                      saveEdit(task.id, { 
                                        title, 
                                        description: task.description, 
                                        assignee,
                                        dueDate: date 
                                      });
                                    }}
                                    placeholderText="Due date..."
                                    className="input date-picker"
                                    dateFormat="MMM d, yyyy"
                                    minDate={new Date()}
                                  />
                                </div>
                                <div className="edit-buttons">
                                  <button 
                                    className="btn btn-save"
                                    onClick={() => {
                                      const title = (document.querySelector(`#task-${task.id} .input:nth-child(1)`) as HTMLInputElement).value;
                                      const assignee = (document.querySelector(`#task-${task.id} .input:nth-child(3)`) as HTMLInputElement).value;
                                      saveEdit(task.id, { 
                                        title, 
                                        description: task.description, 
                                        assignee,
                                        dueDate: task.dueDate 
                                      });
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button 
                                    className="btn btn-cancel"
                                    onClick={() => cancelEdit(task.id)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="task-content" id={`task-${task.id}`}>
                                <div className="task-header">
                                  <h3 className={task.completed ? 'completed' : ''}>{task.title}</h3>
                                  <button 
                                    className="btn-edit"
                                    onClick={() => startEditing(task.id)}
                                  >
                                    ✏️
                                  </button>
                                </div>
                                <div className="task-description" dangerouslySetInnerHTML={{ __html: task.description }} />
                                <div className="task-footer">
                                  {task.assignee && (
                                    <div className="task-assignee">
                                      👤 {task.assignee}
                                    </div>
                                  )}
                                  {task.dueDate && (
                                    <div className="task-due-date">
                                      📅 {formatDate(task.dueDate)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
