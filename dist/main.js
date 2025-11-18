import {
    createEmptySet,
    startNewSet,
    addTurn,
    removeLastTurn,
    canStartNextLeg,
    startNextLeg,
    resetSet
} from "./state.js";
import {
    getUiElements,
    renderAll,
    showInfoMessage,
    showWarningMessage,
    showSuccessMessage
} from "./ui.js";

const ui = getUiElements();
let setState = createEmptySet();

function setupEventHandlers() {
    const setupForm = document.getElementById("setup-form");
    const resetSetButton = document.getElementById("reset-set-button");
    const turnForm = document.getElementById("turn-form");

    setupForm.addEventListener("submit", evt => {
        evt.preventDefault();
        const formData = new FormData(setupForm);
        const player1 = String(formData.get("player1") || "Player 1");
        const player2 = String(formData.get("player2") || "Player 2");
        const gameTypeValue = Number(formData.get("gameType") || 501);
        const maxLegsValue = Number(formData.get("maxLegs") || 5);

        setState = startNewSet(player1, player2, gameTypeValue, maxLegsValue);
        renderAll(setState, ui);
        showInfoMessage(ui, "Set started. Enter points for the current player.");
        ui.pointsInput.focus();
    });

    resetSetButton.addEventListener("click", () => {
        resetSet(setState);
        renderAll(setState, ui);
        showInfoMessage(ui, "All data cleared. Start a new set.");
    });

    turnForm.addEventListener("submit", evt => {
        evt.preventDefault();
        handleAddTurn();
    });

    ui.undoTurnButton.addEventListener("click", () => {
        removeLastTurn(setState);
        renderAll(setState, ui);
        showInfoMessage(ui, "Last turn removed.");
    });

    ui.newLegButton.addEventListener("click", () => {
        if (!canStartNextLeg(setState)) {
            return;
        }
        startNextLeg(setState);
        renderAll(setState, ui);
        showInfoMessage(ui, "New leg started. Continue scoring.");
        ui.pointsInput.focus();
    });

    ui.pointsInput.addEventListener("keydown", evt => {
        if (evt.key === "Enter") {
            evt.preventDefault();
            handleAddTurn();
        }
    });

    renderAll(setState, ui);
}

function handleAddTurn() {
    const rawValue = ui.pointsInput.value.trim();
    if (rawValue === "") {
        showWarningMessage(ui, "Please enter the points for this turn.");
        return;
    }

    const points = Number(rawValue);
    if (!Number.isInteger(points) || points < 0 || points > 180) {
        showWarningMessage(ui, "Points must be an integer between 0 and 180.");
        return;
    }

    const result = addTurn(setState, points);
    if (result.legFinished && result.winner) {
        renderAll(setState, ui);
        const winnerName = result.winner.name;
        if (setState.isFinished) {
            showSuccessMessage(
                ui,
                `Leg won by ${winnerName}. The set is finished. Overall winner: ${winnerName}.`
            );
        } else {
            showSuccessMessage(ui, `Leg won by ${winnerName}. Start the next leg when ready.`);
        }
    } else if (!result.legFinished) {
        if (points === 0) {
            showInfoMessage(ui, "No score this turn. Next player's turn.");
        } else {
            showInfoMessage(ui, "Turn recorded. Next player's turn.");
        }
        renderAll(setState, ui);
    } else {
        showWarningMessage(ui, "This score would make the remaining points negative.");
    }

    ui.pointsInput.select();
}

window.addEventListener("load", () => {
    setupEventHandlers();
});
