// language=HTML
import { questionsPage, quiz } from "../globals.ts";
import { displayAlert, getElementWrapper, disableEl, enableEl } from "../utils";

const html = `
    <div class="row">
        <div class="col" data-testid="intro"><p>Enter all players that will participate in the quiz. You can continue
            when all players are added.</p>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <p>Add a new player</p>
            <input type="text" class="form-control mb-2" id="input-player" data-testid="input-player" placeholder="Enter player name"
                   aria-label="Recipient's username" aria-describedby="btn-add-player">
            <button class="btn btn-primary" type="button" id="btn-add-player" data-testid="btn-add-player">Add player</button>
        </div>
        <div class="col">
            <p id="title-player-list" data-testid="title-player-list">Player list (0/0)</p>
            <ul id="player-list" data-testid="player-list"></ul>
        </div>
    </div>
    <hr>
    <div class="row">
        <div class="col">
            <button id="btn-go-to-questions" data-testid="btn-go-to-questions" disabled class="btn btn-success w-100">Go to questions</button>
        </div>
    </div>
`;

export class PlayersPage {
    public constructor() {
        // The constructor is empty because no state is kept directly in the page class.
    }

    public init(contentElement: HTMLElement) {
        // Render the players page and attach interactive behavior.
        contentElement.innerHTML = html;
        getElementWrapper<HTMLButtonElement>('#btn-add-player').addEventListener("click", () => this.addPlayer());
        getElementWrapper<HTMLButtonElement>("#btn-go-to-questions").addEventListener("click", () => questionsPage.init(getElementWrapper("#content")));

        // Update the player list display after rendering the page.
        this.updatePlayerList();
    }

    private updatePlayerList() {
        const playerList = getElementWrapper<HTMLUListElement>("#player-list");
        playerList.innerHTML = "";

        // Update the title to show how many players have been added.
        const title = getElementWrapper<HTMLElement>("#title-player-list");
        title.textContent = `Player list (${quiz.players.length}/${quiz.getNumberOfPlayers()})`;

        // Render each added player into the list.
        if (quiz.players.length > 0) {
            quiz.players.forEach(p => {
                const li = document.createElement("li");
                li.textContent = p.name;
                playerList.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = "No players added";
            playerList.appendChild(li);
        }

        // Enable the next page button only when enough players were added.
        const goToQuestionsButton = getElementWrapper<HTMLButtonElement>("#btn-go-to-questions");
        if (quiz.players.length >= quiz.getNumberOfPlayers()) {
            enableEl(goToQuestionsButton);
        } else {
            disableEl(goToQuestionsButton);
        }
    }

    private validatePlayerName = (): boolean => {
        const inputPlayer = getElementWrapper<HTMLInputElement>('#input-player');
        const name = inputPlayer.value.trim();

        // Player names cannot be empty.
        if (!name) {
            displayAlert('Please enter a player name');
            return false;
        }

    // Player names must be unique.
    if (quiz.players.some(p => p.name === name)) {
        displayAlert('Player name must be unique');
        return false;
    }

    // Cannot add more players than configured.
    if (quiz.players.length >= quiz.getNumberOfPlayers()) {
        displayAlert('Maximum number of players reached');
        return false;
    }

        return true;
    }

    private addPlayer() {
        // Only add players when the input is valid.
        if (!this.validatePlayerName()) {
            return;
        }

        const inputPlayer = getElementWrapper<HTMLInputElement>('#input-player');
        const name = inputPlayer.value.trim();

        // Add the player to the quiz state and clear the input field.
        quiz.addPlayer(name);
        inputPlayer.value = '';

        // Re-render the player list and update the button state.
        this.updatePlayerList();
    }
}