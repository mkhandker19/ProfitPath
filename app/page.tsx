import NavBar from '../components/NavBar'
import FloatingWidget from '../components/FloatingWidget'
import QAModal from '../components/QAModal'
import Disclaimer from '../components/Disclaimer'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Top navigation bar */}
      <NavBar />

      {/* Hero Section */}
      <section className="container mx-auto pt-40 pb-16 px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
          ProfitPath
        </h1>
        <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
          Modern, sleek stock insights powered by Polygon — with AI explanations on demand.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <QAModal />
          <a
            href="https://polygon.io"
            target="_blank"
            rel="noopener noreferrer"
            className="glass px-5 py-2 rounded-xl hover:bg-white/15 transition"
          >
            Powered by Polygon
          </a>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="card p-6 text-left">
            <h3 className="text-lg font-semibold mb-2">Real Data</h3>
            <p className="opacity-80">
              Pulls real-time/aggregated data from Polygon via secure server routes.
            </p>
          </div>

          <div className="card p-6 text-left">
            <h3 className="text-lg font-semibold mb-2">AI Q&A</h3>
            <p className="opacity-80">
              Ask context questions like “why is this stock good to invest in?”
            </p>
          </div>

          <div className="card p-6 text-left">
            <h3 className="text-lg font-semibold mb-2">Sleek UI</h3>
            <p className="opacity-80">
              Glassmorphism, soft shadows, and a floating quick-lookup widget.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16">
          <Disclaimer />
        </div>
      </section>

      {/* Floating Widget */}
      <FloatingWidget />
    </main>
  )
}
