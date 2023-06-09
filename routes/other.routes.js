const express = require("express");
const router = express.Router();

const { createDirectory, getAllDirectories } = require("../controller/directory-controller");
const { createBlog, getAllBlogs } = require("../controller/blog-controller");

router.post("/blog/create", createBlog);
router.post("/directory/create", createDirectory);

router.get("/blog", getAllBlogs)
router.get("/directory", getAllDirectories);


module.exports = router;
