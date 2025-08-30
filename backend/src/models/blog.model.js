import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
      index: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxLength: [300, "Excerpt cannot exceed 300 characters"],
      trim: true
    },
    featuredImage: {
      type: String, // cloudinary url
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    categories: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true
    },
    publishedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxLength: [1000, "Comment cannot exceed 1000 characters"]
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    readingTime: {
      type: Number, // in minutes
    },
    metaDescription: {
      type: String,
      maxLength: [160, "Meta description cannot exceed 160 characters"],
      trim: true
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    isCommentEnabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ categories: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: "text", content: "text" }); // Text search

// Pre-save middleware to auto-generate slug if not provided
blogSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim("-");
  }
  next();
});

// Pre-save middleware to set publishedAt when status changes to published
blogSchema.pre("save", function (next) {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Pre-save middleware to calculate reading time
blogSchema.pre("save", function (next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Virtual for like count
blogSchema.virtual("likeCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
blogSchema.virtual("commentCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

// Method to increment view count
blogSchema.methods.incrementViews = function () {
  this.viewCount += 1;
  return this.save();
};

// Method to add a like
blogSchema.methods.addLike = function (userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return this;
};

// Method to remove a like
blogSchema.methods.removeLike = function (userId) {
  this.likes = this.likes.filter(id => !id.equals(userId));
  return this.save();
};

// Method to add a comment
blogSchema.methods.addComment = function (userId, content) {
  if (this.isCommentEnabled) {
    this.comments.push({
      user: userId,
      content: content,
      createdAt: new Date()
    });
    return this.save();
  }
  throw new Error("Comments are disabled for this blog");
};

// Static method to find published blogs
blogSchema.statics.findPublished = function () {
  return this.find({ status: "published", publishedAt: { $lte: new Date() } })
    .sort({ publishedAt: -1 });
};

// Static method to find blogs by author
blogSchema.statics.findByAuthor = function (authorId) {
  return this.find({ author: authorId }).sort({ createdAt: -1 });
};

// Static method to search blogs
blogSchema.statics.searchBlogs = function (query) {
  return this.find(
    { $text: { $search: query }, status: "published" },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

// Add aggregate pagination plugin
blogSchema.plugin(mongooseAggregatePaginate);

export const Blog = mongoose.model("Blog", blogSchema);