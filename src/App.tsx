import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, Music, Radio, Globe, Rocket, Newspaper, ChevronRight, ExternalLink, Settings, X, Plus, Film, Trophy, Baby, Lock, Key, Tag, Trash2, Search, Heart, Wand2, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

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
    case 'Wand2': return <Wand2 className="w-4 h-4" />;
    default: return <Tv className="w-4 h-4" />;
  }
};

const parseYouTubeUrl = (url: string) => {
  if (!url) return '';
  let videoId = '';
  let playlistId = '';
  
  if (url.includes('list=')) {
    playlistId = url.split('list=')[1].split(/[&?#]/)[0];
  }
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  } else if (url.includes('/live/')) {
    videoId = url.split('/live/')[1].split(/[?#]/)[0];
  }

  if (playlistId && videoId) {
    return `https://www.youtube.com/embed/${videoId}?list=${playlistId}&autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`;
  } else if (playlistId) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`;
  } else if (videoId) {
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['All']);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('aether_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveToast, setShowSaveToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authForm, setAuthForm] = useState({ id: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  // New Channel Form State
  const [newChannel, setNewChannel] = useState({ name: '', url: '', category: 'News' });
  // New Category Form State
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

  useEffect(() => {
    if (isAuthOpen) {
      setAuthForm({ id: '', password: '' });
      setAuthError('');
    }
  }, [isAuthOpen]);

  const handleChannelSelect = (channel: Channel) => {
    if (channel.id === currentChannel.id) return;
    setIsLoading(true);
    setCurrentChannel(channel);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded for demo: admin / 1234
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
    const isPlaylist = newChannel.url.includes('list=');
    
    const iconMap: Record<string, string> = {
      'News': 'Newspaper',
      'Movies': 'Film',
      'Sport': 'Trophy',
      'Kids': 'Baby',
      'Music': 'Music',
      'Science': 'Rocket',
      'Nature': 'Globe',
      'Relax': 'Radio'
    };

    const channel: Channel = {
      id,
      name: newChannel.name,
      url: newChannel.url,
      category: isPlaylist ? 'Playlists' : newChannel.category,
      icon: isPlaylist ? 'Wand2' : (iconMap[newChannel.category] || 'Tv')
    };

    if (isPlaylist && !categories.includes('Playlists')) {
      setCategories([...categories, 'Playlists']);
    }

    setChannels([...channels, channel]);
    setNewChannel({ name: '', url: '', category: categories[1] || 'News' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || categories.includes(newCategoryName)) return;
    setCategories([...categories, newCategoryName]);
    setNewCategoryName('');
  };

  const handleExpandPlaylist = async (channel: Channel) => {
    if (!channel.url.includes('list=')) return;
    setIsExpanding(channel.id);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I have a YouTube playlist URL: ${channel.url}. 
        Please find the list of videos in this playlist. 
        For each video, I need the 'title' and the 'youtube_video_id'.
        Return the result ONLY as a valid JSON array of objects.
        Example: [{"title": "Episode 1", "id": "abcd123"}, ...]
        If you cannot find the exact list, try to find the most recent episodes for this show/playlist name: "${channel.name}".`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      const episodes = JSON.parse(text);
      
      if (!Array.isArray(episodes)) throw new Error("Invalid response format");

      const newEpisodes: Channel[] = episodes.map((ep: any, index: number) => ({
        id: `ep-${Date.now()}-${index}`,
        name: ep.title,
        url: `https://www.youtube.com/watch?v=${ep.id}`,
        category: channel.name,
        icon: 'Tv'
      }));

      if (!categories.includes(channel.name)) {
        setCategories([...categories, channel.name]);
      }
      setChannels([...channels, ...newEpisodes]);
      setExpandedCategories(prev => [...prev, channel.name]);
      setShowSaveToast(true);
    } catch (error) {
      console.error("Expansion failed:", error);
      alert("AI could not fetch the playlist details. Please try again or add episodes manually.");
    } finally {
      setIsExpanding(null);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
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
    // Optionally move channels to 'All' or another category
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
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-hidden flex-1">
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="relative group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-pink to-neon-cyan p-[2px] overflow-hidden">
                  <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                    {adminPhoto ? (
                      <img src={adminPhoto} alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Play className="w-5 h-5 text-neon-cyan fill-neon-cyan ml-0.5" />
                    )}
                  </div>
                </div>
                <div className="absolute -inset-1 bg-neon-pink/20 blur-lg rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent hidden sm:block">
                NkTvSetup
              </h1>
            </div>

            {/* Search Bar */}
            <div className="relative hidden md:block max-w-xs w-full">
              <Search className="absolute left-3 top-2 w-4 h-4 text-white/20" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-neon-cyan transition-colors"
              />
            </div>

            {/* Categories with custom scrollbar */}
            <nav className="flex items-center gap-2 overflow-x-auto pb-2 category-nav">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === cat 
                    ? 'bg-neon-cyan text-[#0a0a0f] shadow-[0_0_10px_rgba(0,242,255,0.5)]' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
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
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm glass rounded-3xl border border-white/10 p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-neon-pink/10 flex items-center justify-center border border-neon-pink/20">
                  <Lock className="w-8 h-8 text-neon-pink" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">Security Check</h2>
                  <p className="text-xs text-white/40 mt-1">Enter credentials to access settings</p>
                </div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/20" />
                  <input 
                    type="text" 
                    value={authForm.id}
                    onChange={e => setAuthForm({...authForm, id: e.target.value})}
                    placeholder="Admin ID"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-neon-pink transition-colors"
                  />
                </div>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 w-4 h-4 text-white/20" />
                  <input 
                    type="password" 
                    value={authForm.password}
                    onChange={e => setAuthForm({...authForm, password: e.target.value})}
                    placeholder="Password"
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-neon-pink transition-colors"
                  />
                </div>
                {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-neon-pink text-white font-bold shadow-lg hover:bg-neon-pink/80 transition-all"
                >
                  Unlock Settings
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl glass rounded-3xl border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-md z-10 py-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Settings className="w-6 h-6 text-neon-cyan" />
                  Control Center
                </h2>
                <button onClick={() => setIsSettingsOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Channel Section */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-neon-cyan flex items-center gap-2 uppercase tracking-widest">
                    <Plus className="w-4 h-4" /> Add Channel
                  </h3>
                  <form onSubmit={handleAddChannel} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-2">Name</label>
                      <input 
                        type="text" 
                        value={newChannel.name}
                        onChange={e => setNewChannel({...newChannel, name: e.target.value})}
                        placeholder="Channel Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-2">URL</label>
                      <input 
                        type="text" 
                        value={newChannel.url}
                        onChange={e => setNewChannel({...newChannel, url: e.target.value})}
                        placeholder="YouTube Link"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-2">Category</label>
                      <select 
                        value={newChannel.category}
                        onChange={e => setNewChannel({...newChannel, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neon-cyan transition-colors appearance-none"
                      >
                        {categories.filter(c => c !== 'All').map(cat => (
                          <option key={cat} value={cat} className="bg-[#0a0a0f]">{cat}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-3 rounded-xl bg-neon-cyan text-[#0a0a0f] font-bold shadow-lg hover:scale-[1.02] transition-all"
                    >
                      Add Channel
                    </button>
                  </form>

                  <div className="pt-6">
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-4">Manage Channels</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {channels.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10">
                          <span className="text-xs text-white/60 truncate flex-1 mr-2">{c.name}</span>
                          <div className="flex items-center gap-1">
                            {c.url.includes('list=') && (
                              <button 
                                onClick={() => handleExpandPlaylist(c)}
                                disabled={isExpanding === c.id}
                                title="Expand Playlist Episodes"
                                className="p-1.5 rounded hover:bg-neon-cyan/20 text-neon-cyan transition-colors disabled:opacity-50"
                              >
                                {isExpanding === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteChannel(c.id)}
                              className="p-1.5 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Category Section */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-neon-pink flex items-center gap-2 uppercase tracking-widest">
                    <Tag className="w-4 h-4" /> Add Category
                  </h3>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-white/40 uppercase mb-2">Category Name</label>
                      <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Documentary"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neon-pink transition-colors"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-3 rounded-xl bg-neon-pink text-white font-bold shadow-lg hover:scale-[1.02] transition-all"
                    >
                      Add Category
                    </button>
                  </form>

                  <div className="pt-4">
                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-2">Admin Photo</label>
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        value={adminPhoto}
                        onChange={e => setAdminPhoto(e.target.value)}
                        placeholder="Image URL"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neon-pink transition-colors"
                      />
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        title="Upload from computer"
                      >
                        <Plus className="w-5 h-5 text-neon-pink" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={handleSaveChanges}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mb-6"
                    >
                      <Settings className="w-5 h-5" />
                      Save All Changes
                    </button>

                    <label className="block text-[10px] font-mono text-white/40 uppercase mb-2">Current Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <div key={cat} className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
                          {cat}
                          {cat !== 'All' && (
                            <button 
                              onClick={() => handleDeleteCategory(cat)}
                              className="hover:text-red-500"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 md:px-8 lg:pr-0 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Player Section */}
        <div className="lg:col-span-8 space-y-4">
          <div ref={playerRef} className="relative aspect-video w-full">
            <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
               <div className="flex flex-col items-center gap-4 opacity-20">
                 <Tv className="w-16 h-16" />
                 <p className="text-sm font-mono">PLAYER ACTIVE IN PIP MODE</p>
               </div>
            </div>

            <div className={`
              transition-all duration-500 ease-in-out
              ${isSticky 
                ? 'fixed bottom-6 right-6 w-[320px] md:w-[400px] z-[100] shadow-2xl scale-100' 
                : 'absolute inset-0 w-full h-full z-10 scale-100'
              }
            `}>
              <div className={`
                relative w-full h-full rounded-2xl overflow-hidden glass
                ${isSticky ? 'neon-border-cyan' : 'border border-white/10 shadow-2xl'}
              `}>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-[#0a0a0f] flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin"></div>
                        <p className="text-xs font-mono text-neon-cyan animate-pulse">TUNING FREQUENCY...</p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={currentChannel.name}
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                      <Tv className="w-12 h-12 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Signal Lost</h3>
                      <p className="text-white/60 text-sm mt-1">This stream is currently unavailable or the URL is invalid.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {isSticky && (
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-neon-cyan text-[#0a0a0f] flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              )}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentChannel.id}
            className="glass rounded-2xl p-4 border border-white/10"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 flex items-center justify-center border border-white/10">
                  {getIcon(currentChannel.icon)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{currentChannel.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-wider">{currentChannel.category}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      LIVE
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleFavorite(currentChannel.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    favorites.includes(currentChannel.id)
                    ? 'bg-neon-pink/20 border-neon-pink text-neon-pink'
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-neon-pink'
                  }`}
                  title={favorites.includes(currentChannel.id) ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(currentChannel.id) ? 'fill-neon-pink' : ''}`} />
                </button>
                <button className="flex-1 md:flex-none px-4 py-1.5 rounded-lg bg-neon-pink text-white text-xs font-semibold hover:bg-neon-pink/80 transition-colors shadow-[0_0_15px_rgba(255,0,127,0.3)]">
                  Subscribe
                </button>
                <a 
                  href={currentChannel.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-white/60" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Section */}
        <aside className="lg:col-span-4 flex flex-col">
          <div className="glass rounded-l-2xl lg:rounded-r-none border border-white/10 flex flex-col h-[600px] lg:h-[calc(100vh-6rem)] sticky top-20">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-neon-pink" />
                {selectedCategory === 'All' ? 'Stream Sanctuary' : `${selectedCategory} Channels`}
              </h3>
              <p className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-widest">
                {filteredChannels.length} channels online
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {categories.filter(cat => selectedCategory === 'All' || cat === selectedCategory).map(cat => {
                const catChannels = channels.filter(c => c.category === cat && c.name.toLowerCase().includes(searchQuery.toLowerCase()));
                if (catChannels.length === 0) return null;
                
                const isExpanded = expandedCategories.includes(cat);
                
                return (
                  <div key={cat} className="space-y-2">
                    <button 
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-neon-cyan transition-colors">
                        {cat}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-white/20 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-1 pl-2"
                        >
                          {catChannels.map((channel) => (
                            <button 
                              key={channel.id} 
                              onClick={() => handleChannelSelect(channel)} 
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${currentChannel.id === channel.id ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan' : 'hover:bg-white/5 border border-transparent text-white/60'}`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${currentChannel.id === channel.id ? 'bg-neon-cyan/20' : 'bg-white/5'}`}>
                                {getIcon(channel.icon)}
                              </div>
                              <span className="flex-1 text-left text-xs font-medium truncate">{channel.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              
              {filteredChannels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 opacity-20 gap-4">
                  <Tv className="w-12 h-12" />
                  <p className="text-xs font-mono">NO CHANNELS FOUND</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest">
                <span>Network Status</span>
                <span className="text-emerald-500">Optimal</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="mt-auto glass border-t border-white/10 py-4 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-neon-pink to-neon-cyan p-[1px]">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-neon-cyan" />
                </div>
              </div>
              <span className="font-bold tracking-tighter text-white text-sm">NkTvSetup</span>
            </div>
            <p className="text-[10px] text-white/30">© {new Date().getFullYear()} NkTvSetup. All rights reserved.</p>
          </div>
          
          <div className="flex items-center gap-6 text-[10px] font-medium text-white/30">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">Powered by YouTube</a>
            <span className="hover:text-neon-pink cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-neon-pink cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>

      {/* Favorites Modal */}
      <AnimatePresence>
        {isFavoritesOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFavoritesOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass rounded-3xl border border-white/10 p-6 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-neon-pink fill-neon-pink" />
                  My Favorites
                </h2>
                <button onClick={() => setIsFavoritesOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {favorites.length > 0 ? (
                  favorites.map(favId => {
                    const channel = channels.find(c => c.id === favId);
                    if (!channel) return null;
                    return (
                      <div key={favId} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 group">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          {getIcon(channel.icon)}
                        </div>
                        <button 
                          onClick={() => {
                            handleChannelSelect(channel);
                            setIsFavoritesOpen(false);
                          }}
                          className="flex-1 text-left text-sm font-medium text-white/80 hover:text-neon-cyan truncate"
                        >
                          {channel.name}
                        </button>
                        <button 
                          onClick={() => toggleFavorite(favId)}
                          className="p-1.5 text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 opacity-20 gap-4">
                    <Heart className="w-12 h-12" />
                    <p className="text-xs font-mono">NO FAVORITES YET</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Toast */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-emerald-500 text-white font-bold shadow-2xl flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Changes Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
