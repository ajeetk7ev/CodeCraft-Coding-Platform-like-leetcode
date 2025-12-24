import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Problems from "./pages/Problems"


function App() {
  return (
   <div>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/problems" element={<Problems/>}/>
   </Routes>
   </div>
  )
}

export default App