import './App.css';
import ToDoList from './ToDoList';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import ResetPage from './ResetPage';
import Account from './Account';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' Component={LoginPage} />
        <Route path='/signup' Component={SignUpPage} />
        <Route path='/reset' Component={ResetPage} />
        <Route path='/dashboard' Component={ToDoList} />
        <Route path='/account' Component={Account} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
