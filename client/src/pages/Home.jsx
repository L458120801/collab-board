import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createRoom = () => {
        if (!username) return alert('Please enter a username');
        const id = uuidv4();
        navigate(`/room/${id}`, { state: { username } });
    };

    const joinRoom = () => {
        if (!username) return alert('Please enter a username');
        if (!roomId) return alert('Please enter a Room ID');
        navigate(`/room/${roomId}`, { state: { username } });
    };

    return (
        <div className="home-container" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)'
        }}>
            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    CollabBoard
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Real-time whiteboard collaboration made simple.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Enter your name..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }}></div>

                    <button className="btn btn-primary" onClick={createRoom}>
                        Create New Room
                    </button>

                    <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>OR</p>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Room ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button className="btn btn-secondary" onClick={joinRoom}>
                            Join
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', color: 'var(--text-muted)' }}>
                <span>⚡ Real-time Sync</span>
                <span>🔒 Secure & Private</span>
                <span>🎨 Infinite Canvas</span>
            </div>
        </div>
    );
};

export default Home;
