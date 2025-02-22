import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import './App.css'
import {Routes, Route, Navigate} from 'react-router-dom'
import {HomePage,Transactions, Login, Register,Analytics} from './pages'




function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Toaster position='top-center' reverseOrder={false}/>
    <Routes>
      <Route path='/' element={
        <ProtectedRoutes><HomePage/></ProtectedRoutes>
        }/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/transactions' element={<Transactions/>}/>
      <Route path="/analytics" element={<Analytics />} />

    </Routes>
    </div>
  )
}
export function ProtectedRoutes(props){
  if(localStorage.getItem('user')){
    return props.children;
  }
  else{
    return <Navigate to="/login"/>
  }
}
export default App
