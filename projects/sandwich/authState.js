// public/authState.js
import { supabase } from './src/supabaseConfig.js';

supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    console.log('User is logged in:', session.user);
    // Update your UI to reflect the user's login state
  } else {
    console.log('User is logged out');
    // Update your UI to reflect the user's logout state
  }
});
