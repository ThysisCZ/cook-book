import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sections from './bricks/sections';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Personal Recipe Manager
      </header>
      <header className="Dashboard-header">
        Dashboard
      </header>
      <div className="Section-container">
        <Sections />
      </div>
    </div>
  );
}

export default App;
