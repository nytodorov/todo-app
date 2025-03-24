import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import './App.css'

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  completed: boolean;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

function App() {
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
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: ''
  })

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.title.trim()) {
      const newTaskObj = { 
        id: Date.now(), 
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        assignee: newTask.assignee.trim(),
        completed: false 
      }
      setColumns(columns.map(column => 
        column.id === 'todo' 
          ? { ...column, tasks: [...column.tasks, newTaskObj] }
          : column
      ))
      setNewTask({ title: '', description: '', assignee: '' })
    }
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
      <h1>✨ Todo App</h1>
      
      <form onSubmit={addTask} className="task-form">
        <div className="form-group">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task title..."
            className="input"
          />
          <input
            type="text"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Description..."
            className="input"
          />
          <input
            type="text"
            value={newTask.assignee}
            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
            placeholder="Assignee..."
            className="input"
          />
        </div>
        <button type="submit" className="btn">Add Task</button>
      </form>

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
                            <div className="task-content">
                              <h3 className={task.completed ? 'completed' : ''}>{task.title}</h3>
                              {task.description && (
                                <p className="task-description">{task.description}</p>
                              )}
                              {task.assignee && (
                                <div className="task-assignee">
                                  👤 {task.assignee}
                                </div>
                              )}
                            </div>
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

export default App
