const path = require("path");
const fs = require("fs");

exports.getFormStructure = (req, res) => {
  const filePath = path.join(__dirname, "../steps.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
    res.json(JSON.parse(data));
  });
};
