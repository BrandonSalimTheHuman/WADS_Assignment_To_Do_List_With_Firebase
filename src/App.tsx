//Imports
import Title from './assets/components/Title';
import DropDown from './assets/components/DropDown';
import Stack from 'react-bootstrap/Stack';
import AddButton from './assets/components/AddButton';
import InputModal from './assets/components/InputModal';
import Task from './assets/components/Task';
import './App.css';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  //Selected item from filter dropbox
  const [selectedItem, setSelectedItem] = useState('All');

  //Custom type for a task
  type Task = {
    id: string;
    name: string;
    completed: boolean;
  };

  //Array of all tasks
  const [tasks, setTasks] = useState<Task[]>([]);

  //Whether the modal for inputting and editing is visible
  const [showModal, setShowModal] = useState(false);

  //Whether or not the modal is used for inputting or editing
  const [editing, setEditing] = useState(false);

  //Task being edited
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  //Handle selection for dropdown
  const handleSelect = (eventKey: any) => {
    setSelectedItem(eventKey);
  };

  //Handle click on adding a task
  const handleClick = () => {
    setEditing(false);
    setShowModal(true);
  };

  //Handle submit button on modal when adding
  const handleSubmit = (taskName: string) => {
    if (taskName.trim() !== '') {
      const newTask: Task = {
        id: uuidv4(),
        name: taskName,
        completed: false,
      };

      setTasks([...tasks, newTask]);
    }
    setShowModal(false);
  };

  //Handle submit button on modal when editing
  const handleEdit = (input_task: Task) => {
    if (input_task.name.trim() !== '') {
      setTasks(
        tasks.map((task) => {
          if (task.id === input_task.id) {
            return {
              ...task,
              name: input_task.name,
            };
          }
          return task;
        })
      );
    }
    setShowModal(false);
  };

  //Handle close button on modal
  const handleClose = () => {
    setShowModal(false);
  };

  //Handle complete/incomplete toggle using checkbox
  const handleComplete = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            completed: !task.completed,
          };
        }
        return task;
      })
    );
  };

  //Handle task deletion
  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  ///Handle button for editing a task
  const handleEditPress = (taskId: string) => {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      setTaskToEdit(task);
      setEditing(true);
      setShowModal(true);
    }
  };

  //Handle move up button for tasks
  const handleMoveUp = (taskId: string) => {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index > 0) {
      const newTasks = [...tasks];
      const temp = newTasks[index];
      newTasks[index] = newTasks[index - 1];
      newTasks[index - 1] = temp;
      setTasks(newTasks);
    }
  };

  //Handle move down button for tasks
  const handleMoveDown = (taskId: string) => {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index < tasks.length - 1) {
      const newTasks = [...tasks];
      const temp = newTasks[index];
      newTasks[index] = newTasks[index + 1];
      newTasks[index + 1] = temp;
      setTasks(newTasks);
    }
  };

  //Array of tasks to show, after filtering
  const filteredTasks = tasks.filter((task) => {
    if (selectedItem === 'All') {
      return true;
    } else if (selectedItem === 'Completed') {
      return task.completed;
    } else if (selectedItem === 'Incompleted') {
      return !task.completed;
    }
  });

  return (
    <div className='app-container'>
      {/* 'To-do-list' title */}
      <Title />

      {/* Stack for add task button and filter dropdown */}
      <div className='stack-container'>
        <Stack direction='horizontal' gap={3}>
          <div className='p-2'>
            <AddButton onClick={handleClick}></AddButton>
          </div>
          <div className='p-2 ms-auto'>
            <DropDown
              onSelect={handleSelect}
              selectedItem={selectedItem}
            ></DropDown>
          </div>
        </Stack>
      </div>

      {/* Modal for input and edit */}
      {showModal && (
        <InputModal
          onSubmit={handleSubmit}
          onHide={handleClose}
          onEdit={handleEdit}
          editing={editing}
          task={taskToEdit}
        />
      )}

      {/* Task components, mapped from the array of tasks after filter */}
      <div>
        {filteredTasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEditPress={handleEditPress}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
