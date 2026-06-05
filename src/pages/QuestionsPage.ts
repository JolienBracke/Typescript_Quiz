import { quiz, quizPage } from "../globals.ts";
import { QuestionMode } from "../types/enum/QuestionMode.ts";
import { QuestionService } from "../services/QuestionService.ts";
import { ICategory } from "../types/interfaces/ICategory.ts";
import { Difficulty } from "../types/enum/Difficulty.ts";
import {
    disableEl,
    displayAlert,
    enableEl,
    getElementWrapper
} from "../utils";

import Question from "../models/Question.ts";

const questionService = new QuestionService();

// HTML block for API mode: the user can choose difficulty, category and fetch questions from the Open Trivia DB.
const apiModeHtml: string = `
    <h2>API questions</h2>
    <p>Configure the API for retrieving questions</p>

    <select
        class="form-select"
        id="input-difficulty"
        data-testid="input-difficulty">
    </select>

    <select
        class="form-select mt-2"
        id="input-category"
        data-testid="input-category">
    </select>

    <button
        id="btn-fetch-questions"
        class="btn btn-primary mt-2"
        data-testid="btn-fetch-questions">

        Fetch questions
    </button>
`;


// language=HTML
// HTML block for custom mode: the user can manually enter a question, correct answer and incorrect answers.
const customModeHtml: string = `
    <h2>Custom questions</h2>

    <div class="row mb-3">
        <label
            for="input-question"
            class="col-sm-2 col-form-label">

            Question
        </label>

        <div class="col-sm-10">
            <input
                class="form-control"
                id="input-question"
                data-testid="input-question">
        </div>
    </div>

    <div class="row mb-3">

        <label
            for="input-correct-answer"
            class="col-sm-2 col-form-label">

            Correct answer
        </label>

        <div class="col-sm-10">
            <input
                class="form-control"
                id="input-correct-answer"
                data-testid="input-correct-answer">
        </div>
    </div>

    <div class="row mb-3">

        <label
            for="input-incorrect-answer"
            class="col-sm-2 col-form-label">

            Incorrect answer
        </label>

        <div class="col-sm-10">

            <div class="input-group">

                <input
                    id="input-incorrect-answer"
                    type="text"
                    class="form-control"
                    data-testid="input-incorrect-answer">

                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    id="btn-add-incorrect-answer"
                    data-testid="btn-add-incorrect-answer">

                    Add
                </button>

            </div>
        </div>
    </div>

    <table class="table table-bordered">

        <thead>
        <tr>
            <th scope="col">Question</th>
            <th scope="col">Correct answer</th>
            <th scope="col">Incorrect answers</th>
        </tr>
        </thead>

        <tbody>
        <tr>

            <td
                id="output-question"
                data-testid="output-question">
            </td>

            <td>
                <ul
                    id="output-correct-answer"
                    data-testid="output-correct-answer">
                </ul>
            </td>

            <td>
                <ul
                    id="output-incorrect-answers"
                    data-testid="output-incorrect-answers">
                </ul>
            </td>

        </tr>
        </tbody>

    </table>

    <button
        type="submit"
        class="btn btn-primary"
        id="btn-submit-question"
        data-testid="btn-submit-question">

        Submit question
    </button>
`;


//language=HTML
// HTML block to show the confirmed questions and the current question counter.
const questionsHtml: string = `
    <h2 class="mt-2">
        Confirmed questions
        <span
            id="question-counter"
            data-testid="question-counter">

            (0/0)
        </span>
    </h2>

    <div
        id="questions"
        data-testid="questions">

        No questions to display
    </div>
`;


const fillCategories = async () => {

    const select =
        getElementWrapper<HTMLSelectElement>("#input-category");

    const categories = await questionService.getCategories();

    console.log("Categories:", categories);

    categories.forEach((c: ICategory) => {

        const option = document.createElement("option");

        option.value = c.id.toString();
        option.text = c.name;

        select.appendChild(option);
    });
};


const fillDifficulty = async () => {
    // Populate the difficulty dropdown with the available difficulty values.
    const select =
        getElementWrapper<HTMLSelectElement>("#input-difficulty");

    Object.values(Difficulty).forEach(value => {

        const option = document.createElement("option");

        option.value = value;
        option.text = value;

        select.appendChild(option);
    });
};


export class QuestionsPage {

    private tempQuestion = new Question("");

    public constructor() {
        // The tempQuestion stores the current custom question while the user is still editing it.
    }

    public init(contentElement: HTMLElement) {
        // Choose the correct HTML block according to the configured question mode.
        let htmlToShow =
            quiz.getQuestionMode() === QuestionMode.Api
                ? apiModeHtml
                : customModeHtml;

        const fullHtml = `
            <div class="row">
                <div class="col">

                    <p data-testid="intro">
                        A quiz can not start without questions.
                        Add questions to the quiz by fetching them
                        from an API or by adding them manually.
                    </p>

                </div>
            </div>

            <div class="row">

                <div class="col">
                    ${htmlToShow}
                </div>

                <div class="col">
                    ${questionsHtml}
                </div>

            </div>

            <hr>

            <div class="row">
                <div class="col">

                    <button
                        class="btn btn-success w-100"
                        id="btn-start-quiz"
                        data-testid="btn-start-quiz"
                        disabled>

                        Start quiz
                    </button>

                </div>
            </div>
        `;

        contentElement.innerHTML = fullHtml;
        this.tempQuestion = new Question("");
        this.updateQuestionCounter();
        this.updateQuestionList();
        this.setStartQuizButtonState();

        // If we are in API mode, load categories and difficulties and attach fetch logic.
        if (quiz.getQuestionMode() === QuestionMode.Api) {

            fillCategories();
            fillDifficulty();

            const fetchButton =
                getElementWrapper<HTMLButtonElement>(
                    "#btn-fetch-questions"
                );

            fetchButton.addEventListener("click", async () => {
                // Read the selected difficulty and category before fetching.
                const difficulty =
                    getElementWrapper<HTMLSelectElement>(
                        "#input-difficulty"
                    ).value;

                const category =
                    parseInt(
                        getElementWrapper<HTMLSelectElement>(
                            "#input-category"
                        ).value
                    );

                const questions =
                    await questionService.getQuestions(
                        quiz.quizDuration,
                        category,
                        difficulty
                    );

                if (questions.length === 0) {
                    displayAlert("No questions found");
                    return;
                }

                questions.forEach((q: Question) => {
                    quiz.addQuestion(q);
                });

                this.updateQuestionList();
                this.updateQuestionCounter();
                this.setStartQuizButtonState();
            });
        } else {
            // In custom mode, attach handlers for adding incorrect answers and submitting the question.
            getElementWrapper<HTMLButtonElement>('#btn-add-incorrect-answer').addEventListener('click', () => this.addIncorrectAnswer());
            getElementWrapper<HTMLButtonElement>('#btn-submit-question').addEventListener('click', () => this.submitQuestion());
        }

        getElementWrapper<HTMLButtonElement>('#btn-start-quiz').addEventListener('click', () => {
            // Start the quiz and transition to the quiz page.
            quiz.startQuiz();
            quizPage.init(getElementWrapper<HTMLDivElement>('#content'));
        });
    }

    private addIncorrectAnswer() {
        // Add one incorrect answer to the temporary custom question.
        const incorrectInput = getElementWrapper<HTMLInputElement>('#input-incorrect-answer');
        const answerText = incorrectInput.value.trim();

        if (!answerText) {
            displayAlert('Incorrect answer can not be empty');
            return;
        }

        this.tempQuestion.addAnswer({
            text: answerText,
            isCorrect: false
        });

        incorrectInput.value = '';
        this.renderIncorrectAnswers();
    }

    private renderIncorrectAnswers() {
        // Show the current incorrect answers entered by the user in the preview list.
        const outputIncorrectAnswers = getElementWrapper<HTMLUListElement>('#output-incorrect-answers');
        outputIncorrectAnswers.innerHTML = '';

        this.tempQuestion.answers
            .filter(answer => !answer.isCorrect)
            .forEach(answer => {
                const li = document.createElement('li');
                li.textContent = answer.text;
                outputIncorrectAnswers.appendChild(li);
            });
    }

    private submitQuestion() {
        // Validate the entered question text first.
        const questionInput = getElementWrapper<HTMLInputElement>('#input-question');
        const questionText = questionInput.value.trim();

        if (!questionText || questionText.split(/\s+/).length < 4) {
            displayAlert('Question should contain at least 4 words');
            return;
        }

        // Validate the correct answer.
        const correctAnswerInput = getElementWrapper<HTMLInputElement>('#input-correct-answer');
        const correctAnswer = correctAnswerInput.value.trim();

        if (!correctAnswer) {
            displayAlert('Question should contain at least 1 correct answer which can not be empty');
            return;
        }

        // Ensure the user entered at least two incorrect answers.
        const incorrectAnswers = this.tempQuestion.answers.filter(answer => !answer.isCorrect);
        if (incorrectAnswers.length < 2) {
            displayAlert('Question should contain at least 2 incorrect answers');
            return;
        }

        // Complete the temporary question and add it to the quiz.
        this.tempQuestion.question = questionText;
        this.tempQuestion.answers.unshift({ text: correctAnswer, isCorrect: true });
        quiz.addQuestion(this.tempQuestion);

        // Update the preview area with the submitted question.
        this.displaySubmittedQuestion();

        // Reset the temporary custom question state for the next question.
        this.tempQuestion = new Question("");
        questionInput.value = '';
        correctAnswerInput.value = '';
        this.renderIncorrectAnswers();
        this.updateQuestionList();
        this.updateQuestionCounter();
        this.setStartQuizButtonState();
    }

    private displaySubmittedQuestion() {
        // Show the last submitted question in the output table.
        const outputQuestion = getElementWrapper<HTMLElement>('#output-question');
        const outputCorrectAnswer = getElementWrapper<HTMLUListElement>('#output-correct-answer');
        const outputIncorrectAnswers = getElementWrapper<HTMLUListElement>('#output-incorrect-answers');

        const lastQuestion = quiz.questions[quiz.questions.length - 1];
        outputQuestion.textContent = lastQuestion.question;
        outputCorrectAnswer.innerHTML = '';
        outputIncorrectAnswers.innerHTML = '';

        const correctLi = document.createElement('li');
        correctLi.textContent = lastQuestion.answers.find(answer => answer.isCorrect)?.text ?? '';
        outputCorrectAnswer.appendChild(correctLi);

        lastQuestion.answers
            .filter(answer => !answer.isCorrect)
            .forEach(answer => {
                const li = document.createElement('li');
                li.textContent = answer.text;
                outputIncorrectAnswers.appendChild(li);
            });
    }

    private updateQuestionCounter() {
        const questionCounter = getElementWrapper<HTMLElement>('#question-counter');
        // Update the counter text with how many questions are currently added.
        questionCounter.textContent = `(${quiz.questions.length}/${quiz.quizDuration})`;
    }

    private updateQuestionList() {
        const questionsDiv = getElementWrapper<HTMLDivElement>('#questions');
        if (quiz.questions.length === 0) {
            questionsDiv.innerHTML = 'No questions to display';
            return;
        }

        // Render each confirmed question in the question list area.
        questionsDiv.innerHTML = quiz.questions
            .map(q => `<p>${q.question}</p>`)
            .join('');
    }

    private setStartQuizButtonState() {
        const startButton = getElementWrapper<HTMLButtonElement>('#btn-start-quiz');
        // Enable the Start quiz button only when the exact required number of questions is ready.
        if (quiz.questions.length >= quiz.quizDuration && quiz.quizDuration > 0) {
            enableEl(startButton);
        } else {
            disableEl(startButton);
        }
    }
}