import MarketOverview from '@/components/MarketOverview';
import NewsFeed from '@/components/NewsFeed';

export default function HomeAfterLogin() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 grid gap-6 md:grid-cols-3 pt-20">
        {/* Left: Top Performing Stocks */}
        <section className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Top Performing Stocks</h2>
          <MarketOverview />
        </section>

        {/* Right: Latest Market News */}
        <aside className="md:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Latest Market News</h2>
          <NewsFeed />
        </aside>
      </div>
    </main>
  );
}
