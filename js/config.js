// Game Configuration
const CONFIG = {
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight - 150,
    fps: 60,
    
    // Supabase Configuration
    supabase: {
        url: 'https://mlsibwihfzehqcdawrdh.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sc2lid2loZnplaHFjZGF3cmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTcwNTEsImV4cCI6MjEwMzY5MzA1MX0.faKWNZqTLE6nEH6nPw0L4uFepTy6ZvqrZDy2BaHcWxs'
    },
    
    // Game Settings
    gameDuration: 300, // 5 minutes in seconds
    spawnRate: 3000, // milliseconds
    
    // Assets URLs (Free from online sources)
    assets: {
        trees: [
            'https://opengameart.org/sites/default/files/tree_0.png',
            'https://opengameart.org/sites/default/files/tree_1.png'
        ],
        ground: 'https://opengameart.org/sites/default/files/grass_tile.png',
        river: 'https://opengameart.org/sites/default/files/water_tile.png'
    }
};

// Database Tables
const DB_TABLES = { 
    players: 'fh_players', 
    hunts: 'fh_hunts', 
    weapons: 'fh_weapons_found', 
    leaderboard: 'fh_leaderboard' 
};