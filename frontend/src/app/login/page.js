'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loginType, setLoginType] = useState('username'); // 'username' or 'email'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Check environment variable on component mount
  useEffect(() => {
    console.log('Environment check:');
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Full API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/login`);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    // Clear the other field when switching
    if (type === 'username') {
      setFormData(prev => ({ ...prev, email: '' }));
    } else {
      setFormData(prev => ({ ...prev, username: '' }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    const loginField = loginType === 'username' ? formData.username : formData.email;
    if (!loginField || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        password: formData.password,
        ...(loginType === 'username' ? { username: formData.username } : { email: formData.email })
      };

      console.log('Login request body:', {
        ...requestBody,
        password: '[HIDDEN]'
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response content-type:', response.headers.get('content-type'));

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('Full Response data:', JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
          setError('Invalid response format from server');
          return;
        }
      } else {
        // If not JSON, get the response as text to see what we're actually getting
        const textResponse = await response.text();
        console.log('Non-JSON response received:', textResponse);
        
        if (!response.ok) {
          // Handle specific error status codes
          if (response.status === 404) {
            setError('User does not exist');
          } else if (response.status === 401) {
            setError('Invalid credentials');
          } else if (response.status === 400) {
            setError('Invalid input data. Please check your credentials.');
          } else if (response.status === 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(`Login failed (Status: ${response.status})`);
          }
        } else {
          setError('Unexpected response format from server');
        }
        return;
      }

      if (!response.ok) {
        // Enhanced error message extraction
        let errorMessage = 'Login failed';
        
        if (data && data.message) {
          errorMessage = data.message;
        } else if (data && data.error) {
          errorMessage = data.error;
        } else if (data && data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors[0];
        } else if (typeof data === string) {
            errorMessage = data;
            
          
        } else {
          // Handle specific status codes when no proper error message is available
          if (response.status === 404) {
            errorMessage = 'User does not exist';
          } else if (response.status === 401) {
            errorMessage = 'Invalid username/email or password';
          } else if (response.status === 400) {
            errorMessage = 'Please provide valid credentials';
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        console.log('Extracted error message:', errorMessage);
        setError(errorMessage);
        return;
      }

      // Login successful - store user data if needed
      if (data && data.data) {
        // You can store user data in localStorage, context, or state management
        if (typeof window !== 'undefined') {
          // Store user data (optional)
          const userData = {
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken
          };
          
          if (rememberMe) {
            localStorage.setItem('userData', JSON.stringify(userData));
          } else {
            sessionStorage.setItem('userData', JSON.stringify(userData));
          }
        }
      }

      // Redirect to dashboard or home page
      router.push('/dashboard'); // Change this to your desired redirect page
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle network errors or parsing errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Something went wrong during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Welcome Back</h1>
          <p className={styles.loginSubtitle}>Sign in to your CodeBits account to continue sharing and discovering amazing code</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {/* Login Type Selector */}
          <div className={styles.loginTypeSelector}>
            <button
              type="button"
              className={`${styles.loginTypeButton} ${loginType === 'username' ? styles.active : ''}`}
              onClick={() => handleLoginTypeChange('username')}
            >
              Username
            </button>
            <button
              type="button"
              className={`${styles.loginTypeButton} ${loginType === 'email' ? styles.active : ''}`}
              onClick={() => handleLoginTypeChange('email')}
            >
              Email
            </button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={loginType} className={styles.label}>
              {loginType === 'username' ? 'Username' : 'Email Address'}
            </label>
            {loginType === 'username' ? (
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your username"
                required
              />
            ) : (
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your email"
                required
              />
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxLabel}>Remember me</span>
            </label>
            
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In →'}
          </button>
        </form>

        <div className={styles.registerLink}>
          <p>
            Don't have an account?{' '}
            <Link href="/register" className={styles.link}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;