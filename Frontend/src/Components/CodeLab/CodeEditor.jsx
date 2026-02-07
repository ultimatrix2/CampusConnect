import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import socket from "../../socket";
import { Play, Loader2, Terminal, X } from "lucide-react";

// Language mappings for Piston API
const LANGUAGES = [
    { value: "javascript", label: "JavaScript", piston: "javascript", version: "18.15.0" },
    { value: "typescript", label: "TypeScript", piston: "typescript", version: "5.0.3" },
    { value: "python", label: "Python", piston: "python", version: "3.10.0" },
    { value: "java", label: "Java", piston: "java", version: "15.0.2" },
    { value: "cpp", label: "C++", piston: "c++", version: "10.2.0" },
    { value: "c", label: "C", piston: "c", version: "10.2.0" },
    { value: "go", label: "Go", piston: "go", version: "1.16.2" },
    { value: "rust", label: "Rust", piston: "rust", version: "1.68.2" },
];

const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const CodeEditor = ({ roomId, userId, initialCode, initialLanguage }) => {
    const [code, setCode] = useState(initialCode || "// Start coding here...\n");
    const [language, setLanguage] = useState(initialLanguage || "javascript");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [stdin, setStdin] = useState("");
    const [showInput, setShowInput] = useState(false);
    const editorRef = useRef(null);
    const isRemoteChange = useRef(false);

    useEffect(() => {
        // Listen for code updates from other user
        socket.on("code-update", ({ code: newCode, userId: senderId }) => {
            if (senderId !== userId) {
                isRemoteChange.current = true;
                setCode(newCode);
            }
        });

        // Listen for language changes
        socket.on("language-update", ({ language: newLang }) => {
            setLanguage(newLang);
        });

        return () => {
            socket.off("code-update");
            socket.off("language-update");
        };
    }, [userId]);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleCodeChange = (value) => {
        if (isRemoteChange.current) {
            isRemoteChange.current = false;
            return;
        }
        setCode(value);
        socket.emit("code-change", { roomId, code: value, userId });
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        socket.emit("language-change", { roomId, language: newLang });
    };

    const runCode = async () => {
        const langConfig = LANGUAGES.find((l) => l.value === language);

        if (!langConfig || !langConfig.piston) {
            setOutput("⚠️ Code execution not supported for this language.");
            setShowOutput(true);
            return;
        }

        setIsRunning(true);
        setShowOutput(true);
        setOutput("Running code...");

        try {
            const response = await fetch(PISTON_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language: langConfig.piston,
                    version: langConfig.version,
                    files: [
                        {
                            name: `main.${langConfig.value === "cpp" ? "cpp" : langConfig.value === "python" ? "py" : langConfig.value}`,
                            content: code,
                        },
                    ],
                    stdin: stdin,
                }),
            });

            const result = await response.json();

            if (result.run) {
                const { stdout, stderr, code: exitCode } = result.run;
                let outputText = "";

                if (stdout) {
                    outputText += stdout;
                }
                if (stderr) {
                    outputText += (outputText ? "\n" : "") + "⚠️ Errors:\n" + stderr;
                }
                if (!stdout && !stderr) {
                    outputText = "(No output)";
                }

                outputText += `\n\n✓ Exit code: ${exitCode}`;
                setOutput(outputText);
            } else if (result.message) {
                setOutput(`❌ Error: ${result.message}`);
            } else {
                setOutput("❌ Failed to execute code");
            }
        } catch (error) {
            setOutput(`❌ Network error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="code-editor-container">
            <div className="code-editor-header">
                <div className="editor-title">
                    <span className="editor-icon">📝</span>
                    <span>Code Editor</span>
                </div>
                <div className="editor-controls">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="language-select"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    <button
                        className="input-btn"
                        onClick={() => setShowInput(!showInput)}
                        title="Add input (stdin)"
                    >
                        <Terminal size={16} />
                        Input
                    </button>
                    <button
                        className="run-btn"
                        onClick={runCode}
                        disabled={isRunning}
                        title="Run code (Ctrl+Enter)"
                    >
                        {isRunning ? (
                            <Loader2 size={16} className="spin" />
                        ) : (
                            <Play size={16} />
                        )}
                        {isRunning ? "Running..." : "Run"}
                    </button>
                </div>
            </div>

            {/* Input Panel */}
            {showInput && (
                <div className="stdin-panel">
                    <div className="stdin-header">
                        <span>📥 Input (stdin)</span>
                        <button onClick={() => setShowInput(false)}>
                            <X size={14} />
                        </button>
                    </div>
                    <textarea
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        placeholder="Enter input for your program..."
                        className="stdin-input"
                    />
                </div>
            )}

            <div className={`editor-wrapper ${showOutput ? "with-output" : ""}`}>
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={handleCodeChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: "on",
                        lineNumbers: "on",
                        folding: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        smoothScrolling: true,
                        renderLineHighlight: "all",
                        bracketPairColorization: { enabled: true },
                    }}
                />
            </div>

            {/* Output Panel */}
            {showOutput && (
                <div className="output-panel">
                    <div className="output-header">
                        <span>📤 Output</span>
                        <button onClick={() => setShowOutput(false)}>
                            <X size={14} />
                        </button>
                    </div>
                    <pre className="output-content">{output}</pre>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;
