'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
      
      if (!userData) {
        router.push('/login');
        return;
      }

      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData.user);
        
        // Simulate loading user stats and Blogs
        setTimeout(() => {
          setStats({
            totalBlogs: 12,
            totalViews: 2847,
            totalLikes: 156,
            followers: 23
          });
          
          setRecentBlogs([
            {
              id: 1,
              title: 'Building a REST API with Express.js',
              excerpt: 'A comprehensive guide to creating scalable APIs...',
              views: 234,
              likes: 12,
              createdAt: '2024-08-10',
              status: 'published'
            },
            {
              id: 2,
              title: 'React Hooks Best Practices',
              excerpt: 'Learn how to use hooks effectively in your React applications...',
              views: 189,
              likes: 8,
              createdAt: '2024-08-08',
              status: 'published'
            },
            {
              id: 3,
              title: 'Database Design Patterns',
              excerpt: 'Common patterns for designing efficient databases...',
              views: 0,
              likes: 0,
              createdAt: '2024-08-12',
              status: 'draft'
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error parsing user data:', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    
    // Redirect to home or login
    router.push('/');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={() => router.push('/login')} className={styles.errorButton}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>Welcome back, {user?.fullName || user?.username}!</h1>
            <p className={styles.welcomeSubtitle}>Here's what's happening with your CodeBits account</p>
          </div>
          
          <div className={styles.headerActions}>
            <Link href="/dashboard/blogs/create" className={styles.createBlogButton}>
              + New Blog
            </Link>
            <div className={styles.userMenu}>
              <div className={styles.userAvatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className={styles.avatarImage} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {(user?.fullName || user?.username)?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.dashboardMain}>
        {/* Stats Cards */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.totalBlogs}</h3>
                <p className={styles.statLabel}>Total Blogs</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👀</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.totalViews.toLocaleString()}</h3>
                <p className={styles.statLabel}>Total Views</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>❤️</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.totalLikes}</h3>
                <p className={styles.statLabel}>Total Likes</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{stats.followers}</h3>
                <p className={styles.statLabel}>Followers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActionsSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.quickActionsGrid}>
            <Link href="/dashboard/blogs/create" className={styles.actionCard}>
              <div className={styles.actionIcon}>✍️</div>
              <div className={styles.actionContent}>
                <h3>Create New Blog</h3>
                <p>Share your coding insights with the community</p>
              </div>
            </Link>
            
            <Link href="/dashboard/profile/edit" className={styles.actionCard}>
              <div className={styles.actionIcon}>⚙️</div>
              <div className={styles.actionContent}>
                <h3>Edit Profile</h3>
                <p>Update your profile information and settings</p>
              </div>
            </Link>
            
            <Link href="/dashboard/analytics" className={styles.actionCard}>
              <div className={styles.actionIcon}>📊</div>
              <div className={styles.actionContent}>
                <h3>View Analytics</h3>
                <p>Track your blog performance and engagement</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Blogs */}
        <section className={styles.recentBlogsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Blogs</h2>
            <Link href="/dashboard/blogs" className={styles.viewAllLink}>
              View All →
            </Link>
          </div>
          
          <div className={styles.blogsGrid}>
            {recentBlogs.map(blog => (
              <div key={blog.id} className={styles.blogCard}>
                <div className={styles.blogHeader}>
                  <h3 className={styles.blogTitle}>{blog.title}</h3>
                  <span className={`${styles.blogStatus} ${styles[blog.status]}`}>
                    {blog.status}
                  </span>
                </div>
                
                <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                
                <div className={styles.blogStats}>
                  <span className={styles.blogStat}>
                    👀 {blog.views} views
                  </span>
                  <span className={styles.blogStat}>
                    ❤️ {blog.likes} likes
                  </span>
                  <span className={styles.blogDate}>
                    {formatDate(blog.createdAt)}
                  </span>
                </div>
                
                <div className={styles.blogActions}>
                  <Link href={`/dashboard/blogs/${blog.id}`} className={styles.viewButton}>
                    View
                  </Link>
                  <Link href={`/dashboard/blogs/${blog.id}/edit`} className={styles.editButton}>
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;