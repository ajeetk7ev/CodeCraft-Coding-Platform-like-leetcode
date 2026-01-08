import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Problems from "./pages/Problems"
import ProblemView from "./pages/ProblemView"
import Profile from "./pages/Profile"
import Admin from "./pages/Admin"
import NotFound from "./pages/NotFound"


function App() {
  return (
   <div>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/problems" element={<Problems/>}/>
      <Route path="/problems/:slug" element={<ProblemView/>}/>
      <Route path="/profile/:username" element={<Profile/>}/>
      <Route path="/admin" element={<Admin/>}/>
      <Route path="*" element={<NotFound />} />
   </Routes>
   </div>
  )
}

export default App