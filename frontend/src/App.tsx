import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Navbar from "./components/common/Navbar"
import Signup from "./pages/Signup"


function App() {
  return (
   <div>
    <Navbar/>
    <Routes>
     <Route path="/" element={<Home/>} />
      <Route path="/signup" element={<Signup/>} />
   </Routes>
   </div>
  )
}

export default App