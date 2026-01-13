import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Whiteboard from '../components/Whiteboard';

const Room = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);

    // Default username if direct link access
    const username = location.state?.username || `Guest-${Math.floor(Math.random() * 1000)}`;

    useEffect(() => {
        const s = io('http://localhost:3001');
        setSocket(s);

        s.emit('join-room', { roomId, username });

        s.on('user-joined', ({ users }) => {
            setUsers(users);
        });

        s.on('user-left', ({ users }) => {
            setUsers(users);
        });

        return () => {
            s.disconnect();
        };
    }, [roomId, username]);

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        alert('Room ID copied to clipboard!');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header */}
            <div className="glass-panel" style={{
                margin: '1rem',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '16px 16px',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>Exit</button>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Room: {roomId.slice(0, 8)}...</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Online: {users.length}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {users.map(u => (
                                <div key={u.id} title={u.username} style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: '#3b82f6', color: 'white', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                                    border: '2px solid var(--bg-dark)'
                                }}>
                                    {u.username[0].toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={copyRoomId}>Share ID</button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#ffffff', margin: '0 1rem 1rem 1rem', borderRadius: '12px' }}>
                {socket ? <Whiteboard socket={socket} roomId={roomId} /> : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'black' }}>Connecting...</div>}
            </div>
        </div>
    );
};

export default Room;
