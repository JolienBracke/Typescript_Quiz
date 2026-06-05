import { playersPage, quiz } from "../globals.ts";
import { GameMode } from "../types/enum/GameMode.ts";
import { QuestionMode } from "../types/enum/QuestionMode.ts";
import { displayAlert, getElementWrapper, hideEl, showEl } from "../utils";

// language=HTML
const html: string = `
    <div class="row">
        <p data-testid="intro">Welcome to the happy coding quiz! This quiz can be played solo or with multiple players. Please start by configuring
            your quiz settings.</p>
    </div>
    <div class="row g-3">
        <div class="col-md-12">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="input-game-mode" data-testid="input-game-mode"/>
                <label class="form-check-label" for="input-game-mode"><span
                        id="lbl-game-mode" data-testid="lbl-game-mode">Single player</span></label>
            </div>
        </div>
        <div class="col-md-12 d-none" id="rowAmountPlayers">
            <input class="form-control" id="input-amount-players" data-testid="input-amount-players" placeholder="Enter the amount of players">
        </div>
        <div class="col-md-12">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="input-question-mode" data-testid="input-question-mode"/>
                <label class="form-check-label" for="input-question-mode"><span
                        id="lbl-question-mode" data-testid="lbl-question-mode">Free input</span></label>
            </div>
        </div>
        <div class="col-md-12">
            <input class="form-control" id="input-question-amount" data-testid="input-question-amount" placeholder="Enter the amount of questions">
        </div>
    </div>
    <hr>
    <div class="row">
        <div class="col">
            <button id="btn-save-configuration" class="btn btn-success w-100" data-testid="btn-save-configuration">Save configuration</button>
            
        </div>
    </div>
`;

export class HomePage {
    public constructor() {
        // The constructor does not need to initialize anything yet.
    }

    public init(contentElement: HTMLElement) {
        // Render the home page HTML into the main content area.
        contentElement.innerHTML = html;

        // Attach event listeners for the form controls on the home page.
        getElementWrapper<HTMLButtonElement>('#btn-save-configuration').addEventListener('click', () => this.saveConfiguration());
        getElementWrapper<HTMLInputElement>('#input-game-mode').addEventListener('change', () => this.toggleGameModeLabel());
        getElementWrapper<HTMLInputElement>('#input-question-mode').addEventListener('change', () => this.toggleQuestionModeLabel());
    }

    private validateFields = (): boolean => {
        // Read the configured number of questions and whether multiplayer mode is active.
        const inputAmountQuestions = getElementWrapper<HTMLInputElement>('#input-question-amount');
        const amountQuestions = inputAmountQuestions.value.trim();
        const inputGameMode = getElementWrapper<HTMLInputElement>('#input-game-mode');
        const isMultiPlayer = inputGameMode.checked;

        // Question amount is mandatory and must be a positive number.
        if (!amountQuestions) {
            displayAlert('Please enter the amount of questions');
            return false;
        }

        if (Number.isNaN(Number(amountQuestions)) || Number(amountQuestions) <= 0) {
            displayAlert('Please enter the amount of questions');
            return false;
        }

        // If multiplayer mode is selected, player count is also required.
        if (isMultiPlayer) {
            const inputAmountPlayers = getElementWrapper<HTMLInputElement>('#input-amount-players');
            const amountPlayers = inputAmountPlayers.value.trim();
            if (!amountPlayers) {
                displayAlert('Please enter the amount of players');
                return false;
            }
            if (Number.isNaN(Number(amountPlayers)) || Number(amountPlayers) <= 0) {
                displayAlert('Please enter the amount of players');
                return false;
            }
        }

        return true;
    }

    private saveConfiguration = () => {
        // Validate the form before saving the quiz configuration.
        if (!this.validateFields()) {
            return;
        }

        // Determine the selected game mode and question mode.
        const inputGameMode = getElementWrapper<HTMLInputElement>('#input-game-mode');
        const gameMode = inputGameMode.checked ? GameMode.Multi : GameMode.Single;
        const inputQuestionMode = getElementWrapper<HTMLInputElement>('#input-question-mode');
        const questionMode = inputQuestionMode.checked ? QuestionMode.Api : QuestionMode.Custom;

        // Read the number of questions and players from the form.
        const inputAmountQuestions = getElementWrapper<HTMLInputElement>('#input-question-amount');
        const amountQuestions = parseInt(inputAmountQuestions.value);
        let amountOfPlayers = 1;

        if (gameMode === GameMode.Multi) {
            const inputAmountPlayers = getElementWrapper<HTMLInputElement>('#input-amount-players');
            amountOfPlayers = parseInt(inputAmountPlayers.value);
        }

        // Store the chosen configuration in the shared quiz state.
        quiz.setGameMode(gameMode, amountOfPlayers);
        quiz.setQuestionMode(questionMode);
        quiz.quizDuration = amountQuestions;

        // Move to the next page in the flow: PlayersPage.
        playersPage.init(getElementWrapper<HTMLDivElement>('#content'))
    }

    private toggleQuestionModeLabel = () => {
        const inputQuestionMode = getElementWrapper<HTMLInputElement>('#input-question-mode');
        const label = getElementWrapper<HTMLElement>('#lbl-question-mode');

        // Update the label text when the question mode checkbox changes.
        label.innerText = inputQuestionMode.checked ? 'API questions' : 'Free input';
    }

    private toggleGameModeLabel = () => {
        const inputGameMode = getElementWrapper<HTMLInputElement>('#input-game-mode');
        const label = getElementWrapper<HTMLElement>('#lbl-game-mode');
        const rowAmountPlayers = getElementWrapper<HTMLDivElement>('#rowAmountPlayers');

        // Show or hide the number of players input based on multiplayer toggle.
        if (inputGameMode.checked) {
            label.innerText = 'Multiplayer';
            showEl(rowAmountPlayers);
        } else {
            label.innerText = 'Single player';
            hideEl(rowAmountPlayers);
        }
    }
}