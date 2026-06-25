import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import StudioBar from '@/components/StudioBar';
import Work from '@/components/Work';
import ReelBreak from '@/components/ReelBreak';
import Flash from '@/components/Flash';
import Create from '@/components/Create';
import Artist from '@/components/Artist';
import Faq from '@/components/Faq';
import Book from '@/components/Book';
import Footer from '@/components/Footer';
import LightboxProvider from '@/components/Lightbox';
import { REEL } from '@/lib/data';

export default function Page() {
  return (
    <>
      <div id="nav-sentinel" aria-hidden="true" className="absolute left-0 top-0 h-px w-full" />
      <Nav />
      <LightboxProvider>
        {/* the exposed broadsheet frame: vertical rules down the page */}
        <div className="frame">
          <main>
            <Hero />
            <Marquee />
            <StudioBar />
            <Work />
            <ReelBreak reel={REEL[0]} index={0} />
            <Flash />
            <Create />
            <ReelBreak reel={REEL[1]} index={1} />
            <Artist />
            <Faq />
            <ReelBreak reel={REEL[2]} index={2} />
            <Book />
          </main>
          <Footer />
        </div>
      </LightboxProvider>
    </>
  );
}
