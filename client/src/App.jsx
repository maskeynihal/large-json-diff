import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import "./App.css";

function App() {
  const [json1, setJson1] = useState("");
  const [json2, setJson2] = useState("");
  const [ignoreKeys, setIgnoreKeys] = useState("");
  const [keysOnly, setKeysOnly] = useState(false);
  const [onlyKeys, setOnlyKeys] = useState("");
  const [compareKey, setCompareKey] = useState("");
  const [diff, setDiff] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDiff = async () => {
    setError("");
    setDiff(null);
    let obj1, obj2;
    try {
      obj1 = JSON.parse(json1);
      obj2 = JSON.parse(json2);
    } catch {
      setError("Invalid JSON input.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:1123/diff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json1: obj1,
          json2: obj2,
          ignoreKeys: ignoreKeys
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          keysOnly,
          onlyKeys: onlyKeys
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          compareKey: compareKey.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setDiff(data.diff);
    } catch {
      setError("Failed to connect to backend.");
    }
    setLoading(false);
  };

  return (
    <div className="json-diff-app">
      <h1>JSON Diff Tool</h1>
      <div className="json-inputs" style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 4 }}>First JSON object</div>
          <MonacoEditor
            height="300px"
            defaultLanguage="json"
            theme="light"
            value={json1}
            onChange={(v) => setJson1(v || "")}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 4 }}>Second JSON object</div>
          <MonacoEditor
            height="300px"
            defaultLanguage="json"
            theme="light"
            value={json2}
            onChange={(v) => setJson2(v || "")}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>
      </div>
      <input
        type="text"
        placeholder="Keys to ignore (comma-separated)"
        value={ignoreKeys}
        onChange={(e) => setIgnoreKeys(e.target.value)}
        style={{ marginTop: 16, width: 400 }}
      />
      <input
        type="text"
        placeholder="Only check values for these keys (comma-separated)"
        value={onlyKeys}
        onChange={(e) => setOnlyKeys(e.target.value)}
        style={{ marginTop: 8, width: 400 }}
      />
      <input
        type="text"
        placeholder="Compare array items by this key (e.g., 'id')"
        value={compareKey}
        onChange={(e) => setCompareKey(e.target.value)}
        style={{ marginTop: 8, width: 400 }}
      />
      <div style={{ marginTop: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={keysOnly}
            onChange={(e) => setKeysOnly(e.target.checked)}
          />
          Compare only keys (ignore value changes)
        </label>
      </div>
      <button onClick={handleDiff} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Comparing..." : "Compare JSON"}
      </button>
      {error && (
        <div className="error" style={{ color: "red", marginTop: 16 }}>
          {error}
        </div>
      )}
      {diff && (
        <div className="diff-result" style={{ marginTop: 16 }}>
          <h2>Diff Result</h2>
          <MonacoEditor
            height="400px"
            defaultLanguage="json"
            theme="light"
            value={JSON.stringify(diff, null, 2)}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
