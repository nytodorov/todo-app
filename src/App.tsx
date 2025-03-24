import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import './App.css'

interface Task {
  id: number;
  text: string;
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
      id: 'done',
      title: 'Done',
      tasks: []
    }
  ])
  const [newTask, setNewTask] = useState('')

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.trim()) {
      const newTaskObj = { id: Date.now(), text: newTask.trim(), completed: false }
      setColumns(columns.map(column => 
        column.id === 'todo' 
          ? { ...column, tasks: [...column.tasks, newTaskObj] }
          : column
      ))
      setNewTask('')
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
      <h1>Todo App</h1>
      
      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="input"
        />
        <button type="submit" className="btn">Add Task</button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {columns.map(column => (
            <div key={column.id} className="column">
              <h2 className="column-title">{column.title}</h2>
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
                            <span className={task.completed ? 'completed' : ''}>
                              {task.text}
                            </span>
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
