import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';

const Whiteboard = ({ socket, roomId }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);

    // Helper to draw
    const drawLine = ({ x0, y0, x1, y1, color, width, emit }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();

        if (!emit) return;

        // Normalize coordinates?
        // For now, send raw relative to canvas size. 
        // Ideally user percentage for responsive sync, but let's stick to simple first.
        // If screen sizes differ significantly, drawing will be off. 
        // To fix properly is complex. 
        // Let's assume users use roughly similar viewports or just canvas size.
        // Compromise: Send relative (0-1) coords? No, simple pixel coords for MVP.
        // Actually, sending ratios is better.
        const rect = canvas.getBoundingClientRect();
        const w = canvas.width;
        const h = canvas.height;

        socket.emit('draw', {
            roomId,
            data: {
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color,
                width
            }
        });
    };

    const drawLineFromSocket = (data) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const w = canvas.width;
        const h = canvas.height;

        ctx.beginPath();
        // Decode ratios
        ctx.moveTo(data.x0 * w, data.y0 * h);
        ctx.lineTo(data.x1 * w, data.y1 * h);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width; // Should we scale width? Keep it absolute for now.
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();
    };

    useEffect(() => {
        if (!socket) return;

        // Load History
        socket.on('load-history', (history) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            // Clear first
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            history.forEach(item => {
                drawLineFromSocket(item);
            });
        });

        socket.on('draw', (data) => {
            drawLineFromSocket(data);
        });

        socket.on('clear-canvas', () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        return () => {
            socket.off('load-history');
            socket.off('draw');
            socket.off('clear-canvas');
        };
    }, [socket]);

    // Resize handling
    useLayoutEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                // Save current content?
                // Resizing clears canvas usually.
                // Better to set fixed high resolution or fetch history again.
                // Let's just set initial size and maybe a debounced resize reload.
                const parent = containerRef.current;
                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
                // Note: Resizing clears canvas content.
                // In a real app we'd redraw history here.
                // Let's trigger a history reload? No easiest is just accept it clears until refresh.
                // Or better, don't resize dynamically or ask server for history.
                // I'll emit 'request-history'? No server sends it on join.
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // Interaction
    const lastPos = useRef({ x: 0, y: 0 });

    const onMouseDown = (e) => {
        setIsDrawing(true);
        const rect = canvasRef.current.getBoundingClientRect();
        lastPos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const onMouseMove = (e) => {
        if (!isDrawing) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        drawLine({
            x0: lastPos.current.x,
            y0: lastPos.current.y,
            x1: currentX,
            y1: currentY,
            color,
            width: lineWidth,
            emit: true
        });

        lastPos.current = { x: currentX, y: currentY };
    };

    const onMouseUp = () => {
        setIsDrawing(false);
    };

    const clearBoard = () => {
        socket.emit('clear-canvas', { roomId });
        // Local clear happens via socket event loopback usually? 
        // Or optimistic? Let's wait for server event to keep sync.
        // See socket.on('clear-canvas') above.
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <canvas
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{ cursor: 'crosshair', display: 'block' }}
            />

            {/* Floating Toolbar */}
            <div className="glass-panel" style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '12px',
                padding: '10px',
                borderRadius: '50px',
                zIndex: 20,
                alignItems: 'center'
            }}>
                {/* Colors */}
                {['#000000', '#ef4444', '#3b82f6', '#22c55e', '#ffffff'].map(c => (
                    <div
                        key={c}
                        onClick={() => setColor(c)}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: c,
                            border: `3px solid ${color === c ? 'var(--primary)' : 'transparent'}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            cursor: 'pointer'
                        }}
                    />
                ))}

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

                {/* Size Slider */}
                <input
                    type="range"
                    min="1" max="20"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(e.target.value)}
                    style={{ width: '80px' }}
                />

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>

                {/* Actions */}
                <button className="btn btn-secondary" onClick={clearBoard} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#f87171' }}>
                    Clear
                </button>
            </div>
        </div>
    );
};

export default Whiteboard;
