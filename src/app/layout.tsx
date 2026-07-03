import type { Metadata } from 'next';

import './index.css';

export const metadata: Metadata = {
  title: 'Random Pokémon Generator',
  description: 'Web tool to generate random lists of Pokémon according to a variety of filters'
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
