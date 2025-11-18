import { createGameType } from "./models.js";

let nextTurnId = 1;

export function createEmptySet() {
    return {
        players: [],
        gameType: createGameType(501),
        maxLegs: 5,
        currentLeg: null,
        isFinished: false,
        winnerPlayerId: null
    };
}

export function startNewSet(player1Name, player2Name, gameType, maxLegs) {
    const players = [
        { id: 1, name: player1Name.trim() || "Player 1", legsWon: 0 },
        { id: 2, name: player2Name.trim() || "Player 2", legsWon: 0 }
    ];

    const setState = {
        players,
        gameType: createGameType(gameType),
        maxLegs,
        currentLeg: null,
        isFinished: false,
        winnerPlayerId: null
    };

    setState.currentLeg = createNewLeg(setState, 1);
    return setState;
}

export function createNewLeg(setState, legNumber) {
    const leg = {
        legNumber,
        startingScore: setState.gameType,
        turns: [],
        isFinished: false,
        currentPlayerIndex: 0
    };
    nextTurnId = 1;
    return leg;
}

export function addTurn(setState, points) {
    const leg = setState.currentLeg;
    if (!leg || setState.isFinished || leg.isFinished) {
        return { legFinished: false, winner: null };
    }

    const players = setState.players;
    const currentPlayer = players[leg.currentPlayerIndex];

    const remainingBefore = getRemainingScoreForPlayer(leg, currentPlayer.id);
    const remainingAfter = remainingBefore - points;

    if (remainingAfter < 0) {
        return { legFinished: false, winner: null };
    }

    const turn = {
        id: nextTurnId++,
        playerId: currentPlayer.id,
        points,
        runningScore: remainingAfter
    };
    leg.turns.push(turn);

    let legFinished = false;
    let winner = null;

    if (remainingAfter === 0) {
        leg.isFinished = true;
        legFinished = true;
        winner = currentPlayer;
        winner.legsWon += 1;
        updateSetWinner(setState);
    } else {
        leg.currentPlayerIndex = (leg.currentPlayerIndex + 1) % players.length;
    }

    return { legFinished, winner };
}

export function removeLastTurn(setState) {
    const leg = setState.currentLeg;
    if (!leg || leg.turns.length === 0 || leg.isFinished) {
        return;
    }

    leg.turns.pop();

    nextTurnId = 1;
    const players = setState.players;
    const startingScore = leg.startingScore;

    const remainingScores = {};
    for (const p of players) {
        remainingScores[p.id] = startingScore;
    }

    for (const t of leg.turns) {
        const currentRemaining = remainingScores[t.playerId];
        const updated = currentRemaining - t.points;
        t.runningScore = updated;
        remainingScores[t.playerId] = updated;
    }

    if (leg.turns.length === 0) {
        leg.currentPlayerIndex = 0;
    } else {
        const lastTurn = leg.turns[leg.turns.length - 1];
        const lastPlayerIndex = players.findIndex(p => p.id === lastTurn.playerId);
        leg.currentPlayerIndex = (lastPlayerIndex + 1) % players.length;
    }
}

export function getRemainingScoreForPlayer(leg, playerId) {
    let remaining = leg.startingScore;
    for (const t of leg.turns) {
        if (t.playerId === playerId) {
            remaining -= t.points;
        }
    }
    return remaining;
}

export function canStartNextLeg(setState) {
    const leg = setState.currentLeg;
    if (!leg || !leg.isFinished || setState.isFinished) {
        return false;
    }
    return true;
}

export function startNextLeg(setState) {
    const leg = setState.currentLeg;
    if (!leg || !leg.isFinished || setState.isFinished) {
        return;
    }
    const nextLegNumber = leg.legNumber + 1;
    if (nextLegNumber > setState.maxLegs) {
        return;
    }
    setState.currentLeg = createNewLeg(setState, nextLegNumber);
}

export function resetSet(setState) {
    setState.players.forEach(p => {
        p.legsWon = 0;
    });
    setState.isFinished = false;
    setState.winnerPlayerId = null;
    setState.currentLeg = null;
}

export function updateSetWinner(setState) {
    const neededLegs = Math.floor(setState.maxLegs / 2) + 1;
    for (const player of setState.players) {
        if (player.legsWon >= neededLegs) {
            setState.isFinished = true;
            setState.winnerPlayerId = player.id;
            break;
        }
    }
}

export function getCurrentPlayerName(setState) {
    const leg = setState.currentLeg;
    if (!leg) return "–";
    const player = setState.players[leg.currentPlayerIndex];
    return player ? player.name : "–";
}
