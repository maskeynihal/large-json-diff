# Large JSON Diff

A full-stack web application for comparing large JSON objects, highlighting their differences with advanced options. The project consists of a React frontend and an Express backend.

## Features

- Compare two large JSON objects
- Ignore specific keys during comparison
- Compare only keys or only specific keys
- Compare array items by a unique key
- Visual diff output

## Directory Structure

```
large-json-diff/
  client/      # React frontend
  server/      # Express backend
  README.md    # Project documentation
```

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)

### 1. Backend (Server)

```
cd server
npm install
npm start
```

The server will run on `http://localhost:1123`.

### 2. Frontend (Client)

```
cd client
npm install
npm run dev
```

The client will run on `http://localhost:5173` (default Vite port).

---

## Code Explanation

### Backend (`server/index.js`)

- **Express server** with CORS and JSON body parsing.
- **POST /diff** endpoint:
  - Accepts two JSON objects (`json1`, `json2`) and options (`ignoreKeys`, `keysOnly`, `onlyKeys`, `compareKey`).
  - Uses `recursiveDiff` to compute differences:
    - Recursively compares objects/arrays.
    - Can ignore specified keys, compare only keys, or compare array items by a unique key.
    - Returns a diff object showing changes as `{ from, to }` for each path.
- **removeIgnoredKeys**: Helper to strip ignored keys from objects (used internally).

### Frontend (`client/src/App.jsx`)

- **React app** with Monaco Editor for JSON input and diff output.
- State for both JSONs, options, diff result, error, and loading.
- **handleDiff**:
  - Parses user input as JSON.
  - Sends a POST request to `/diff` endpoint with options.
  - Displays the diff result or error.
- **UI**:
  - Two Monaco editors for JSON input.
  - Inputs for ignore keys, only keys, and compare key.
  - Checkbox for "keys only" mode.
  - Button to trigger comparison.
  - Monaco editor for read-only diff output.

### Other Notable Files

- `client/package.json` & `server/package.json`: List dependencies and scripts for each part.
- `client/vite.config.js`: Vite config for React.
- `client/eslint.config.js`: ESLint config for code quality.
- `client/src/App.css` & `client/src/index.css`: Styling for the frontend.
- `client/index.html`: HTML entry point for the React app.

---

## Usage

1. Start both the server and client as described above.
2. Open the client in your browser.
3. Paste or type two JSON objects to compare.
4. (Optional) Enter keys to ignore, only compare, or a key for array comparison.
5. Click "Compare JSON" to see the diff result.

---

## Technologies Used

- **Frontend**: React, Vite, Monaco Editor
- **Backend**: Node.js, Express, CORS, body-parser

---

## Author

Nihal Maskey

---

## License

This project is licensed under the ISC License.
