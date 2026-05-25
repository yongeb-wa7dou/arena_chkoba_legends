import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

const tg = window.Telegram.WebApp
tg.expand()

function App() {
  const [user, setUser] = useState({name: "Joueur", elo: 1000})
  const [game, setGame] = useState(null)

  useEffect(() => {
    tg.ready()
    if (tg.initDataUnsafe.user) {
      setUser({ name: tg.initDataUnsafe.user.first_name, elo: 1000 })
    }
  }, [])

  const joinQahwa = () => {
    setGame({
      table: ["7♦", "3♠", "V♥", "2♣"],
      hand: ["R♥", "6♦", "4♠"],
      score: {me: 0, opp: 0},
      turn: true
    })
    tg.HapticFeedback.impactOccurred('light')
  }

  if (!game) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-black/30 rounded-2xl p-4 mb-6">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-yellow-400">{user.elo} ELO Bronze</p>
        </div>
        <h2 className="text-2xl font-bold mb-4">Rooms Arena</h2>
        <div onClick={joinQahwa} className="bg-gradient-to-r from-red-900 to-orange-900 p-6 rounded-2xl border-2 border-yellow-600 active:scale-95">
          <h3 className="text-xl font-bold">QAHWA</h3>
          <p className="text-sm opacity-80">Gratuit • Style Tunisien</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2">
      <div className="bg-black/40 rounded-xl p-2 mb-2 flex justify-between text-sm">
        <span>Toi: {game.score.me}pts</span>
        <span className="font-bold text-yellow-400">TOUR</span>
        <span>Bot: {game.score.opp}pts</span>
      </div>
      <div className="bg-black/20 rounded-2xl p-4 min-h-[200px] mb-4">
        <p className="text-center text-xs mb-2">TABLE</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {game.table.map((c, i) => (
            <div key={i} className="bg-white text-black w-12 h-16 rounded-lg flex items-center justify-center font-bold shadow-lg">{c}</div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-4 left-0 right-0 px-4">
        <p className="text-center text-xs mb-2">TES CARTES</p>
        <div className="flex gap-2 justify-center">
          {game.hand.map((c, i) => (
            <div key={i} className="card bg-white text-black w-16 h-24 rounded-xl flex items-center justify-center font-bold text-lg shadow-2xl">{c}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)