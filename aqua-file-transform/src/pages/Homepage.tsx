// src/pages/Home.tsx
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    console.log('Home component loaded');
  }, []);

  return (
    <iframe
      src="homepage.html"
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="Página Home"
    />
  );
}