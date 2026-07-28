import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { AuthField, AuthSubmitButton } from '../components/AuthLayout';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const { data } = await api.post('/users/register', formData);
      // Registration returns a token too, so send the user straight in
      login({ user: data.user, token: data.token });
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your income and expenses"
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthField
          label="Name"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          placeholder="Enter your name"
          onChange={handleChange}
          autoComplete="name"
          required
        />
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
          placeholder="At least 6 characters"
          onChange={handleChange}
          autoComplete="new-password"
          minLength={6}
          required
        />
        <AuthSubmitButton loading={loading}>Create account</AuthSubmitButton>
      </form>
    </AuthLayout>
  );
};

export default Register;
