// Supabase Integration
class SupabaseManager {
    constructor() {
        this.supabase = supabase.createClient(
            CONFIG.supabase.url,
            CONFIG.supabase.anonKey
        );
        this.initialized = false;
    }

    async init() {
        try {
            // Test connection
            const { data, error } = await this.supabase
                .from(DB_TABLES.players)
                .select('count')
                .limit(1);
            
            if (error) {
                console.log('Tables might not exist yet. Error:', error.message);
            }
            
            this.initialized = true;
            console.log('Supabase connected successfully');
        } catch (error) {
            console.error('Supabase connection error:', error);
        }
    }

    // Save player data
    async savePlayer(playerData) {
        try {
            const { data, error } = await this.supabase
                .from(DB_TABLES.players)
                .insert([playerData])
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving player:', error);
            return null;
        }
    }

    // Save hunt record
    async saveHunt(huntData) {
        try {
            const { data, error } = await this.supabase
                .from(DB_TABLES.hunts)
                .insert([huntData])
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving hunt:', error);
            return null;
        }
    }

    // Save found weapon
    async saveWeapon(weaponData) {
        try {
            const { data, error } = await this.supabase
                .from(DB_TABLES.weapons)
                .insert([weaponData])
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving weapon:', error);
            return null;
        }
    }

    // Get leaderboard
    async getLeaderboard(limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from(DB_TABLES.leaderboard)
                .select('*')
                .order('score', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }

    // Update or insert leaderboard
    async updateLeaderboard(playerId, score, playerName) {
        try {
            // Check if exists
            const { data: existing } = await this.supabase
                .from(DB_TABLES.leaderboard)
                .select('*')
                .eq('player_id', playerId)
                .single();

            if (existing) {
                // Update if new score is higher
                if (score > existing.score) {
                    const { data, error } = await this.supabase
                        .from(DB_TABLES.leaderboard)
                        .update({ score, updated_at: new Date() })
                        .eq('player_id', playerId)
                        .select();
                    
                    if (error) throw error;
                    return data;
                }
            } else {
                // Insert new
                const { data, error } = await this.supabase
                    .from(DB_TABLES.leaderboard)
                    .insert([{
                        player_id: playerId,
                        player_name: playerName,
                        score: score
                    }])
                    .select();
                
                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            return null;
        }
    }

    // Get player stats
    async getPlayerStats(playerId) {
        try {
            const { data, error } = await this.supabase
                .from(DB_TABLES.hunts)
                .select('*')
                .eq('player_id', playerId);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching player stats:', error);
            return [];
        }
    }
}

// Initialize Supabase
const supabaseManager = new SupabaseManager();