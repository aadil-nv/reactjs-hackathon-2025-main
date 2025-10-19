import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../redux/features/authSlice';
import { signup as signupAPI } from '../services/rocketchat';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    try {
      const result = await signupAPI(
        formData.name,
        formData.email,
        formData.username,
        formData.password
      );
      
      if (result.success) {
        setSuccess(true);
        
        if (result.authToken) {
          dispatch(
            loginAction({
              authToken: result.authToken,
              userId: result.userId,
              user: result.user,
            })
          );
        }
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
      <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-10 w-full max-w-md text-center">
        <h1 className="text-[#333] text-2xl font-semibold mb-2">Create Account</h1>
        <p className="text-[#666] text-sm mb-8">Join your Rocket.Chat server</p>

        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-5 border border-green-200">
            <p className="font-semibold mb-1">Account created successfully!</p>
            <p className="text-sm">You can now sign in with your credentials.</p>
          </div>
        ) : (
          <div className="text-left">
            <div className="mb-5">
              <label htmlFor="name" className="block mb-1.5 text-[#333] font-medium text-sm">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter your full name"
                className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base focus:outline-none focus:border-[#667eea] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="email" className="block mb-1.5 text-[#333] font-medium text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter your email address"
                className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base focus:outline-none focus:border-[#667eea] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="username" className="block mb-1.5 text-[#333] font-medium text-sm">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Choose a username"
                className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base focus:outline-none focus:border-[#667eea] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block mb-1.5 text-[#333] font-medium text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Create a password (min. 6 characters)"
                className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base focus:outline-none focus:border-[#667eea] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block mb-1.5 text-[#333] font-medium text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Re-enter your password"
                className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base focus:outline-none focus:border-[#667eea] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-5 border border-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white py-3 rounded-lg font-semibold text-base transition-transform duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-[#e1e5e9]">
          <p className="text-[#666] text-xs m-0">
            Already have an account?{' '}
            <a href="/login" className="text-[#667eea] hover:underline font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;