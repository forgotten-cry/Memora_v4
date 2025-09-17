import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import PlayIcon from '../icons/PlayIcon';
import PauseIcon from '../icons/PauseIcon';
import NextIcon from '../icons/NextIcon';
import PreviousIcon from '../icons/PreviousIcon';

interface MusicTherapyProps {
  onBack: () => void;
}

const playlist = [
  {
    title: 'Relaxing Piano',
    artist: 'Ashot Danielyan',
    // Source: Royalty-free music from Internet Archive
    audioSrc: 'https://archive.org/download/ashot-danielyan-composition-relaxing-piano-music/relaxing-piano-music.mp3',
    albumArtSrc: 'https://images.unsplash.com/photo-1597813594218-cde4a4843918?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Ambient Classical Guitar',
    artist: 'William King',
    // Source: Royalty-free music from Internet Archive
    audioSrc: 'https://archive.org/download/ambient-classical-guitar/ambient-classical-guitar.mp3',
    albumArtSrc: 'https://images.unsplash.com/photo-1510915361894-db8b60106945?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Forest Lullaby',
    artist: 'Lesfm',
     // Source: Royalty-free music from Internet Archive
    audioSrc: 'https://archive.org/download/lesfm-forest-lullaby/lesfm-forest-lullaby.mp3',
    albumArtSrc: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
  }
];

const MusicTherapy: React.FC<MusicTherapyProps> = ({ onBack }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
    };

    const updateCurrentTime = () => {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', updateCurrentTime);

    // If we change the track source, and it was playing, start the new track
    if (isPlaying) {
        audio.play().catch(e => console.error("Error playing audio:", e));
    }

    return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', updateCurrentTime);
    };
  }, [currentTrackIndex, isPlaying]);
  
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };
  
  const handlePrevious = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
    }
  };

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    const audio = audioRef.current;
    if (!progressBar || !audio || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audio.currentTime = newTime;
  };
  
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-[95vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col justify-between border border-slate-700/50">
        {/* Background */}
        <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${currentTrack.albumArtSrc})` }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-2xl"></div>
        </div>
        
        <header className="relative p-4 flex justify-between items-center bg-black/30 backdrop-blur-sm z-10">
            <button onClick={onBack} className="text-white text-sm p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1">
                <span className='text-lg'>&larr;</span> Back
            </button>
            <h2 className="text-white text-lg font-bold">Music Therapy</h2>
            <div/>
        </header>

        <main className="relative flex-grow flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <img 
                    src={currentTrack.albumArtSrc} 
                    alt="Album Art" 
                    className="w-full aspect-square rounded-2xl shadow-2xl object-cover mb-6"
                />
                <div className="text-center">
                    <h3 className="text-3xl font-bold text-white">{currentTrack.title}</h3>
                    <p className="text-lg text-slate-300">{currentTrack.artist}</p>
                </div>
            </div>
        </main>
        
        <footer className="relative bg-black/30 backdrop-blur-sm p-4 z-10">
            <audio
              ref={audioRef}
              src={currentTrack.audioSrc}
              onEnded={handleNext} // Auto-play next song
              preload="auto"
            />
            
            <div className="w-full max-w-sm mx-auto">
                 {/* Progress Bar */}
                <div 
                    ref={progressBarRef}
                    onClick={handleProgressClick}
                    className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-2"
                >
                    <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Time Display */}
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-8 text-white">
                    <button onClick={handlePrevious} className="p-2 hover:bg-white/10 rounded-full transition-colors"><PreviousIcon className="w-8 h-8" /></button>
                    <button onClick={togglePlayPause} className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                        {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
                    </button>
                    <button onClick={handleNext} className="p-2 hover:bg-white/10 rounded-full transition-colors"><NextIcon className="w-8 h-8" /></button>
                </div>
            </div>
        </footer>
    </div>
  );
};

export default MusicTherapy;