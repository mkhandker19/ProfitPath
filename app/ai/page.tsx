'use client'

import NavBar from '@/components/NavBar'
import QAModal from '@/components/QAModal'

export default function AiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <NavBar variant="app" />
      <div className="max-w-7xl mx-auto p-6 pt-20">
        <h2 className="text-2xl font-semibold mb-4">AI-Powered Q&A</h2>
        <QAModal />
      </div>
    </main>
  )
}
