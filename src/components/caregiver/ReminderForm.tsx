import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import localNotifications from '../../services/localNotifications';
import { Reminder } from '../../types';
import PillIcon from '../icons/PillIcon';
import ForkKnifeIcon from '../icons/ForkKnifeIcon';
import GlassWaterIcon from '../icons/GlassWaterIcon';


const ReminderForm: React.FC = () => {
    const { dispatch } = useAppContext();
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [icon, setIcon] = useState<'medication' | 'meal' | 'hydration'>('medication');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !time) {
            alert('Please fill out all fields.');
            return;
        }

        const newReminder: Reminder = {
            id: new Date().toISOString(),
            title,
            time,
            completed: false,
            icon,
            notified: false,
        };

        dispatch({ type: 'ADD_REMINDER', payload: newReminder });
        // Schedule native notification at creation time (web will use in-app timers)
        try {
            const [hoursStr, minutesStr] = time.split(':');
            const now = new Date();
            const scheduleAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hoursStr, 10), parseInt(minutesStr, 10));
            // If schedule time is in the past for today, schedule for tomorrow
            if (scheduleAt.getTime() <= Date.now()) {
                scheduleAt.setDate(scheduleAt.getDate() + 1);
            }
            // Only call the native scheduler when running on a native platform; on web we rely
            // on the in-app setTimeout scheduling implemented in App.tsx to trigger the notification
            // at the precise time.
            // Dynamic import to check runtime platform without making the handler async
            // (we don't need to await the result to continue UI flow)
            import('../../services/localNotifications').then(mod => {
                if (mod.isNative) {
                    localNotifications.schedule({ id: Date.now(), title: newReminder.title, body: `Reminder: ${newReminder.title}`, scheduleAt });
                }
            }).catch(() => {
                // ignore import errors - fallback to in-app timers
            });
        } catch (e) {
            console.warn('Failed to schedule local notification for reminder', e);
        }
        setTitle('');
        setTime('');
        setIcon('medication');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <input
                    type="text"
                    placeholder="Reminder Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                    <button type="button" onClick={() => setIcon('medication')} className={`p-2 rounded-lg transition-colors ${icon === 'medication' ? 'bg-slate-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}><PillIcon className="w-6 h-6"/></button>
                    <button type="button" onClick={() => setIcon('meal')} className={`p-2 rounded-lg transition-colors ${icon === 'meal' ? 'bg-slate-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}><ForkKnifeIcon className="w-6 h-6"/></button>
                    <button type="button" onClick={() => setIcon('hydration')} className={`p-2 rounded-lg transition-colors ${icon === 'hydration' ? 'bg-slate-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}><GlassWaterIcon className="w-6 h-6"/></button>
                </div>
                <button type="submit" className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500">
                    Add
                </button>
            </div>
        </form>
    );
}

export default ReminderForm;