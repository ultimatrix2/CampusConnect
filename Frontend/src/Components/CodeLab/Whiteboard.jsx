import React, { useRef, useEffect, useState } from "react";
import { getStroke } from "perfect-freehand";
import socket from "../../socket";
import { Eraser, Trash2, Palette } from "lucide-react";

const COLORS = [
    "#ffffff",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
];

const getSvgPathFromStroke = (stroke) => {
    if (!stroke.length) return "";

    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );

    d.push("Z");
    return d.join(" ");
};

const Whiteboard = ({ roomId, isHost }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState("#ffffff");
    const [brushSize, setBrushSize] = useState(8);
    const [strokes, setStrokes] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([]);
    const contextRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            redrawStrokes();
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const context = canvas.getContext("2d");
        contextRef.current = context;

        // Listen for strokes from other user
        socket.on("draw-stroke", ({ stroke }) => {
            setStrokes((prev) => [...prev, stroke]);
        });

        socket.on("whiteboard-cleared", () => {
            setStrokes([]);
        });

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            socket.off("draw-stroke");
            socket.off("whiteboard-cleared");
        };
    }, []);

    useEffect(() => {
        redrawStrokes();
    }, [strokes]);

    const redrawStrokes = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        strokes.forEach((stroke) => {
            drawStroke(stroke);
        });
    };

    const drawStroke = (strokeData) => {
        const context = contextRef.current;
        if (!context) return;

        const pathData = getStroke(strokeData.points, {
            size: strokeData.size,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
        });

        const path = new Path2D(getSvgPathFromStroke(pathData));
        context.fillStyle = strokeData.color;
        context.fill(path);
    };

    const getPointerPosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        return [clientX - rect.left, clientY - rect.top, e.pressure || 0.5];
    };

    const handlePointerDown = (e) => {
        setIsDrawing(true);
        const point = getPointerPosition(e);
        setCurrentStroke([point]);
    };

    const handlePointerMove = (e) => {
        if (!isDrawing) return;
        const point = getPointerPosition(e);
        setCurrentStroke((prev) => [...prev, point]);

        // Draw current stroke
        const strokeData = {
            points: [...currentStroke, point],
            color: currentColor,
            size: brushSize,
        };
        redrawStrokes();
        drawStroke(strokeData);
    };

    const handlePointerUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (currentStroke.length > 0) {
            const strokeData = {
                points: currentStroke,
                color: currentColor,
                size: brushSize,
            };
            setStrokes((prev) => [...prev, strokeData]);
            socket.emit("draw-stroke", { roomId, stroke: strokeData });
        }
        setCurrentStroke([]);
    };

    const clearWhiteboard = () => {
        setStrokes([]);
        socket.emit("clear-whiteboard", { roomId });
    };

    return (
        <div className="whiteboard-container">
            <div className="whiteboard-header">
                <div className="header-left">
                    <span className="whiteboard-icon">🎨</span>
                    <span>Whiteboard</span>
                </div>
                <div className="header-right">
                    <div className="color-picker">
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                className={`color-btn ${currentColor === color ? "active" : ""}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setCurrentColor(color)}
                            />
                        ))}
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="brush-size-slider"
                    />
                    <button className="clear-btn" onClick={clearWhiteboard} title="Clear">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            <div className="canvas-wrapper">
                <canvas
                    ref={canvasRef}
                    className="whiteboard-canvas"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                />
            </div>
        </div>
    );
};

export default Whiteboard;
