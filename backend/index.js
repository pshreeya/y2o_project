const express = require("express");
const app = require("./api/index.js");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});

module.exports = app;
