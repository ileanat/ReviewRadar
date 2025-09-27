import { useState } from 'react'
import loading from './assets/loading.gif'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://cdn.dribbble.com/users/546766/screenshots/4790425/progress-circle.gif" target="_blank">
          <img src={loading} alt="Loading..." />
        </a>
      </div>
      <h1>RadarReview</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Lots on our to-do list! Stay tuned.
      </p>
    </>
  )
}

export default App
