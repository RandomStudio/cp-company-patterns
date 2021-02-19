import './App.css';
import Pattern from './Pattern';

function App() {
  return (
    <div className="App">
      <Pattern canvasSize={ { width: window.innerWidth, height: window.innerHeight }} />
    </div>
  );
}

export default App;
