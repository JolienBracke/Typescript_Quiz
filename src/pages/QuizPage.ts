// language=HTML
import { getElementWrapper } from "../utils";
import { quiz, scoreboardPage } from "../globals.ts";

const html: string = `
    <div class="row">
        <div class="col">
            <p data-testid="intro">Try to score as many points as possible by answering the questions correctly. Good
                luck!</p>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <div id="current-player-container" class="" data-testid="current-player-container">
                <p><span class="fw-bold">Current player: </span><span id="current-player-name"
                                                                      data-testid="current-player-name"></span></p>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <div id="quiz-container" class="" data-testid="quiz-container">
                <!-- Quiz content will be displayed here -->
                <p><span class="fw-bold">Question: </span><span id="question" data-testid="question"></span>
                </p>
                <p class="fw-bold">Select the correct answer!</p>
                <div id="answer-container" class="mb-3" data-testid="answer-container"></div>
                <button id="btn-submit-answer" class="btn btn-success" data-testid="btn-submit-answer">Submit Answer
                </button>
            </div>
        </div>
    </div>
`;

export class QuizPage {

    public constructor() {
        // No state is stored inside QuizPage itself, so constructor stays empty.
    }

    public init(element: HTMLElement) {
        // Render the quiz page and show the current question and player.
        element.innerHTML = html;
        this.updatePlayerName();
        this.updateCurrentQuestion();
        getElementWrapper<HTMLButtonElement>('#btn-submit-answer').addEventListener('click', () => this.submitAnswer());
    }

    private updatePlayerName() {
        // Display the current player's name in the quiz header.
        getElementWrapper<HTMLElement>('#current-player-name').innerText = quiz.getCurrentPlayerName();
    }

    private submitAnswer() {
        // Read the selected radio button from the answer list.
        const answerContainer = getElementWrapper<HTMLDivElement>('#answer-container');
        const selectedAnswer = answerContainer.querySelector<HTMLInputElement>('input[name="answer"]:checked');
        if (!selectedAnswer) {
            return;
        }

        // Check whether the selected answer is correct and update score when needed.
        const isCorrect = quiz.testIfAnswerIsCorrect(selectedAnswer.value);
        if (isCorrect) {
            quiz.updateCurrentPlayerScore(1);
        }

        // Advance to the next question or player.
        quiz.nextQuestion();

        // If the quiz ended, show the scoreboard page.
        if (!quiz.isRunning) {
            scoreboardPage.init(getElementWrapper<HTMLDivElement>('#content'));
            return;
        }

        // Otherwise refresh the displayed player name and question.
        this.updatePlayerName();
        this.updateCurrentQuestion();
    }

    private updateCurrentQuestion() {
        const currentQuestion = quiz.getCurrentQuestion();
        if (!currentQuestion) {
            return;
        }

        // Render the question text and the answer options.
        getElementWrapper<HTMLElement>('#question').innerText = currentQuestion.question;
        const answers = currentQuestion.answers;
        const answerContainer = getElementWrapper<HTMLDivElement>('#answer-container');
        answerContainer.innerHTML = "";

        answers.forEach((answer) => {
            const formCheck = document.createElement("div");
            formCheck.className = "form-check";

            const radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.className = "form-check-input";
            radioInput.name = "answer";
            radioInput.value = answer.text;

            const label = document.createElement("label");
            label.className = "form-check-label";
            label.appendChild(radioInput);
            label.appendChild(document.createTextNode(answer.text));

            formCheck.appendChild(label);
            answerContainer.appendChild(formCheck);
        });
    }
}