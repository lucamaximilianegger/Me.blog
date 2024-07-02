const Blog = require('../models/blog.model');
const User = require('../models/user.model');
const { sendNotification } = require('../services/notification.service');
const blacklistedWords = require('../config/blacklisted-words.json');

// Helper function to check for blacklisted words
const containsBlacklistedWords = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    return words.some(word => blacklistedWords.includes(word));
};

exports.addPublicComment = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (containsBlacklistedWords(content)) {
            return res.status(400).json({ message: 'Comment contains inappropriate language' });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (!blog.publicCommentsEnabled) {
            return res.status(403).json({ message: 'Public comments are disabled for this blog post' });
        }

        const newComment = {
            content,
            author: userId
        };

        blog.publicComments.push(newComment);
        await blog.save();

        // Notify the blog author if they have notifications enabled
        const blogAuthor = await User.findById(blog.author);
        if (blogAuthor.notificationSettings.email) {
            await sendNotification(blogAuthor.email, 'New public comment on your blog post', `A new public comment has been added to your blog post "${blog.title}"`);
        }

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding public comment', error: error.message });
    }
};

exports.addPublicReply = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (containsBlacklistedWords(content)) {
            return res.status(400).json({ message: 'Reply contains inappropriate language' });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = blog.publicComments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const newReply = {
            content,
            author: userId
        };

        comment.replies.push(newReply);
        await blog.save();

        // Notify the comment author
        const commentAuthor = await User.findById(comment.author);
        if (commentAuthor.notificationSettings.email) {
            await sendNotification(commentAuthor.email, 'New reply to your public comment', `Someone replied to your public comment on the blog post "${blog.title}"`);
        }

        res.status(201).json(newReply);
    } catch (error) {
        res.status(500).json({ message: 'Error adding reply to public comment', error: error.message });
    }
};

exports.editPublicComment = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (containsBlacklistedWords(content)) {
            return res.status(400).json({ message: 'Comment contains inappropriate language' });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = blog.publicComments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }

        comment.content = content;
        comment.isEdited = true;
        comment.updatedAt = Date.now();
        await blog.save();

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error editing public comment', error: error.message });
    }
};

exports.deletePublicComment = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = blog.publicComments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== userId && !req.user.roles.includes('Admin')) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        comment.remove();
        await blog.save();

        res.json({ message: 'Public comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting public comment', error: error.message });
    }
};

exports.likePublicComment = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = blog.publicComments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const likeIndex = comment.likes.indexOf(userId);
        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1); // Unlike
        } else {
            comment.likes.push(userId); // Like
        }

        await blog.save();

        res.json({ likes: comment.likes.length });
    } catch (error) {
        res.status(500).json({ message: 'Error liking public comment', error: error.message });
    }
};

exports.pinPublicComment = async (req, res) => {
    try {
        const { blogId, commentId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.author.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to pin comments' });
        }

        const comment = blog.publicComments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.isPinned = !comment.isPinned; // Toggle pin status
        await blog.save();

        res.json({ isPinned: comment.isPinned });
    } catch (error) {
        res.status(500).json({ message: 'Error pinning public comment', error: error.message });
    }
};

exports.getPublicComments = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const blog = await Blog.findById(blogId)
            .populate({
                path: 'publicComments',
                populate: {
                    path: 'author',
                    select: 'username profileImage'
                },
                options: {
                    sort: { isPinned: -1, createdAt: -1 },
                    skip: (page - 1) * limit,
                    limit: parseInt(limit)
                }
            });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const totalComments = blog.publicComments.length;
        const totalPages = Math.ceil(totalComments / limit);

        res.json({
            comments: blog.publicComments,
            currentPage: page,
            totalPages,
            totalComments
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public comments', error: error.message });
    }
};

exports.togglePublicComments = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.id;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.author.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to toggle comments' });
        }

        blog.publicCommentsEnabled = !blog.publicCommentsEnabled;
        await blog.save();

        res.json({ publicCommentsEnabled: blog.publicCommentsEnabled });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling public comments', error: error.message });
    }
};

exports.updatePublicComment = async (req, res) => {
    try {
        // Implementierung der Aktualisierungslogik
    } catch (error) {
        res.status(500).json({ message: 'Error updating public comment', error: error.message });
    }
};