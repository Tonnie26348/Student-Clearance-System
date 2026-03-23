import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Build Environment Check:', {
    hasUrl: !!env.VITE_SUPABASE_URL,
    hasKey: !!env.VITE_SUPABASE_ANON_KEY,
    mode
  });

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "src": path.resolve(__dirname, "./src"),
      },
    },
  }
})
