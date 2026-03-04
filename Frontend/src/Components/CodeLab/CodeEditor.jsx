import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import socket from "../../socket";
import { Play, Loader2, Terminal, X } from "lucide-react";

// Language mappings for Wandbox API (Alternative to Piston)
const LANGUAGES = [
    { value: "javascript", label: "JavaScript", compiler: "nodejs-20.17.0" },
    { value: "typescript", label: "TypeScript", compiler: "typescript-5.6.2" },
    { value: "python", label: "Python", compiler: "cpython-3.12.7" },
    { value: "java", label: "Java", compiler: "openjdk-jdk-22+36" },
    { value: "cpp", label: "C++", compiler: "gcc-head" },
    { value: "c", label: "C", compiler: "gcc-head-c" },
    { value: "go", label: "Go", compiler: "go-1.23.2" },
    { value: "rust", label: "Rust", compiler: "rust-1.82.0" },
];

const WANDBOX_API = "https://wandbox.org/api/compile.json";

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

        if (!langConfig || !langConfig.compiler) {
            setOutput("⚠️ Code execution not supported for this language.");
            setShowOutput(true);
            return;
        }

        setIsRunning(true);
        setShowOutput(true);
        setOutput("Running code...");

        try {
            const response = await fetch(WANDBOX_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    compiler: langConfig.compiler,
                    code: code,
                    stdin: stdin,
                }),
            });

            const result = await response.json();

            if (result.status === "0") {
                let outputText = result.program_message || result.program_output || "(No output)";
                outputText += `\n\n✓ Exit code: 0`;
                setOutput(outputText);
            } else if (result.status !== undefined) {
                let errorText = result.compiler_error || result.program_error || result.compiler_message || "Execution failed";
                setOutput(`❌ Error:\n${errorText}\n\nExit code: ${result.status}`);
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
