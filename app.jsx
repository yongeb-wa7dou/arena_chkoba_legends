import { useState, useEffect } from 'react'

// 1. DECK 40 CARTES TUNISIEN
const COULEURS = ['Carreau', 'Coeur', 'Trefle', 'Pique']
const VALEURS = {
  'As': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  'Valet': 8, 'Cavalier': 9, 'Roi': 10
}

function creerDeck() {
  const deck = []
  for (let couleur of COULEURS) {
    for (let [nom, valeur] of Object.entries(VALEURS)) {
      deck.push({
        id: `${nom}-${couleur}`,
        nom,
        valeur,
        couleur,
        isSeptCarreau: nom === '7' && couleur === 'Carreau'
      })
    }
  }
  return deck.sort(() => Math.random() - 0.5)
}

// 2. LOGIQUE PRISE CHKOBBA
function trouverPrises(carteJouee, table) {
  const prises = []

  // Règle 1: Prise simple obligatoire
  const priseSimple = table.filter(c => c.valeur === carteJouee.valeur)
  if (priseSimple.length > 0) {
    return [priseSimple[0]] // On prend qu'une seule carte identique
  }

  // Règle 2: Prise par addition - toutes les combinaisons possibles
  function combinaisons(arr, taille) {
    if (taille === 1) return arr.map(x => [x])
    const result = []
    arr.forEach((val, i) => {
      const reste = arr.slice(i + 1)
      combinaisons(reste, taille - 1).forEach(c => result.push([val,...c]))
    })
    return result
  }

  for (let i = 1; i <= table.length; i++) {
    for (let combo of combinaisons(table, i)) {
      const somme = combo.reduce((acc, c) => acc + c.valeur, 0)
      if (somme === carteJouee.valeur) {
        return combo // Première combinaison trouvée
      }
    }
  }

  return [] // Aucune prise
}

// 3. BOT 3AM SALAH
function jouerBot(mainBot, table) {
  const insultes = [
    "Ti chbik mrigel?",
    "Ouhh 3lik, mchouma hedhi",
    "Hedha l3ab walla chnowa?",
    "Ya weldi rak dhaya3t chkobba",
    "Bssahtek... t3allem tel3ab"
  ]

  // Bot essaie de faire chkobba d'abord
  for (let carte of mainBot) {
    const prise = trouverPrises(carte, table)
    const totalTable = table.reduce((acc, c) => acc + c.valeur, 0)
    if (prise.length > 0 && prise.reduce((acc, c) => acc + c.valeur, 0) === totalTable) {
      return { carte, prise, message: "CHKOBAAA ya m3allem!" }
    }
  }

  // Sinon il prend ce qu'il peut
  for (let carte of mainBot) {
    const prise = trouverPrises(carte, table)
    if (prise.length > 0) {
      return { carte, prise, message: insultes[Math.floor(Math.random() * insultes.length)] }
    }
  }

  // Sinon il pose la plus petite carte
  const carteMin = mainBot.reduce((min, c) => c.valeur < min.valeur? c : min)
  return { carte: carteMin, prise: [], message: "Haw nlawwah hedhi" }
}

// 4. COMPTAGE POINTS FIN DE MANCHE
function compterPoints(plisJoueur, plisBot, chkobbasJoueur, chkobbasBot) {
  let pointsJ = 0, pointsB = 0

  // Carti - plus de cartes
  if (plisJoueur.length > plisBot.length) pointsJ++
  else if (plisBot.length > plisJoueur.length) pointsB++

  // Denier - plus de Carreau
  const carreauJ = plisJoueur.filter(c => c.couleur === 'Carreau').length
  const carreauB = plisBot.filter(c => c.couleur === 'Carreau').length
  if (carreauJ > carreauB) pointsJ++
  else if (carreauB > carreauJ) pointsB++

  // Bermila - plus de 7, puis 6, puis 5...
  for (let val = 7; val >= 1; val--) {
    const septJ = plisJoueur.filter(c => c.valeur === val).length
    const septB = plisBot.filter(c => c.valeur === val).length
    if (septJ > septB) { pointsJ++; break }
    if (septB > septJ) { pointsB++; break }
  }

  // Hay - 7 de Carreau
  if (plisJoueur.some(c => c.isSeptCarreau)) pointsJ++
  if (plisBot.some(c => c.isSeptCarreau)) pointsB++

  // Chkobbas
  pointsJ += chkobbasJoueur
  pointsB += chkobbasBot

  return { pointsJ, pointsB }
}

export default function App() {
  const [gameState, setGameState] = useState('lobby') // lobby, jeu, finManche
  const [deck, setDeck] = useState([])
  const [mainJoueur, setMainJoueur] = useState([])
  const [mainBot, setMainBot] = useState([])
  const [table, setTable] = useState([])
  const [plisJoueur, setPlisJoueur] = useState([])
  const [plisBot, setPlisBot] = useState([])
  const [chkobbasJoueur, setChkobbasJoueur] = useState(0)
  const [chkobbasBot, setChkobbasBot] = useState(0)
  const [scoreTotal, setScoreTotal] = useState({ joueur: 0, bot: 0 })
  const [tourJoueur, setTourJoueur] = useState(true)
  const [message, setMessage] = useState("")
  const [dernierPlis, setDernierPlis] = useState('joueur') // Qui prend le reste à la fin

  const demarrerPartie = () => {
    const nouveauDeck = creerDeck()
    const mainJ = nouveauDeck.splice(0, 3)
    const mainB = nouveauDeck.splice(0, 3)
    const tableInit = nouveauDeck.splice(0, 4)

    setDeck(nouveauDeck)
    setMainJoueur(mainJ)
    setMainBot(mainB)
    setTable(tableInit)
    setPlisJoueur([])
    setPlisBot([])
    setChkobbasJoueur(0)
    setChkobbasBot(0)
    setTourJoueur(true)
    setGameState('jeu')
    setMessage("Yalla, ebda ya bطل")
  }

  const jouerCarte = (carte) => {
    if (!tourJoueur || gameState!== 'jeu') return

    const prise = trouverPrises(carte, table)
    const nouvelleMainJ = mainJoueur.filter(c => c.id!== carte.id)
    let nouvelleTable = [...table]
    let nouveauxPlisJ = [...plisJoueur, carte]
    let chkobba = false

    if (prise.length > 0) {
      // On prend les cartes
      prise.forEach(c => {
        nouvelleTable = nouvelleTable.filter(t => t.id!== c.id)
        nouveauxPlisJ.push(c)
      })
      setDernierPlis('joueur')

      // Check CHKOBBA
      if (nouvelleTable.length === 0 && deck.length > 0) {
        chkobba = true
        setChkobbasJoueur(c => c + 1)
        setMessage("CHKOBAAA! +1 point ya m3allem 🔥")
      } else {
        setMessage(`Mrigel, khdhit ${prise.length} carte`)
      }
    } else {
      // On pose la carte
      nouvelleTable.push(carte)
      setMessage("Ma famech prise, nlawwah")
    }

    setMainJoueur(nouvelleMainJ)
    setTable(nouvelleTable)
    setPlisJoueur(nouveauxPlisJ)
    setTourJoueur(false)

    // Tour du bot après 1s
    setTimeout(() => tourBot(nouvelleMainJ, nouvelleTable, nouveauxPlisJ), 1000)
  }

  const tourBot = (mainJActuelle, tableActuelle, plisJActuels) => {
    const { carte, prise, message: msgBot } = jouerBot(mainBot, tableActuelle)
    const nouvelleMainB = mainBot.filter(c => c.id!== carte.id)
    let nouvelleTable = [...tableActuelle]
    let nouveauxPlisB = [...plisBot, carte]

    if (prise.length > 0) {
      prise.forEach(c => {
        nouvelleTable = nouvelleTable.filter(t => t.id!== c.id)
        nouveauxPlisB.push(c)
      })
      setDernierPlis('bot')

      if (nouvelleTable.length === 0 && deck.length > 0) {
        setChkobbasBot(c => c + 1)
        setMessage("3am Salah: CHKOBAAA! T3allem tel3ab 😎")
      } else {
        setMessage(`3am Salah: ${msgBot}`)
      }
    } else {
      nouvelleTable.push(carte)
      setMessage(`3am Salah: ${msgBot}`)
    }

    setMainBot(nouvelleMainB)
    setTable(nouvelleTable)
    setPlisBot(nouveauxPlisB)

    // Redistribuer si mains vides
    if (mainJActuelle.length === 0 && nouvelleMainB.length === 0 && deck.length > 0) {
      setTimeout(() => redistribuer(), 1500)
    } else if (deck.length === 0 && mainJActuelle.length === 0 && nouvelleMainB.length === 0) {
      setTimeout(() => finDeManche(nouvelleTable, plisJActuels, nouveauxPlisB), 1500)
    } else {
      setTourJoueur(true)
    }
  }

  const redistribuer = () => {
    const nouveauDeck = [...deck]
    const mainJ = nouveauDeck.splice(0, 3)
    const mainB = nouveauDeck.splice(0, 3)
    setDeck(nouveauDeck)
    setMainJoueur(mainJ)
    setMainBot(mainB)
    setTourJoueur(true)
    setMessage("Carti jdod, nkammlou")
  }

  const finDeManche = (tableRestante, plisJFinal, plisBFinal) => {
    // Dernier qui a pris ramasse le reste
    if (dernierPlis === 'joueur') {
      plisJFinal.push(...tableRestante)
    } else {
      plisBFinal.push(...tableRestante)
    }

    const { pointsJ, pointsB } = compterPoints(plisJFinal, plisBFinal, chkobbasJoueur, chkobbasBot)
    const nouveauScore = {
      joueur: scoreTotal.joueur + pointsJ,
      bot: scoreTotal.bot + pointsB
    }

    setScoreTotal(nouveauScore)
    setGameState('finManche')

    if (nouveauScore.joueur >= 11) {
      setMessage(`MABROUK! Tghallabt 3al 3am Salah ${nouveauScore.joueur}-${nouveauScore.bot}`)
    } else if (nouveauScore.bot >= 11) {
      setMessage(`3am Salah rba7 ${nouveauScore.bot}-${nouveauScore.joueur}. Mara okhra nchallah`)
    } else {
      setMessage(`Manche: ${pointsJ}-${pointsB}. Total: ${nouveauScore.joueur}-${nouveauScore.bot}`)
    }
  }

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 text-white p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-green-800 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold">Ahmed</h2>
            <p className="text-yellow-400">{scoreTotal.joueur} ELO Bronze</p>
          </div>
          <h1 className="text-3xl font-bold mb-4">Rooms Arena</h1>
          <button
            onClick={demarrerPartie}
            className="w-full bg-gradient-to-r from-red-700 to-red-600 rounded-lg p-6 border-2 border-yellow-500 hover:scale-105 transition"
          >
            <div className="text-2xl font-bold">QAHWA</div>
            <div className="text-sm">Gratuit • Style Tunisien • Bot 3am Salah</div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-4 text-sm">
          <div>Toi: {scoreTotal.joueur} pts | Chkobbas: {chkobbasJoueur}</div>
          <div>3am Salah: {scoreTotal.bot} pts | Chkobbas: {chkobbasBot}</div>
        </div>

        <div className="bg-yellow-600 text-black p-2 rounded mb-4 text-center font-bold">
          {message}
        </div>

        <div className="bg-green-800 rounded-lg p-4 mb-4 min-h-32">
          <p className="text-xs mb-2">Table:</p>
          <div className="flex flex-wrap gap-2">
            {table.map(c => (
              <div key={c.id} className={`bg-white text-black p-2 rounded text-xs ${c.couleur === 'Carreau'? 'border-2 border-yellow-500' : ''}`}>
                {c.nom} {c.couleur === 'Carreau'? '♦' : c.couleur === 'Coeur'? '♥' : c.couleur === 'Trefle'? '♣' : '♠'}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-800 rounded-lg p-4">
          <p className="text-xs mb-2">Ta main:</p>
          <div className="flex gap-2">
            {mainJoueur.map(c => (
              <button
                key={c.id}
                onClick={() => jouerCarte(c)}
                disabled={!tourJoueur}
                className={`bg-white text-black p-3 rounded font-bold hover:scale-110 transition disabled:opacity-50 ${c.isSeptCarreau? 'border-4 border-yellow-400' : ''}`}
              >
                {c.nom}<br/>
                {c.couleur === 'Carreau'? '♦' : c.couleur === 'Coeur'? '♥' : c.couleur === 'Trefle'? '♣' : '♠'}
              </button>
            ))}
          </div>
        </div>

        {gameState === 'finManche' && (
          <button
            onClick={demarrerPartie}
            className="w-full mt-4 bg-red-600 p-4 rounded-lg font-bold"
          >
            Manche Jdida
          </button>
        )}
      </div>
    </div>
  )
}