//Imports
import Title from './assets/components/Title';
import DropDown from './assets/components/DropDown';
import Stack from 'react-bootstrap/Stack';
import AddButton from './assets/components/AddButton';
import InputModal from './assets/components/InputModal';
import Task from './assets/components/Task';
import './App.css';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
//Firebase stuff
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  setDoc,
  where,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Button } from 'react-bootstrap';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDk2WC6qiWzC65GZVAvHmIvq709E7zXAr0',
  authDomain: 'to-do-list-b32de.firebaseapp.com',
  projectId: 'to-do-list-b32de',
  storageBucket: 'to-do-list-b32de.appspot.com',
  messagingSenderId: '496719882286',
  appId: '1:496719882286:web:551f89646d2ccfe20ed7bf',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getFirestore(app);

function ToDoList() {
  //Selected item from filter dropbox
  const [selectedItem, setSelectedItem] = useState('All');

  //Custom type for a task
  type Task = {
    id: string;
    name: string;
    completed: boolean;
    userID: string;
  };

  const [tasks, setTasks] = useState<Task[]>([]);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (user != null) {
        console.log(user.uid);
        const queries = query(
          collection(database, 'Tasks'),
          where('userID', '==', user.uid)
        );
        const querySnapshot = await getDocs(queries);
        const newTasks: Task[] = [];

        querySnapshot.forEach((doc) => {
          const taskData = doc.data();
          console.log(taskData.name);
          const newTask: Task = {
            id: taskData.id,
            name: taskData.name,
            completed: taskData.completed,
            userID: taskData.userID,
          };

          newTasks.push(newTask);
        });
        setTasks(newTasks);
      }
    };

    fetchData();
  }, []);

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
  const handleSubmit = async (taskName: string) => {
    if (taskName.trim() !== '') {
      const newTask: Task = {
        id: uuidv4(),
        name: taskName,
        completed: false,
        userID: user!.uid,
      };

      setTasks([...tasks, newTask]);

      // Push the new task to the database under a 'tasks' node
      try {
        const docRef = addDoc(collection(database, 'Tasks'), {
          id: newTask.id,
          name: newTask.name,
          completed: newTask.completed,
          userID: newTask.userID,
        });
        console.log('Document written with ID: ', (await docRef).id);
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    }
    setShowModal(false);
  };

  // Handle submit button on modal when editing
  const handleEdit = async (input_task: Task) => {
    try {
      if (input_task.name.trim() !== '') {
        // Update the task in the Firestore database
        const q = query(
          collection(database, 'Tasks'),
          where('id', '==', input_task.id)
        );
        const querySnapshot = await getDocs(q);

        // If there is a matching document, update it
        querySnapshot.forEach(async (doc) => {
          await setDoc(doc.ref, input_task);
        });

        // Update the local state to reflect the edited task
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
    } catch (error) {
      console.error('Error editing document: ', error);
    }
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

  // Handle task deletion
  const handleDelete = async (taskId: string) => {
    try {
      // Query Firestore to find the document with id matching taskId
      const q = query(collection(database, 'Tasks'), where('id', '==', taskId));
      const querySnapshot = await getDocs(q);

      // If there is a matching document, delete it
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Update the local state to remove the deleted task
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
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

  const navigate = useNavigate();

  const handleManageAccount = () => {
    navigate('/account');
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
      <div className='top-left'>
        {user && user.photoURL && (
          <img className='dashboard-profile-picture' src={user.photoURL} />
        )}
        {/* Display current user's username */}
        {user && <span className='username'>Welcome, {user.displayName}</span>}
        {/* Button to lead to account editing page */}
        <Button
          className='edit-account-button'
          variant='primary'
          onClick={handleManageAccount}
        >
          Edit Account
        </Button>
      </div>
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

export default ToDoList;
