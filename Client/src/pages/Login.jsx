import {toast} from 'react-hot-toast'
import axios from 'axios';
import React,{useState,useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Spinner from '../components/Layout/Spinner';
const Login = () => {
    const [formData,setFormData]=useState({
        email:"",
        password:"",
})
  const [loading,setLoading]=useState(false);
  const navigate = useNavigate()

    const handleChange =(e)=>{
        const {name, value}=e.target;
        setFormData({
            ...formData,
            [name]:value,
        })
    }
  
    const handleSubmit =async (e)=>{
       e.preventDefault();
       try {
        setLoading(true);
        const { data } = await axios.post('/api/users/login', {
          email:formData.email,
        password:formData.password
      },{
        headers:{
          'Content-Type': 'application/json',
        }
      });
      toast.success('login success');
        setLoading(false)
      
        localStorage.setItem('user',JSON.stringify({...data.user,password:''}))
        navigate('/');
      } catch (error) {
        setLoading(false)
       toast.error('login failed! Something went wrong')
       }
        console.log('FormValues:', formData);
    }
    useEffect(()=>{
      if(localStorage.getItem("user")){
        navigate("/");
      }
    },[])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {loading && <Spinner/>}
      <div className="bg-gray-900 border border-gray-700 shadow-lg rounded-2xl p-8 w-96">
        <h2 className="text-white text-2xl font-semibold text-center mb-6">
          Login
        </h2>
        <form  onSubmit={handleSubmit}>
          
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your password"
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
           
            type="submit"
            className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white py-3 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all"
          >
            Login
          </button>
        </form>

        {/* Already Registered Section */}
        <div className="mt-4 text-center">
          <p className="text-gray-300 text-sm">
            New User? Login{" "}
            <Link to="/register" className="text-blue-500 hover:text-blue-400">
              Click here to Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
