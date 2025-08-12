import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Conditionally import lovable-tagger only in development
const getComponentTagger = async () => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { componentTagger } = await import("lovable-tagger");
      return componentTagger();
    } catch (error) {
      console.warn("lovable-tagger not available, skipping component tagging");
      return null;
    }
  }
  return null;
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const componentTaggerPlugin = mode === 'development' ? await getComponentTagger() : null;
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      componentTaggerPlugin,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
