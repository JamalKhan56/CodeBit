// app/blogs/page.js
"use client";

import { useState, useEffect } from 'react';
import { blogAPI } from '../../lib/api';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using our clean API function instead of hardcoded URL
      const data = await blogAPI.getAll();

      // Extract blogs from API response
      const blogsData = data.data?.docs || data.data || [];
      
      console.log('✅ Extracted blogs:', blogsData.length, 'blogs found');

      setBlogs(blogsData);

    } catch (err) {
      console.error('❌ Error fetching blogs:', err.message);
      setError(err.message);
    } finally {
      console.log('🏁 API call finished, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Component mounted, calling fetchBlogs...');
    fetchBlogs();
  }, []);

  // Function to format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to truncate long text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        📚 All Blogs
      </h1>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading blogs from backend...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
          <p className="font-bold text-lg mb-2">❌ Error loading blogs</p>
          <p className="text-sm mb-4">{error}</p>
          <button 
            onClick={fetchBlogs}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Success State - Blog Cards */}
      {!loading && !error && (
        <div>
          {blogs.length > 0 ? (
            <div>
              {/* Stats Section */}
              <div className="text-center mb-8">
                <p className="text-lg text-green-600 font-medium">
                  ✅ Found {blogs.length} published blogs
                </p>
              </div>

              {/* Blog Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <div 
                    key={blog._id} 
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
                  >
                    {/* Featured Image */}
                    {blog.featuredImage ? (
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        <img 
                          src={blog.featuredImage} 
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-4xl">📝</span>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6">
                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                        {blog.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {truncateText(blog.excerpt || blog.content, 120)}
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          {blog.author?.avatar ? (
                            <img 
                              src={blog.author.avatar} 
                              alt={blog.author.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 text-sm">👤</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {blog.author?.fullName || blog.author?.username || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </p>
                        </div>
                      </div>
 
                      {/* Categories */}
                      {blog.categories && blog.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {blog.categories.slice(0, 3).map((category, index) => (
                            <span 
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                          {blog.categories.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{blog.categories.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex gap-4">
                          <span>👁️ {blog.viewCount || 0}</span>
                          <span>❤️ {blog.likeCount || blog.likes?.length || 0}</span>
                          <span>💬 {blog.commentCount || blog.comments?.length || 0}</span>
                        </div>
                        <span>⏱️ {blog.readingTime || 1} min read</span>
                      </div>

                      {/* Read More Button */}
                      <button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        📖 Read More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl text-gray-600 mb-2">No blogs found</p>
              <p className="text-gray-500">Be the first to create a blog post!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}