import { AmericanaPlayer, ClubCourt, AmericanaMatch, AmericanaRound, AmericanaPair } from '../types/americana';

// Utility Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface PairingHistory {
  partnerCounts: Record<string, Record<string, number>>;
  courtCounts: Record<string, Record<number, number>>;
}

/**
 * Builds history tracking from previous rounds to avoid repeats.
 */
export function buildHistoryFromRounds(rounds: AmericanaRound[]): PairingHistory {
  const partnerCounts: Record<string, Record<string, number>> = {};
  const courtCounts: Record<string, Record<number, number>> = {};

  const recordPartner = (idA: string, idB: string) => {
    if (!partnerCounts[idA]) partnerCounts[idA] = {};
    if (!partnerCounts[idB]) partnerCounts[idB] = {};
    partnerCounts[idA][idB] = (partnerCounts[idA][idB] || 0) + 1;
    partnerCounts[idB][idA] = (partnerCounts[idB][idA] || 0) + 1;
  };

  const recordCourt = (playerId: string, courtId: number) => {
    if (!courtCounts[playerId]) courtCounts[playerId] = {};
    courtCounts[playerId][courtId] = (courtCounts[playerId][courtId] || 0) + 1;
  };

  for (const round of rounds) {
    for (const match of round.matches) {
      // Team A partners
      recordPartner(match.teamA.playerReves.id, match.teamA.playerDerecha.id);
      recordCourt(match.teamA.playerReves.id, match.courtId);
      recordCourt(match.teamA.playerDerecha.id, match.courtId);

      // Team B partners
      recordPartner(match.teamB.playerReves.id, match.teamB.playerDerecha.id);
      recordCourt(match.teamB.playerReves.id, match.courtId);
      recordCourt(match.teamB.playerDerecha.id, match.courtId);
    }
  }

  return { partnerCounts, courtCounts };
}

/**
 * Generates an Americana round with smart position-based pairing and random court allocation.
 */
export function generateAmericanaRound(
  allPlayers: AmericanaPlayer[],
  allCourts: ClubCourt[],
  previousRounds: AmericanaRound[],
  roundNumber: number
): AmericanaRound {
  const activePlayers = allPlayers.filter(p => p.active);
  const activeCourts = allCourts.filter(c => c.active);

  if (activeCourts.length === 0) {
    throw new Error('Debes activar al menos 1 pista para jugar.');
  }

  const maxPlayableCourts = Math.floor(activePlayers.length / 4);
  const courtsToUseCount = Math.min(activeCourts.length, maxPlayableCourts);

  if (courtsToUseCount === 0) {
    throw new Error(`Se necesitan al menos 4 jugadores activos. Actualmente hay ${activePlayers.length}.`);
  }

  const totalPlayersInRound = courtsToUseCount * 4;

  // Fair rest selection: players who have rested the least rest first
  const sortedByRest = [...activePlayers].sort((a, b) => {
    if (a.restCount !== b.restCount) {
      return a.restCount - b.restCount; // lowest rest count first
    }
    return Math.random() - 0.5;
  });

  // The ones who will play this round (take those with highest restCount or fair rotation)
  // Actually, we want to REST the ones who have rested least so far.
  const restingCount = activePlayers.length - totalPlayersInRound;
  // Pick players with minimum rest count to take a rest
  const restingCandidates = [...activePlayers].sort((a, b) => a.restCount - b.restCount || Math.random() - 0.5);
  const restingPlayers = restingCandidates.slice(0, restingCount);
  const restingIds = new Set(restingPlayers.map(p => p.id));

  const playingPlayers = activePlayers.filter(p => !restingIds.has(p.id));

  // Build previous history
  const history = buildHistoryFromRounds(previousRounds);

  // Group playing players by preferred side
  const revesCandidates = shuffleArray(playingPlayers.filter(p => p.position === 'reves'));
  const derechaCandidates = shuffleArray(playingPlayers.filter(p => p.position === 'derecha'));
  const indiferenteCandidates = shuffleArray(playingPlayers.filter(p => p.position === 'indiferente'));

  // Target: We need exactly (courtsToUseCount * 2) pairs. Each pair needs 1 Reves and 1 Derecha.
  const totalPairsNeeded = courtsToUseCount * 2;

  const finalRevesList: AmericanaPlayer[] = [...revesCandidates];
  const finalDerechaList: AmericanaPlayer[] = [...derechaCandidates];

  // Distribute indifferent players to balance the two sides
  for (const ind of indiferenteCandidates) {
    if (finalRevesList.length < totalPairsNeeded && finalRevesList.length <= finalDerechaList.length) {
      finalRevesList.push(ind);
    } else if (finalDerechaList.length < totalPairsNeeded) {
      finalDerechaList.push(ind);
    } else {
      if (finalRevesList.length < totalPairsNeeded) {
        finalRevesList.push(ind);
      } else {
        finalDerechaList.push(ind);
      }
    }
  }

  // If one side has surplus and the other has deficit even after indifferent,
  // we adapt players from the surplus side (padel players can adapt when necessary)
  while (finalRevesList.length < totalPairsNeeded && finalDerechaList.length > totalPairsNeeded) {
    const moved = finalDerechaList.pop()!;
    finalRevesList.push(moved);
  }
  while (finalDerechaList.length < totalPairsNeeded && finalRevesList.length > totalPairsNeeded) {
    const moved = finalRevesList.pop()!;
    finalDerechaList.push(moved);
  }

  // Form pairs minimizing repeat partners
  const availableDerecha = [...finalDerechaList];
  const pairs: AmericanaPair[] = [];

  for (const revesPlayer of finalRevesList) {
    // Score each available derecha player: lowest repeat count with this reves player
    let bestIdx = 0;
    let minScore = Infinity;

    for (let i = 0; i < availableDerecha.length; i++) {
      const candidate = availableDerecha[i];
      const previousTogether = history.partnerCounts[revesPlayer.id]?.[candidate.id] || 0;
      // Add small random noise to break ties randomly
      const score = previousTogether * 10 + Math.random();
      if (score < minScore) {
        minScore = score;
        bestIdx = i;
      }
    }

    const matchedDerecha = availableDerecha.splice(bestIdx, 1)[0];
    pairs.push({
      playerReves: revesPlayer,
      playerDerecha: matchedDerecha,
    });
  }

  // Now we have `totalPairsNeeded` pairs.
  // We shuffle pairs and match them into courts
  const shuffledPairs = shuffleArray(pairs);
  const selectedCourts = shuffleArray(activeCourts).slice(0, courtsToUseCount);

  const matches: AmericanaMatch[] = [];

  for (let i = 0; i < courtsToUseCount; i++) {
    const court = selectedCourts[i];
    const teamA = shuffledPairs[i * 2];
    const teamB = shuffledPairs[i * 2 + 1];

    matches.push({
      id: `match-r${roundNumber}-c${court.id}-${Date.now().toString(36)}-${i}`,
      courtId: court.id,
      courtName: court.name,
      teamA,
      teamB,
      scoreA: 0,
      scoreB: 0,
    });
  }

  // Sort matches by court ID for clean display
  matches.sort((a, b) => a.courtId - b.courtId);

  return {
    roundNumber,
    matches,
    restingPlayers,
    completed: false,
    timestamp: Date.now(),
  };
}

/**
 * Default preset of 6 courts for a standard club.
 */
export const DEFAULT_CLUB_COURTS: ClubCourt[] = [
  { id: 1, name: 'Pista 1 — Central', active: true, surfaceColor: 'blue' },
  { id: 2, name: 'Pista 2 — Cristal Pro', active: true, surfaceColor: 'blue' },
  { id: 3, name: 'Pista 3 — Panorámica', active: true, surfaceColor: 'blue' },
  { id: 4, name: 'Pista 4 — Club', active: true, surfaceColor: 'blue' },
  { id: 5, name: 'Pista 5 — Club', active: false, surfaceColor: 'blue' },
  { id: 6, name: 'Pista 6 — Outdoor', active: false, surfaceColor: 'blue' },
];

/**
 * Realistic default players preset for quick testing (16 players = 4 courts).
 */
export const DEFAULT_PRESET_PLAYERS: AmericanaPlayer[] = [
  { id: 'p1', name: 'Carlos Alcaraz', position: 'reves', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p2', name: 'Ale Galán', position: 'reves', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p3', name: 'Juan Lebrón', position: 'derecha', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p4', name: 'Arturo Coello', position: 'derecha', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p5', name: 'Agustín Tapia', position: 'reves', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p6', name: 'Fede Chingotto', position: 'derecha', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p7', name: 'Paquito Navarro', position: 'reves', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p8', name: 'Martín Di Nenno', position: 'derecha', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p9', name: 'Franco Stupaczuk', position: 'reves', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p10', name: 'Mike Yanguas', position: 'derecha', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p11', name: 'Javi Garrido', position: 'reves', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p12', name: 'Coki Nieto', position: 'reves', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p13', name: 'Jon Sanz', position: 'derecha', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p14', name: 'Momo González', position: 'indiferente', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p15', name: 'Álex Ruiz', position: 'derecha', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
  { id: 'p16', name: 'Sanyo Gutiérrez', position: 'derecha', pointsWon: 0, matchesPlayed: 0, active: true, restCount: 0 },
];
