// public/signUp.js
import { supabase } from './src/supabaseConfig.js';

document.getElementById('sign-up-google').addEventListener('click', async () => {
  const { user, session, error } = await supabase.auth.signIn({
    provider: 'google',
  });

  if (error) {
    console.error('Error signing up with Google:', error.message);
  } else {
    console.log('User signed up with Google:', user);
  }
});

document.getElementById('sign-up-apple').addEventListener('click', async () => {
  const { user, session, error } = await supabase.auth.signIn({
    provider: 'apple',
  });

  if (error) {
    console.error('Error signing up with Apple:', error.message);
  } else {
    console.log('User signed up with Apple:', user);
  }
});
