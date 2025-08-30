import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// Create a new blog
const createBlog = asyncHandler(async (req, res) => {
    const { title, content, excerpt, categories, tags, metaDescription, keywords, isCommentEnabled } = req.body;

    // Validate required fields first
    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    // Validate excerpt length before doing anything else
    if (excerpt && excerpt.length > 300) {
        throw new ApiError(400, "Excerpt cannot exceed 300 characters");
    }

    // Validate other field lengths
    if (title.length > 200) {
        throw new ApiError(400, "Title cannot exceed 200 characters");
    }

    if (metaDescription && metaDescription.length > 160) {
        throw new ApiError(400, "Meta description cannot exceed 160 characters");
    }

    // Get the featured image path but don't upload yet
    const featuredImageLocalPath = req.file?.path;

    // Only upload to Cloudinary after validation passes
    let featuredImageUrl = "";
    if (featuredImageLocalPath) {
        const featuredImage = await uploadOnCloudinary(featuredImageLocalPath);
        if (!featuredImage) {
            throw new ApiError(400, "Error while uploading featured image");
        }
        featuredImageUrl = featuredImage.url;
    }

    const blog = await Blog.create({
        title,
        content,
        excerpt,
        featuredImage: featuredImageUrl,
        author: req.user._id,
        categories: categories ? categories.split(",").map(cat => cat.trim()) : [],
        tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
        metaDescription,
        keywords: keywords ? keywords.split(",").map(keyword => keyword.trim()) : [],
        isCommentEnabled: isCommentEnabled !== undefined ? isCommentEnabled : true
    });

    const createdBlog = await Blog.findById(blog._id).populate("author", "username fullName avatar");

    return res.status(201).json(
        new ApiResponse(201, createdBlog, "Blog created successfully")
    );
});

// Get all published blogs with pagination
const getAllBlogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, tag, sortBy = "createdAt" } = req.query;

    const matchStage = { 
        status: "published", 
        createdAt: { $lte: new Date() } 
    };
    
    if (category) matchStage.categories = category;
    if (tag) matchStage.tags = tag;

    const aggregate = Blog.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$author" },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                commentCount: { $size: "$comments" }
            }
        },
        { $sort: { [sortBy]: -1 } }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const blogs = await Blog.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, blogs, "Blogs fetched successfully")
    );
});

// Get blog by ID
const getBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id)
        .populate("author", "username fullName avatar")
        .populate("comments.user", "username fullName avatar")
        .populate("likes", "username fullName avatar");

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    return res.status(200).json(
        new ApiResponse(200, blog, "Blog fetched successfully")
    );
});

// Get blog by slug
const getBlogBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: "published" })
        .populate("author", "username fullName avatar")
        .populate("comments.user", "username fullName avatar")
        .populate("likes", "username fullName avatar");

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    return res.status(200).json(
        new ApiResponse(200, blog, "Blog fetched successfully")
    );
});

// Update blog
const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, excerpt, categories, tags, metaDescription, keywords, isCommentEnabled } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own blogs");
    }

    // Handle featured image update
    let featuredImageUrl = blog.featuredImage;
    if (req.file?.path) {
        const featuredImage = await uploadOnCloudinary(req.file.path);
        if (featuredImage) {
            featuredImageUrl = featuredImage.url;
        }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        {
            ...(title && { title }),
            ...(content && { content }),
            ...(excerpt && { excerpt }),
            ...(featuredImageUrl && { featuredImage: featuredImageUrl }),
            ...(categories && { categories: categories.split(",").map(cat => cat.trim()) }),
            ...(tags && { tags: tags.split(",").map(tag => tag.trim()) }),
            ...(metaDescription && { metaDescription }),
            ...(keywords && { keywords: keywords.split(",").map(keyword => keyword.trim()) }),
            ...(isCommentEnabled !== undefined && { isCommentEnabled })
        },
        { new: true }
    ).populate("author", "username fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, updatedBlog, "Blog updated successfully")
    );
});

// Delete blog
const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own blogs");
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Blog deleted successfully")
    );
});

// Publish blog
const publishBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only publish your own blogs");
    }

    blog.status = "published";
    if (!blog.publishedAt) {
        blog.publishedAt = new Date();
    }

    await blog.save();

    return res.status(200).json(
        new ApiResponse(200, blog, "Blog published successfully")
    );
});

// Unpublish blog
const unpublishBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only unpublish your own blogs");
    }

    blog.status = "draft";
    await blog.save();

    return res.status(200).json(
        new ApiResponse(200, blog, "Blog unpublished successfully")
    );
});

// Get user's blogs
const getUserBlogs = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // If userId is provided in params, use it; otherwise use current user
    const targetUserId = userId || req.user._id;

    // Build match stage
    const matchStage = { author: new mongoose.Types.ObjectId(targetUserId) };
    
    if (userId && userId !== req.user?._id.toString()) {
        matchStage.status = "published";
        matchStage.publishedAt = { $lte: new Date() };
    } else if (status) {
        matchStage.status = status;
    }

    const aggregate = Blog.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$author" },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                commentCount: { $size: "$comments" }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const blogs = await Blog.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, blogs, "User blogs fetched successfully")
    );
});

// Like blog
const likeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    await blog.addLike(req.user._id);

    return res.status(200).json(
        new ApiResponse(200, { likeCount: blog.likeCount }, "Blog liked successfully")
    );
});

// Unlike blog
const unlikeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    await blog.removeLike(req.user._id);

    return res.status(200).json(
        new ApiResponse(200, { likeCount: blog.likeCount }, "Blog unliked successfully")
    );
});

// Add comment
const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    await blog.addComment(req.user._id, content);

    const updatedBlog = await Blog.findById(id)
        .populate("comments.user", "username fullName avatar");

    return res.status(201).json(
        new ApiResponse(201, updatedBlog.comments, "Comment added successfully")
    );
});

// Delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const { id, commentId } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if user is the comment author or blog author
    if (comment.user.toString() !== req.user._id.toString() && 
        blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own comments or comments on your blog");
    }

    blog.comments.pull(commentId);
    await blog.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

// Search blogs
const searchBlogs = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
        throw new ApiError(400, "Search query is required");
    }

    const blogs = await Blog.searchBlogs(q)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("author", "username fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, blogs, "Search results fetched successfully")
    );
});

// Get blogs by category
const getBlogsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const aggregate = Blog.aggregate([
        {
            $match: {
                categories: category,
                status: "published",
                publishedAt: { $lte: new Date() }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$author" },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                commentCount: { $size: "$comments" }
            }
        },
        { $sort: { publishedAt: -1 } }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const blogs = await Blog.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, blogs, `Blogs in category '${category}' fetched successfully`)
    );
});

// Get blogs by tag
const getBlogsByTag = asyncHandler(async (req, res) => {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const aggregate = Blog.aggregate([
        {
            $match: {
                tags: tag,
                status: "published",
                publishedAt: { $lte: new Date() }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$author" },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                commentCount: { $size: "$comments" }
            }
        },
        { $sort: { publishedAt: -1 } }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const blogs = await Blog.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, blogs, `Blogs with tag '${tag}' fetched successfully`)
    );
});

// Increment view count
const incrementViews = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        throw new ApiError(404, "Blog not found");
    }

    await blog.incrementViews();

    return res.status(200).json(
        new ApiResponse(200, { viewCount: blog.viewCount }, "View count updated")
    );
});

export {
    createBlog,
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    updateBlog,
    deleteBlog,
    publishBlog,
    unpublishBlog,
    getUserBlogs,
    likeBlog,
    unlikeBlog,
    addComment,
    deleteComment,
    searchBlogs,
    getBlogsByCategory,
    getBlogsByTag,
    incrementViews
};