const BlogModel = require('../models/BlogModel');

exports.createBlog = async (req, res) => {
    const { title, body, source } = req.body;

    try {
        const blog = await new BlogModel({
            title,
            body,
            source
        });

        await blog.save();

        res.status(201).json({ success: true, message: "Blog creado con éxito." });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await BlogModel.find();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}