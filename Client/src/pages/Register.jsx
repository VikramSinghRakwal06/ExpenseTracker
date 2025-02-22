import React, { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import axios from 'axios'
import {toast} from 'react-hot-toast'
import Spinner from "../components/Layout/Spinner";
const Register = () => {
    const [loading,setLoading]=useState(false);
    const navigate = useNavigate();
    const [formData,setFormData]=useState({
        name:"",
        email:"",
        password:"",
})
    const handleChange =(e)=>{
        const {name, value}=e.target;
        setFormData({
            ...formData,
            [name]:value,
        })
    }
    const handleSubmit =async (values)=>{
       values.preventDefault();
       try {
        setLoading(true)
        
        await axios.post('/api/users/register',formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        toast.success('Registration Successfull');
        setLoading(false)
        navigate('/login');
       } catch (error) {
        setLoading(false)
        toast.error('invalid username or password')
       }
       
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
          Register
        </h2>
        <form  onSubmit={handleSubmit}>
            {/* Name Input */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2" htmlFor="email">
                Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Enter your name"
              onChange={handleChange}
              required
            />
          </div>
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
            Register
          </button>
        </form>

        {/* Already Registered Section */}
        <div className="mt-4 text-center">
          <p className="text-gray-300 text-sm">
            Already registered?{" "}
            <Link to="/login" className="text-blue-500 hover:text-blue-400">
              Click here to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
