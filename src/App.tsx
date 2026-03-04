import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, Music, Radio, Globe, Rocket, Newspaper, ChevronRight, ExternalLink, Settings, X, Plus, Film, Trophy, Baby, Lock, Key, Tag, Trash2, Search, Heart } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: string;
}

const DEFAULT_CATEGORIES = ['All', 'News', 'Movies', 'Sport', 'Kids', 'Music', 'Science', 'Nature', 'Relax'];

const INITIAL_CHANNELS: Channel[] = [
  { id: 'lofi-girl', name: 'Lofi Girl - Study/Sleep', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', icon: 'Music', category: 'Music' },
  { id: 'jazzhop', name: 'Coffee Shop Jazz', url: 'https://www.youtube.com/watch?v=lP26UCnoH9s', icon: 'Music', category: 'Music' },
  { id: 'synthwave', name: 'Synthwave Radio', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY', icon: 'Music', category: 'Music' },
  { id: 'nasa-tv', name: 'NASA TV Live', url: 'https://www.youtube.com/watch?v=21X5lGlDOfg', icon: 'Rocket', category: 'Science' },
  { id: 'iss-live', name: 'ISS Earth View', url: 'https://www.youtube.com/watch?v=jPTD2gnZFUw', icon: 'Globe', category: 'Science' },
  { id: 'tokyo-live', name: 'Tokyo Shibuya Crossing', url: 'https://www.youtube.com/watch?v=HpdO5Kq3o8Y', icon: 'Tv', category: 'Movies' },
  { id: 'nyc-live', name: 'Times Square NYC', url: 'https://www.youtube.com/watch?v=mRe-514tGMg', icon: 'Tv', category: 'Movies' },
  { id: 'dd-news', name: 'DD News Live', url: 'https://www.youtube.com/live/U_S4pI6_h3Y', icon: 'Newspaper', category: 'News' },
  { id: 'sansad-tv', name: 'Sansad TV Live', url: 'https://www.youtube.com/channel/UCv_vL8_S_Yv_mYy_S_Yv_mYy', icon: 'Newspaper', category: 'News' },
  { id: 'al-jazeera', name: 'Al Jazeera English', url: 'https://www.youtube.com/watch?v=gCneWUtz39k', icon: 'Newspaper', category: 'News' },
  { id: 'sky-news', name: 'Sky News Live', url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE', icon: 'Newspaper', category: 'News' },
  { id: 'kids-learning', name: 'Kids Learning Tube', url: 'https://www.youtube.com/watch?v=V_vL8_S_Yv_mYy', icon: 'Baby', category: 'Kids' },
  { id: 'sports-live', name: 'Sports Highlights', url: 'https://www.youtube.com/watch?v=V_vL8_S_Yv_mYy', icon: 'Trophy', category: 'Sport' },
  { id: 'nature-relax', name: 'Nature Relaxation', url: 'https://www.youtube.com/watch?v=nmY6f44nS1U', icon: 'Globe', category: 'Nature' },
  { id: 'underwater', name: 'Coral Reef Cam', url: 'https://www.youtube.com/watch?v=W0LHTWG-umQ', icon: 'Globe', category: 'Nature' },
  { id: 'meditation', name: 'Deep Meditation', url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4', icon: 'Radio', category: 'Relax' },
  { id: 'fireplace', name: 'Cozy Fireplace 24/7', url: 'https://www.youtube.com/watch?v=L_LUpnjgPso', icon: 'Tv', category: 'Relax' },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Music': return <Music className="w-4 h-4" />;
    case 'Rocket': return <Rocket className="w-4 h-4" />;
    case 'Globe': return <Globe className="w-4 h-4" />;
    case 'Tv': return <Tv className="w-4 h-4" />;
    case 'Newspaper': return <Newspaper className="w-4 h-4" />;
    case 'Film': return <Film className="w-4 h-4" />;
    case 'Trophy': return <Trophy className="w-4 h-4" />;
    case 'Baby': return <Baby className="w-4 h-4" />;
    case 'Radio': return <Radio className="w-4 h-4" />;
    default: return <Tv className="w-4 h-4" />;
  }
};

const parseYouTubeUrl = (url: string) => {
  if (!url) return '';
  let videoId = '';
  let channelId = '';

  if (url.includes('channel/')) {
    channelId = url.split('channel/')[1].split(/[?#]/)[0];
    return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  } else if (url.includes('/live/')) {
    videoId = url.split('/live/')[1].split(/[?#]/)[0];
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&loop=1&playlist=${videoId}&rel=0`;
  }
  return '';
};

export default function App() {
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('aether_channels');
    return saved ? JSON.parse(saved) : INITIAL_CHANNELS;
  });
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('aether_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [adminPhoto, setAdminPhoto] = useState(() => {
    return localStorage.getItem('aether_admin_photo') || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentChannel, setCurrentChannel] = useState<Channel>(channels[0]);
  const [isSticky, setIsSticky] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('aether_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveToast, setShowSaveToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authForm, setAuthForm] = useState({ id: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  const [newChannel, setNewChannel] = useState({ name: '', url: '', category: 'News' });
  const [newCategoryName, setNewCategoryName] = useState('');

  const playerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    localStorage.setItem('aether_channels', JSON.stringify(channels));
    localStorage.setItem('aether_categories', JSON.stringify(categories));
    localStorage.setItem('aether_admin_photo', adminPhoto);
    localStorage.setItem('aether_favorites', JSON.stringify(favorites));
  }, [channels, categories, adminPhoto, favorites]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (playerRef.current) observerRef.current.observe(playerRef.current);
    return () => observerRef.current?.disconnect();
  }, []);

  const handleChannelSelect = (channel: Channel) => {
    if (channel.id === currentChannel.id) return;
    setIsLoading(true);
    setCurrentChannel(channel);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.id === 'admin' && authForm.password === '1234') {
      setIsAuthOpen(false);
      setIsSettingsOpen(true);
      setAuthForm({ id: '', password: '' });
      setAuthError('');
    } else {
      setAuthError('Invalid ID or Password');
    }
  };

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name || !newChannel.url) return;

    const id = `custom-${Date.now()}`;
    const iconMap: Record<string, string> = {
      'News': 'Newspaper', 'Movies': 'Film', 'Sport': 'Trophy', 'Kids': 'Baby',
      'Music': 'Music', 'Science': 'Rocket', 'Nature': 'Globe', 'Relax': 'Radio'
    };

    const channel: Channel = {
      id,
      name: newChannel.name,
      url: newChannel.url,
      category: newChannel.category,
      icon: iconMap[newChannel.category] || 'Tv'
    };

    setChannels([...channels, channel]);
    setNewChannel({ name: '', url: '', category: categories[1] || 'News' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || categories.includes(newCategoryName)) return;
    setCategories([...categories, newCategoryName]);
    setNewCategoryName('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    localStorage.setItem('aether_channels', JSON.stringify(channels));
    localStorage.setItem('aether_categories', JSON.stringify(categories));
    localStorage.setItem('aether_admin_photo', adminPhoto);
    localStorage.setItem('aether_favorites', JSON.stringify(favorites));
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleDeleteChannel = (id: string) => {
    setChannels(channels.filter(c => c.id !== id));
  };

  const handleDeleteCategory = (cat: string) => {
    if (cat === 'All') return;
    setCategories(categories.filter(c => c !== cat));
    setChannels(channels.map(c => c.category === cat ? { ...c, category: 'Relax' } : c));
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filteredChannels = channels.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const embedUrl = parseYouTubeUrl(currentChannel.url);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-hidden flex-1">
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setIsAuthOpen(true)} className="relative group focus:outline-none">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-pink to-neon-cyan p-[2px] overflow-hidden">
                  <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                    {adminPhoto ? (
                      <img src={adminPhoto} alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Play className="w-5 h-5 text-neon-cyan fill-neon-cyan ml-0.5" />
                    )}
                  </div>
                </div>
              </button>
              <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent hidden sm:block">
                NkTvSetup
              </h1>
            </div>

            <div className="relative hidden md:block max-w-xs w-full">
              <Search className="absolute left-3 top-2 w-4 h-4 text-white/20" />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <nav className="flex items-center gap-2 overflow-x-auto pb-2 category-nav">
              {categories.map(cat => (
                <button
                  key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === cat ? 'bg-neon-cyan text-[#0a0a0f]' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsFavoritesOpen(true)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-neon-pink hover:bg-neon-pink/10 transition-colors relative"
              title="Favorites"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-neon-pink' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
            <div className="md:hidden">
              <button onClick={() => setIsAuthOpen(true)} className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 md:px-8 lg:pr-0 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div ref={playerRef} className="relative aspect-video w-full">
            <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
               <Tv className="w-16 h-16 opacity-20" />
            </div>
            <div className={`transition-all duration-500 ${isSticky ? 'fixed bottom-6 right-6 w-[320px] md:w-[400px] z-[100]' : 'absolute inset-0 w-full h-full z-10'}`}>
              <div className={`relative w-full h-full rounded-2xl overflow-hidden glass ${isSticky ? 'neon-border-cyan' : 'border border-white/10'}`}>
                <AnimatePresence mode="wait">
                  {isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-[#0a0a0f] flex items-center justify-center"><div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin"></div></motion.div>}
                </AnimatePresence>
                {embedUrl ? <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={currentChannel.name}></iframe> : <div className="w-full h-full flex items-center justify-center text-white">Signal Lost</div>}
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={currentChannel.id} className="glass rounded-2xl p-4 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 flex items-center justify-center border border-white/10">{getIcon(currentChannel.icon)}</div>
                <div>
                  <h2 className="text-lg font-bold text-white">{currentChannel.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] font-mono text-neon-cyan uppercase">{currentChannel.category}</span><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span><span className="text-[10px] text-white/40">LIVE</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleFavorite(currentChannel.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${favorites.includes(currentChannel.id) ? 'bg-neon-pink/20 border-neon-pink text-neon-pink' : 'bg-white/5 border-white/10 text-white/40 hover:text-neon-pink'}`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(currentChannel.id) ? 'fill-neon-pink' : ''}`} />
                </button>
                <button className="px-4 py-1.5 rounded-lg bg-neon-pink text-white text-xs font-semibold">Subscribe</button>
                <a href={currentChannel.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/5 border border-white/10"><ExternalLink className="w-4 h-4 text-white/60" /></a>
              </div>
            </div>
          </motion.div>
        </div>

        <aside className="lg:col-span-4 flex flex-col">
          <div className="glass rounded-l-2xl lg:rounded-r-none border border-white/10 flex flex-col h-[600px] lg:h-[calc(100vh-6rem)] sticky top-20">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Radio className="w-5 h-5 text-neon-pink" /> {selectedCategory === 'All' ? 'Stream Sanctuary' : `${selectedCategory} Channels`}</h3>
              <p className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-widest">{filteredChannels.length} channels online</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {filteredChannels.map((channel) => (
                <button key={channel.id} onClick={() => handleChannelSelect(channel)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentChannel.id === channel.id ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan' : 'hover:bg-white/5 border border-transparent text-white/60'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentChannel.id === channel.id ? 'bg-neon-cyan/20' : 'bg-white/5'}`}>{getIcon(channel.icon)}</div>
                  <span className="flex-1 text-left text-sm font-medium truncate">{channel.name}</span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between text-[10px] font-mono text-white/30 uppercase"><span>Network Status</span><span className="text-emerald-500">Optimal</span></div>
          </div>
        </aside>
      </main>

      <footer className="mt-auto glass border-t border-white/10 py-4 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-neon-pink to-neon-cyan p-[1px]"><div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center"><Play className="w-2.5 h-2.5 text-neon-cyan" /></div></div>
              <span className="font-bold tracking-tighter text-white text-sm">NkTvSetup</span>
            </div>
            <p className="text-[10px] text-white/30">© {new Date().getFullYear()} NkTvSetup. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-medium text-white/30">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan">Powered by YouTube</a>
            <span className="hover:text-neon-pink cursor-pointer">Privacy</span>
            <span className="hover:text-neon-pink cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isFavoritesOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFavoritesOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md glass rounded-3xl border border-white/10 p-6 shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Heart className="w-5 h-5 text-neon-pink fill-neon-pink" /> My Favorites</h2>
                <button onClick={() => setIsFavoritesOpen(false)} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {favorites.length > 0 ? favorites.map(favId => {
                  const channel = channels.find(c => c.id === favId);
                  if (!channel) return null;
                  return (
                    <div key={favId} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 group">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{getIcon(channel.icon)}</div>
                      <button onClick={() => { handleChannelSelect(channel); setIsFavoritesOpen(false); }} className="flex-1 text-left text-sm font-medium text-white/80 hover:text-neon-cyan truncate">{channel.name}</button>
                      <button onClick={() => toggleFavorite(favId)} className="p-1.5 text-neon-pink hover:bg-neon-pink/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  );
                }) : <div className="flex flex-col items-center justify-center py-12 opacity-20 gap-4"><Heart className="w-12 h-12" /><p className="text-xs font-mono">NO FAVORITES YET</p></div>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAuthOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm glass rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-neon-pink/10 flex items-center justify-center border border-neon-pink/20"><Lock className="w-8 h-8 text-neon-pink" /></div>
                <h2 className="text-xl font-bold text-white">Security Check</h2>
              </div>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <input type="text" value={authForm.id} onChange={e => setAuthForm({...authForm, id: e.target.value})} placeholder="Admin ID" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                <input type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white" />
                {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
                <button type="submit" className="w-full py-3 rounded-xl bg-neon-pink text-white font-bold">Unlock Settings</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl glass rounded-3xl border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-md z-10 py-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Settings className="w-6 h-6 text-neon-cyan" /> Control Center</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-neon-cyan uppercase tracking-widest">Add Channel</h3>
                  <form onSubmit={handleAddChannel} className="space-y-4">
                    <input type="text" value={newChannel.name} onChange={e => setNewChannel({...newChannel, name: e.target.value})} placeholder="Channel Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                    <input type="text" value={newChannel.url} onChange={e => setNewChannel({...newChannel, url: e.target.value})} placeholder="YouTube Link" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                    <select value={newChannel.category} onChange={e => setNewChannel({...newChannel, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm appearance-none">
                      {categories.filter(c => c !== 'All').map(cat => <option key={cat} value={cat} className="bg-[#0a0a0f]">{cat}</option>)}
                    </select>
                    <button type="submit" className="w-full py-3 rounded-xl bg-neon-cyan text-[#0a0a0f] font-bold">Add Channel</button>
                  </form>
                </div>
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-neon-pink uppercase tracking-widest">Add Category</h3>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Category Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                    <button type="submit" className="w-full py-3 rounded-xl bg-neon-pink text-white font-bold">Add Category</button>
                  </form>
                  <div className="pt-4">
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-2">Admin Photo</label>
                    <div className="flex gap-2 mb-4">
                      <input type="text" value={adminPhoto} onChange={e => setAdminPhoto(e.target.value)} placeholder="Image URL" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"><Plus className="w-5 h-5 text-neon-pink" /></button>
                    </div>
                    <button onClick={handleSaveChanges} className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 mb-6"><Settings className="w-5 h-5" /> Save All Changes</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-emerald-500 text-white font-bold shadow-2xl flex items-center gap-2">
            Changes Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
