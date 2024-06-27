const Blog = require('../models/blog.model');
const User = require('../models/user.model');
const Tag = require('../models/tag.model');

// Get all blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().populate('author', 'username').populate('tags');
        res.json(blogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get a single blog by ID
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'username').populate('tags');
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Create a blog
exports.createBlog = async (req, res) => {
    const { title, content, images, tags } = req.body;

    try {
        // Ensure all tags are predefined
        const tagDocs = await Tag.find({ _id: { $in: tags } });
        if (tagDocs.length !== tags.length) {
            return res.status(400).json({ message: 'Invalid tags provided' });
        }

        const newBlog = new Blog({
            title,
            content,
            author: req.user.id,
            images,
            tags,
        });

        const blog = await newBlog.save();
        res.status(201).json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a blog
exports.updateBlog = async (req, res) => {
    const { title, content, images, tags, status } = req.body;

    const updatedBlog = {};
    if (title) updatedBlog.title = title;
    if (content) updatedBlog.content = content;
    if (images) updatedBlog.images = images;
    if (tags) updatedBlog.tags = tags;
    if (status) updatedBlog.status = status;

    try {
        let blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Ensure all tags are predefined
        if (tags) {
            const tagDocs = await Tag.find({ _id: { $in: tags } });
            if (tagDocs.length !== tags.length) {
                return res.status(400).json({ message: 'Invalid tags provided' });
            }
            updatedBlog.tags = tags;
        }

        // Check if the logged-in user is the author of the blog
        if (blog.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $set: updatedBlog },
            { new: true }
        );

        res.json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the logged-in user is the author of the blog
        if (blog.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await blog.remove();
        res.json({ message: 'Blog removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Request a review
exports.requestReview = async (req, res) => {
    const { reviewerId } = req.body;

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the logged-in user is the author of the blog
        if (blog.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        blog.review.reviewer = reviewerId;
        blog.review.isReviewed = false;
        await blog.save();

        res.json({ message: 'Review requested' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Submit a review
exports.submitReview = async (req, res) => {
    const { comments } = req.body;

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the logged-in user is the reviewer of the blog
        if (blog.review.reviewer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        blog.review.comments = comments.map(comment => ({
            reviewer: req.user.id,
            text: comment.text,
            section: comment.section,
        }));
        blog.review.isReviewed = true;
        await blog.save();

        // Notify the author about the review (optional implementation)
        // notifyUser(blog.author, 'Your blog has been reviewed');

        res.json({ message: 'Review submitted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Search blogs
exports.searchBlogs = async (req, res) => {
    const { title, author, tag, status } = req.query;
    const query = {};

    if (title) {
        query.title = { $regex: title, $options: 'i' }; // Case-insensitive search by title
    }

    if (author) {
        const authorUser = await User.findOne({ username: author });
        if (authorUser) {
            query.author = authorUser._id;
        } else {
            return res.status(404).json({ message: 'Author not found' });
        }
    }

    if (tag) {
        const tagDoc = await Tag.findOne({ name: tag });
        if (tagDoc) {
            query.tags = tagDoc._id;
        } else {
            return res.status(404).json({ message: 'Tag not found' });
        }
    }

    if (status) {
        query.status = status;
    }

    try {
        const blogs = await Blog.find(query).populate('author', 'username').populate('tags');
        res.json(blogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
