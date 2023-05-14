import { PropsWithChildren } from 'react';

import Head from 'next/head';

import Navbar from '@/components/Navbar';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Spotify Mixmaster</title>
        <meta
          name="description"
          content="Helper app for generating playlists without too much thinking"
        />
      </Head>
      <div className="container mx-auto  px-2">
        <Navbar />
        <main>{children}</main>
      </div>
    </>
  );
};
export default Layout;
