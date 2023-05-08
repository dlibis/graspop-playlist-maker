import { useRef } from 'react';

import { apiUrl } from '@/constants';

const Festivals = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const headers = new Headers({
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      });
      const res = await fetch(
        `${apiUrl}/proxy/https://www.musicfestivalwizard.com/festivals/graspop-metal-meeting-2023/`,
      );
      const text = await res.text();
      console.log(text);
      //   const parser = new DOMParser();
      //   const { documentElement } = parser.parseFromString(text, "text/html");
      //   const link = (
      //     documentElement.querySelector(".summary")
      //       ?.children[0] as HTMLAnchorElement
      //   ).pathname;
      //   const res2 = await fetch(
      //     `${api_url}/proxy/https://www.songkick.com${link}`
      //   );
      //   const text2 = await res2.text();
      //   console.log(text2);
    } catch (e: any) {
      console.log(e);
    }
  };
  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input className="input" ref={inputRef} placeholder="write festival name" />
        <button type="submit" className="btn">
          submit
        </button>
      </form>
    </div>
  );
};
export default Festivals;
