import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const supabaseUrl = config.public.supabaseUrl;
  const supabaseAnonKey = config.public.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is not defined in runtime config.');
    // Optionally, throw an error or handle this case more gracefully
    return {
      provide: {
        supabase: null
      }
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  return {
    provide: {
      supabase
    }
  };
});
