//language=HTML
import { getElementWrapper } from "../utils";
import { homePage, quiz } from "../globals.ts";

const html: string = `
    <div class="row">
        <div class="col">
            <p data-testid="intro">The quiz has ended. Here are the final scores:</p>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <ol id="scoreboard" data-testid="scoreboard"></ol>
            <!-- restart quiz game -->
            <button id="btn-restart-game" class="btn btn-danger mt-5" data-testid="btn-restart-game">Restart Game
            </button>
        </div>
    </div>
`;

export class ScoreboardPage {
    public constructor() {
        // No instance state is needed for the scoreboard page.
    }

    public init(contentElement: HTMLElement) {
        // Render the final scoreboard and attach the restart button handler.
        contentElement.innerHTML = html;
        this.showScoreboard();
        getElementWrapper<HTMLButtonElement>("#btn-restart-game").addEventListener("click", () => this.restartGame());
    }

    private restartGame() {
        // Reset quiz state and return to the home page.
        quiz.resetGame();
        homePage.init(getElementWrapper<HTMLDivElement>('#content'));
    }

    private showScoreboard() {
        // Display the final rankings for all players.
        const scoreboard = getElementWrapper<HTMLOListElement>('#scoreboard');
        scoreboard.innerHTML = '';

        const sortedPlayers = quiz.sortPlayersByScore();
        sortedPlayers.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.}.${player.name}: ${player.score}`;
            scoreboard.appendChild(li);
        });
    }
}