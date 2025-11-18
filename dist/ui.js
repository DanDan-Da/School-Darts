import { getRemainingScoreForPlayer, getCurrentPlayerName } from "./state.js";

export function getUiElements() {
    return {
        message: document.getElementById("message"),
        statusGame: document.getElementById("status-game"),
        statusMaxLegs: document.getElementById("status-max-legs"),
        statusLegNumber: document.getElementById("status-leg-number"),
        statusCurrentPlayer: document.getElementById("status-current-player"),
        playersTableBody: document.getElementById("players-table-body"),
        turnsTableBody: document.getElementById("turns-table-body"),
        addTurnButton: document.getElementById("add-turn-button"),
        undoTurnButton: document.getElementById("undo-turn-button"),
        newLegButton: document.getElementById("new-leg-button"),
        pointsInput: document.getElementById("points-input")
    };
}

export function renderAll(setState, ui) {
    renderStatus(setState, ui);
    renderPlayersTable(setState, ui);
    renderTurnsTable(setState, ui);
    renderButtons(setState, ui);
}

export function renderStatus(setState, ui) {
    if (!setState.currentLeg) {
        ui.statusGame.textContent = "–";
        ui.statusMaxLegs.textContent = "–";
        ui.statusLegNumber.textContent = "–";
        ui.statusCurrentPlayer.textContent = "–";
        return;
    }

    ui.statusGame.textContent = `${setState.gameType} down`;
    ui.statusMaxLegs.textContent = `Best of ${setState.maxLegs}`;
    ui.statusLegNumber.textContent = String(setState.currentLeg.legNumber);
    ui.statusCurrentPlayer.textContent = setState.isFinished
        ? "Set finished"
        : getCurrentPlayerName(setState);
}

export function renderPlayersTable(setState, ui) {
    const leg = setState.currentLeg;
    ui.playersTableBody.innerHTML = "";
    if (!leg) return;

    for (const player of setState.players) {
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = player.name;
        tr.appendChild(nameTd);

        const legsWonTd = document.createElement("td");
        legsWonTd.textContent = String(player.legsWon);
        tr.appendChild(legsWonTd);

        const remainingTd = document.createElement("td");
        const remaining = getRemainingScoreForPlayer(leg, player.id);
        remainingTd.textContent = String(remaining);
        tr.appendChild(remainingTd);

        ui.playersTableBody.appendChild(tr);
    }
}

export function renderTurnsTable(setState, ui) {
    const leg = setState.currentLeg;
    ui.turnsTableBody.innerHTML = "";
    if (!leg) return;

    leg.turns.forEach((turn, index) => {
        const tr = document.createElement("tr");

        const indexTd = document.createElement("td");
        indexTd.textContent = String(index + 1);
        tr.appendChild(indexTd);

        const playerTd = document.createElement("td");
        const player = setState.players.find(p => p.id === turn.playerId);
        playerTd.textContent = player ? player.name : "?";
        tr.appendChild(playerTd);

        const pointsTd = document.createElement("td");
        pointsTd.textContent = String(turn.points);
        tr.appendChild(pointsTd);

        const runningTd = document.createElement("td");
        runningTd.textContent = String(turn.runningScore);
        tr.appendChild(runningTd);

        ui.turnsTableBody.appendChild(tr);
    });
}

export function renderButtons(setState, ui) {
    const leg = setState.currentLeg;

    const hasSet = !!leg;
    const setFinished = setState.isFinished;
    const legFinished = leg ? leg.isFinished : false;

    ui.addTurnButton.disabled = !hasSet || setFinished || legFinished;
    ui.undoTurnButton.disabled = !hasSet || setFinished || legFinished || (leg && leg.turns.length === 0);
    ui.newLegButton.disabled = !hasSet || setFinished || !legFinished;

    ui.pointsInput.disabled = ui.addTurnButton.disabled;
}

export function showInfoMessage(ui, text) {
    ui.message.textContent = text;
    ui.message.classList.remove("message--warning", "message--success");
    ui.message.classList.add("message--info");
}

export function showWarningMessage(ui, text) {
    ui.message.textContent = text;
    ui.message.classList.remove("message--info", "message--success");
    ui.message.classList.add("message--warning");
}

export function showSuccessMessage(ui, text) {
    ui.message.textContent = text;
    ui.message.classList.remove("message--info", "message--warning");
    ui.message.classList.add("message--success");
}
