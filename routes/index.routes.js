const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json("To bien aki");
});

module.exports = router;
