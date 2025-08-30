import { Router } from "express";
import { 
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
} from "../controllers/blog.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.route("/").get(getAllBlogs); // Get all published blogs
router.route("/search").get(searchBlogs); // Search blogs
router.route("/category/:category").get(getBlogsByCategory); // Get blogs by category
router.route("/tag/:tag").get(getBlogsByTag); // Get blogs by tag
router.route("/slug/:slug").get(getBlogBySlug); // Get blog by slug
router.route("/:id").get(getBlogById); // Get blog by ID
router.route("/:id/view").patch(incrementViews); // Increment view count

// Protected routes (authentication required)
router.route("/create").post(
    verifyJWT,
    upload.single("featuredImage"),
    createBlog
);

router.route("/:id/update").patch(
    verifyJWT,
    upload.single("featuredImage"),
    updateBlog
);

router.route("/:id/delete").delete(verifyJWT, deleteBlog);
router.route("/:id/publish").patch(verifyJWT, publishBlog);
router.route("/:id/unpublish").patch(verifyJWT, unpublishBlog);

// User-specific routes
router.route("/user/:userId").get(getUserBlogs); // Get blogs by specific user
router.route("/my-blogs").get(verifyJWT, getUserBlogs); // Get current user's blogs

// Interaction routes
router.route("/:id/like").post(verifyJWT, likeBlog);
router.route("/:id/unlike").post(verifyJWT, unlikeBlog);
router.route("/:id/comment").post(verifyJWT, addComment);
router.route("/:id/comment/:commentId").delete(verifyJWT, deleteComment);

export default router;