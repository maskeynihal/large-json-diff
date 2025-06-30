const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  `http://localhost:${PORT}`, // or whatever your local dev port is
  "https://large-json-diff.nihal.com.np",
  "https://large-json-diff-server.onrender.com",
  "https://large-json-diff-server-on-render.nihal.com.np",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// Helper to recursively remove ignored keys from an object
function removeIgnoredKeys(obj, ignoreKeys) {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeIgnoredKeys(item, ignoreKeys));
  } else if (obj && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      if (!ignoreKeys.includes(key)) {
        acc[key] = removeIgnoredKeys(obj[key], ignoreKeys);
      }
      return acc;
    }, {});
  }
  return obj;
}

// Simple JSON diff function
function recursiveDiff(obj1, obj2, options = {}, path = "") {
  const {
    ignoreKeys = [],
    keysOnly = false,
    onlyKeys = [],
    compareKey = null,
  } = options;
  const changes = {};
  const onlyKeysSet = new Set(onlyKeys);
  const ignoreKeysSet = new Set(ignoreKeys);

  // Helper to check if a key should be ignored at this path
  function shouldIgnore(key) {
    return ignoreKeysSet.has(key);
  }

  // Helper to check if a key should only be value-compared
  function shouldOnlyCheckValue(key) {
    return onlyKeys.length === 0 || onlyKeysSet.has(key);
  }

  // Handle array comparison with compareKey
  if (Array.isArray(obj1) && Array.isArray(obj2) && compareKey) {
    const map1 = new Map(obj1.map((item) => [item[compareKey], item]));
    const map2 = new Map(obj2.map((item) => [item[compareKey], item]));

    // Find items that exist in both arrays but have differences
    for (const [key, item1] of map1.entries()) {
      const item2 = map2.get(key);
      if (item2) {
        const itemDiff = recursiveDiff(
          item1,
          item2,
          { ...options, compareKey: null },
          path
        );
        Object.assign(changes, itemDiff);
      }
    }

    // Find items that exist only in obj1 (removed items)
    for (const [key, item1] of map1.entries()) {
      if (!map2.has(key)) {
        changes[path ? `${path}[${key}]` : key] = {
          from: item1,
          to: undefined,
        };
      }
    }

    // Find items that exist only in obj2 (added items)
    for (const [key, item2] of map2.entries()) {
      if (!map1.has(key)) {
        changes[path ? `${path}[${key}]` : key] = {
          from: undefined,
          to: item2,
        };
      }
    }

    return changes;
  }

  // Get all unique keys at this level
  const keys = new Set([
    ...Object.keys(obj1 || {}),
    ...Object.keys(obj2 || {}),
  ]);

  for (const key of keys) {
    if (shouldIgnore(key)) continue;
    const val1 = obj1 ? obj1[key] : undefined;
    const val2 = obj2 ? obj2[key] : undefined;
    const bothObjects =
      val1 && typeof val1 === "object" && val2 && typeof val2 === "object";

    if (!(key in (obj1 || {}))) {
      changes[path ? path + "." + key : key] = { from: undefined, to: val2 };
    } else if (!(key in (obj2 || {}))) {
      changes[path ? path + "." + key : key] = { from: val1, to: undefined };
    } else if (bothObjects) {
      const childDiff = recursiveDiff(
        val1,
        val2,
        options,
        path ? path + "." + key : key
      );
      Object.assign(changes, childDiff);
    } else if (
      !keysOnly &&
      shouldOnlyCheckValue(key) &&
      JSON.stringify(val1) !== JSON.stringify(val2)
    ) {
      changes[path ? path + "." + key : key] = { from: val1, to: val2 };
    }
  }
  return changes;
}

app.post("/diff", (req, res) => {
  const {
    json1,
    json2,
    ignoreKeys = [],
    keysOnly = false,
    onlyKeys = [],
    compareKey = null,
  } = req.body;
  if (!json1 || !json2) {
    return res
      .status(400)
      .json({ error: "Both json1 and json2 are required." });
  }
  const options = { ignoreKeys, keysOnly, onlyKeys, compareKey };
  const result = recursiveDiff(json1, json2, options);
  res.json({ diff: result });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

module.exports = app;
