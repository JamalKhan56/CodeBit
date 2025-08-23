'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check environment variable on component mount
  useEffect(() => {
    console.log('Environment check:');
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Full API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/register`);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'avatar') {
        setAvatar(file);
      } else {
        setCoverImage(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
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

    if (!avatar) {
      setError('Avatar is required');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('avatar', avatar);
      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Form data:', {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        avatar: !!avatar,
        coverImage: !!coverImage
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/register`, {
        method: 'POST',
        body: formDataToSend,
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
          if (response.status === 409) {
            setError('User with email or username already exists');
          } else if (response.status === 400) {
            setError('Invalid input data. Please check all fields.');
          } else if (response.status === 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(`Registration failed (Status: ${response.status})`);
          }
        } else {
          setError('Unexpected response format from server');
        }
        return;
      }

      if (!response.ok) {
        // Enhanced error message extraction - try multiple possible locations
        let errorMessage = 'Registration failed';
        
        if (data && data.message) {
          errorMessage = data.message;
        } else if (data && data.error) {
          errorMessage = data.error;
        } else if (data && data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors[0];
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else {
          // Handle specific status codes when no proper error message is available
          if (response.status === 409) {
            errorMessage = 'User with email or username already exists';
          } else if (response.status === 400) {
            errorMessage = 'Invalid input data. Please check all fields.';
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }
        
        console.log('Extracted error message:', errorMessage);
        setError(errorMessage);
        return;
      }

      // Registration successful
      router.push('/login');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle network errors or parsing errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Something went wrong during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <h1 className={styles.registerTitle}>Welcome to CodeBits</h1>
          <p className={styles.registerSubtitle}>Create your account to start sharing your coding insights with the community</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter username"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div className={styles.formGroupFull}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
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
          </div>

          <div className={styles.formRow}>
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

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className={styles.formGroupFull}>
            <label htmlFor="avatar" className={styles.label}>
              Avatar
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'avatar')}
              className={styles.fileInput}
              required
            />
            {avatar && (
              <p className={styles.fileName}>Selected: {avatar.name}</p>
            )}
          </div>

          <div className={styles.formGroupFull}>
            <label htmlFor="coverImage" className={styles.label}>
              Cover Image <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'coverImage')}
              className={styles.fileInput}
            />
            {coverImage && (
              <p className={styles.fileName}>Selected: {coverImage.name}</p>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign up →'}
          </button>
        </form>

        <div className={styles.loginLink}>
          <p>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;