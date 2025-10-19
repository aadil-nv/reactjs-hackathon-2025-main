import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../redux/features/authSlice';
import { login as loginAPI } from '../services/rocketchat';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginAPI(formData.username, formData.password);
      if (result.success) {
        console.log("result===",result.authToken);
        console.log("result",result.userId);
        console.log("result",result.user);
        
        
        dispatch(
          loginAction({
            authToken: result.authToken,
            userId: result.userId,
            user: result.user,
          })
        );
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
      <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] p-10 w-full max-w-md text-center">
        <h1 className="text-[#333] text-2xl font-semibold mb-2">Rocket.Chat Login</h1>
        <p className="text-[#666] text-sm mb-8">Connect to your local Rocket.Chat server</p>

        <form onSubmit={handleSubmit} className="text-left">
          <div className="mb-5">
            <label htmlFor="username" className="block mb-1.5 text-[#333] font-medium text-sm">
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your username or email"
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
              placeholder="Enter your password"
              className="w-full p-3 border-2 border-[#e1e5e9] rounded-lg text-base focus:outline-none focus:border-[#667eea] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-5 border border-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white py-3 rounded-lg font-semibold text-base transition-transform duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-[#e1e5e9]">
          <p className="text-[#666] text-xs m-0">
            Make sure your Rocket.Chat server is running on localhost:3000
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
