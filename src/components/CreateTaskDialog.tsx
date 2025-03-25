import { useState } from 'react';
import DatePicker from 'react-datepicker';
import RichTextEditor from './RichTextEditor';
import "react-datepicker/dist/react-datepicker.css";

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    assignee: string;
    dueDate: Date | null;
  }) => void;
}

const CreateTaskDialog = ({ isOpen, onClose, onSubmit }: CreateTaskDialogProps) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: null as Date | null
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      onSubmit(newTask);
      setNewTask({ title: '', description: '', assignee: '', dueDate: null });
      onClose();
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title..."
              className="input"
              autoFocus
            />
            <RichTextEditor
              content={newTask.description}
              onChange={(content) => setNewTask({ ...newTask, description: content })}
            />
            <div className="form-row">
              <input
                type="text"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                placeholder="Assignee..."
                className="input"
              />
              <DatePicker
                selected={newTask.dueDate}
                onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
                placeholderText="Due date..."
                className="input date-picker"
                dateFormat="MMM d, yyyy"
                minDate={new Date()}
              />
            </div>
          </div>
          <div className="dialog-buttons">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskDialog; 