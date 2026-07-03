'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App'), { ssr: false });

export const ClientOnly = () => {
  return <App />;
}
