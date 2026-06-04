// Assets/supabase-config.js

const SUPABASE_URL = 'https://tcoapwtktpimpfmpysjk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0XCVnQSFS6CrDCnzA8yC5Q_nSBbmliR';

function initSupabase() {
  if (typeof window.supabase === 'undefined') {
    setTimeout(initSupabase, 50);
    return;
  }

  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;

  window.SupabaseAuth = {
    async signUp(email, password) {
      return await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://alishapckg.github.io/AtopicHelperApp/'
        }
      });
    },
    async signIn(email, password) {
      return await supabaseClient.auth.signInWithPassword({ email, password });
    },
    async signOut() {
      return await supabaseClient.auth.signOut();
    },
    async getSession() {
      const { data, error } = await supabaseClient.auth.getSession();
      return { session: data.session, error };
    },
    onAuthStateChange(callback) {
      return supabaseClient.auth.onAuthStateChange(callback);
    }
  };

  window.SkinTracker = {
    async saveEntry(date, bodyAreas, symptoms, notes) {
      const { session } = await window.SupabaseAuth.getSession();
      if (!session) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient
        .from('skin_entries')
        .upsert({
          user_id: session.user.id,
          entry_date: date,
          body_areas: bodyAreas || [],
          symptoms: symptoms || {},
          notes: notes || {}
        }, { onConflict: 'user_id,entry_date' })
        .select()
        .single();

      return { data, error };
    },

    async getEntry(date) {
      const { session } = await window.SupabaseAuth.getSession();
      if (!session) throw new Error('User not authenticated');

      const { data, error } = await supabaseClient
        .from('skin_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('entry_date', date)
        .maybeSingle();

      return { data, error };
    }
  };

  console.log('✅ Supabase client initialized successfully');
}

initSupabase();
