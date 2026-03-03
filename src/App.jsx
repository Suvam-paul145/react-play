import './App.css';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <main className="app-body" id="main-content" tabIndex="-1">
      <Outlet />
    </main>
  );
}

export default App;
