'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const Navbar = () => {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <header className={styles.navbar} role="banner">
      <nav className={styles.navbarContainer} role="navigation" aria-label="Main navigation">
        {/* Logo/Brand */}
        <div className={styles.navbarBrand}>
          <Link 
            href="/" 
            className={styles.brandLink} 
            aria-label="CodeBits - Go to homepage"
            prefetch={true}
          >
            <h1 className={styles.logoText}>CodeBits</h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className={styles.navbarMenu} role="menubar">
          <li role="none">
            <Link 
              href="/" 
              className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
              role="menuitem" 
              aria-label="Go to Home page"
              prefetch={true}
            >
              Home
            </Link>
          </li>
          <li role="none">
            <Link 
              href="/about" 
              className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
              role="menuitem" 
              aria-label="Learn more about us"
              prefetch={true}
            >
              About
            </Link>
          </li>
          <li role="none">
            <Link 
              href="/blogs" 
              className={`${styles.navLink} ${isActive('/blogs') ? styles.active : ''}`}
              role="menuitem" 
              aria-label="Read our blog posts"
              prefetch={true}
            >
              Blogs
            </Link>
          </li>
        </ul>

        {/* Auth Links + Theme Toggle */}
        <div className={styles.navbarAuth}>
          <Link 
            href="/login" 
            className={`${styles.navLink} ${isActive('/login') ? styles.active : ''}`}
            aria-label="Login to your account"
            prefetch={true}
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className={`${styles.navLink} ${styles.registerBtn} ${isActive('/register') ? styles.activeRegister : ''}`}
            aria-label="Create a new account"
            prefetch={true}
          >
            Register
          </Link>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;