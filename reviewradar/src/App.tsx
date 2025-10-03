import { useState } from 'react'
import loading from './assets/loading.gif'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './index.css'
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

        {/* Tailwind test */}
        <div className="text-left ml-0 pl-0">
          Choose a Category:
        </div>
      </div>
      <div className="flex justify-between">
  <button
    className="flex-1 mx-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-blue-600"
    onClick={() => console.log("Button 1 clicked")}
  >
    Cosmetics
  </button>
  <button
    className="flex-1 mx-2 px-4 py-2 bg-violet-500 text-white rounded hover:bg-purple-600"
    onClick={() => console.log("Button 2 clicked")}
  >
    Skincare
  </button>
  <button
    className="flex-1 mx-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
    onClick={() => console.log("Button 3 clicked")}
  >
    Clothes
  </button>
  <button
    className="flex-1 mx-2 px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600"
    onClick={() => console.log("Button 4 clicked")}
  >
    Tech
  </button>
</div>

      <p className="read-the-docs">
        Lots on our to-do list! Stay tuned.
      </p>
    </>
  )
}

export default App
