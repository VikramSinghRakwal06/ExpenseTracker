import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { AuthField, AuthSubmitButton } from '../components/AuthLayout';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post('/users/login', formData);
      login({ user: data.user, token: data.token });
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue tracking your expenses"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthField
          label="Email Address"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          placeholder="you@example.com"
          onChange={handleChange}
          autoComplete="email"
          required
        />
        <AuthField
          label="Password"
          type="password"
          id="password"
          name="password"
          value={formData.password}
          placeholder="Enter your password"
          onChange={handleChange}
          autoComplete="current-password"
          required
        />
        <AuthSubmitButton loading={loading}>Sign in</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
};

export default Login;
