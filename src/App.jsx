import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, CheckCircle, X, Check } from 'lucide-react';
import axios from 'axios';

// =================================================================
// --- API Configuration ---
// =================================================================

// Ensure this URL is correct and matches your deployed backend project
const API_BASE_URL = 'https://registration-dashboard-backend.vercel.app/api/auth';


// =================================================================
// --- Validation Logic (Client-Side) ---
// =================================================================

const validateEmail = (email) => {
  if (!email) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address.';
  return null;
};

const validateUsername = (username) => {
  if (!username) return 'Username is required.';
  if (username.length < 3) return 'Username must be at least 3 characters long.';
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) return 'Username can only contain letters, numbers, and underscores.';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8 || password.length > 12) return 'Password must be between 8 and 12 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/\d/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character.';
  return null;
};

const getPasswordCriteria = (password) => ({
  length: password.length >= 8 && password.length <= 12,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
});


// =================================================================
// --- Components: InputField & PasswordCriteria ---
// =================================================================

const InputField = ({ id, name, type, placeholder, icon: Icon, value, onChange, error, onBlur }) => (
  <div className="relative mb-2">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Icon className={`h-5 w-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
    </div>
    <input
      type={type}
      id={id}
      name={name}
      className={`w-full pl-10 pr-4 py-2 bg-gray-900/50 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors duration-300 ${error
        ? 'border-red-500/50 text-red-400 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-700 focus:ring-violet-500 focus:border-violet-500'
        }`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required
    />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mt-1 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const PasswordCriteria = ({ password }) => {
  const criteria = useMemo(() => getPasswordCriteria(password), [password]);

  const items = [
    { label: '8-12 characters long', met: criteria.length },
    { label: 'One uppercase letter', met: criteria.uppercase },
    { label: 'One lowercase letter', met: criteria.lowercase },
    { label: 'One number (0-9)', met: criteria.number },
    { label: 'One special character', met: criteria.specialChar },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300 p-2 rounded bg-gray-800/50 mt-1">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.met ? (
            <Check className="h-4 w-4 text-green-400 mr-1" />
          ) : (
            <X className="h-4 w-4 text-red-400 mr-1" />
          )}
          <span className={item.met ? 'text-green-400' : 'text-gray-400'}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};


// =================================================================
// --- Components: LoginForm & RegisterForm ---
// =================================================================

function LoginForm({ setMessage, clearMessage }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, formData);
      localStorage.setItem('token', response.data.token);

      setMessage({ type: 'success', content: 'Login successful! Redirecting...' });

      setTimeout(() => {
        window.location.href = 'https://portfolio-shahid-frontend.vercel.app'; // Adjust destination URL as needed
      }, 1500);

    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || 'Login failed due to a network or server issue.' });
      clearMessage();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField id="email-login" name="email" type="email" placeholder="you@example.com" icon={Mail} value={formData.email} onChange={handleChange} />
      <InputField id="password-login" name="password" type="password" placeholder="••••••••" icon={Lock} value={formData.password} onChange={handleChange} />

      <div className="flex items-center justify-between text-sm pt-2">
        <div className="flex items-center">
          <input id="remember" name="remember" type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-violet-600 focus:ring-violet-500" />
          <label htmlFor="remember" className="ml-2 text-gray-400">Remember me</label>
        </div>
        <a href="#" className="font-medium text-violet-400 hover:text-violet-300">Forgot password?</a>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }} 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-violet-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500 transition-colors duration-300 !mt-6 disabled:bg-violet-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </motion.button>
    </form>
  );
}

function RegisterForm({ setMessage, clearMessage }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = useCallback((name, value) => {
    let error = null;
    if (name === 'username') error = validateUsername(value);
    if (name === 'email') error = validateEmail(value);
    if (name === 'password') error = validatePassword(value);
    return error;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    const validationErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(error => error !== null);

    if (hasErrors) {
      setMessage({ type: 'error', content: 'Please fix the errors before submitting.' });
      clearMessage();
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, formData);
      
      setMessage({ type: 'success', content: response.data.message });
      setFormData({ username: '', email: '', password: '' });
      setErrors({}); 
      clearMessage();

    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Registration failed due to a network or server issue.' 
      });
      clearMessage();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField id="username-register" name="username" type="text" placeholder="Choose a username" icon={User} value={formData.username} onChange={handleChange} onBlur={handleBlur} error={errors.username} />
      <InputField id="email-register" name="email" type="email" placeholder="you@example.com" icon={Mail} value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} />
      
      <div>
        <InputField id="password-register" name="password" type="password" placeholder="Create a password" icon={Lock} value={formData.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} />
        <AnimatePresence>
          {(formData.password || errors.password) && <PasswordCriteria password={formData.password} />}
        </AnimatePresence>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }} 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-violet-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500 transition-colors duration-300 !mt-6 disabled:bg-violet-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </motion.button>
    </form>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [message, setMessage] = useState({ type: '', content: '' });

  const clearMessage = useCallback(() => {
    setTimeout(() => setMessage((prev) => 
      prev.content === message.content ? { type: '', content: '' } : prev
    ), 5000);
  }, [message.content]);

  return (
    <div className="bg-gray-900 font-sans text-white min-h-screen flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554147090-e1221a04a025?q=80&w=2070&auto=format&fit=crop')" }}>
      <div className="w-full max-w-md">
        <div className="bg-black/40 backdrop-blur-xl border border-violet-500/30 rounded-xl p-8 shadow-2xl">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-sm font-medium text-center transition-colors duration-300 relative ${activeTab === 'login' ? 'text-violet-400' : 'text-gray-400 hover:text-white'
                }`}
            >
              Login
              {activeTab === 'login' && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400" layoutId="underline" />}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-sm font-medium text-center transition-colors duration-300 relative ${activeTab === 'register' ? 'text-violet-400' : 'text-gray-400 hover:text-white'
                }`}
            >
              Register
              {activeTab === 'register' && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400" layoutId="underline" />}
            </button>
          </div>

          {/* Message Display Area */}
          <AnimatePresence>
            {message.content && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`flex items-center p-3 mb-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                  }`}
              >
                {message.type === 'error' ? <AlertCircle className="mr-2 h-5 w-5" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                {message.content}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'login' ? <LoginForm setMessage={setMessage} clearMessage={clearMessage} /> : <RegisterForm setMessage={setMessage} clearMessage={clearMessage} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; 2024 Your Company. All rights reserved.
        </p>
      </div>
    </div>
  );
}