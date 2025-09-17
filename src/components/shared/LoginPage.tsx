import React, { useState } from 'react';
import realtimeService from '../../services/realtimeService';
import { useAppContext } from '../../context/AppContext';

const LoginPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { dispatch } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [wssUrl, setWssUrl] = useState('ws://localhost:8081');
  const [devMode, setDevMode] = useState(false);

  const connect = () => {
    try {
      (window as any).__DEMO_REALTIME_URL = wssUrl;
      realtimeService.connect(wssUrl);
      realtimeService.login(username || 'demo', password || 'demo', 'demo');
      dispatch({ type: 'LOGIN_SUCCESS', payload: { username, role: username === 'caregiver' ? 'CAREGIVER' : username === 'patient' ? 'PATIENT' : 'FAMILY' } });
      dispatch({ type: 'SET_DEV_MODE', payload: devMode });
      if (onClose) onClose();
    } catch (e) {
      console.error('Failed to connect', e);
    }
  };

  const close = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-60">
      <div className="absolute inset-0 bg-black/60" onClick={close}></div>
      <div className="relative bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 z-70 border border-slate-700">
        <button onClick={close} className="absolute top-3 right-3 text-slate-400 hover:text-white">X</button>
        <h2 className="text-lg font-bold mb-4">Demo Login</h2>
        <label className="block text-sm text-slate-300">User</label>
        <input className="w-full p-2 mb-3 rounded bg-slate-800 border border-slate-700" value={username} onChange={e => setUsername(e.target.value)} />
        <label className="block text-sm text-slate-300">Password</label>
        <input type="password" className="w-full p-2 mb-3 rounded bg-slate-800 border border-slate-700" value={password} onChange={e => setPassword(e.target.value)} />

        <label className="block text-sm text-slate-300">WSS URL</label>
        <input className="w-full p-2 mb-3 rounded bg-slate-800 border border-slate-700" value={wssUrl} onChange={e => setWssUrl(e.target.value)} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input id="devmode" type="checkbox" checked={devMode} onChange={() => setDevMode(!devMode)} />
            <label htmlFor="devmode" className="text-sm text-slate-300">Dev Mode</label>
          </div>
          <div>
            <button onClick={connect} className="px-4 py-2 bg-slate-700 rounded">Connect</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
