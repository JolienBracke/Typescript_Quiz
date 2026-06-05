import Question from "./Question";
import Player from "./Player";
import { QuestionMode } from "../types/enum/QuestionMode";
import { GameMode } from "../types/enum/GameMode.ts";

export class Quiz {
    public isRunning: boolean = false;
    public questions: Question[] = [];
    public quizDuration: number = 0;
    public players: Player[] = [];
    private currentQuestionIndex: number;
    private currentPlayerIndex: number;
    private gameMode: GameMode;
    private questionMode: QuestionMode;
    private numberOfPlayers: number = 1;
    private totalAmountOfQuestionToBeAsked: number = 0;
    private amountOfQuestionsAlreadyAsked: number = 0;

    public constructor(duration: number) 
    {
        // alles een standaard waarde geven
        this.gameMode = GameMode.Single;
        this.questionMode = QuestionMode.Custom;
        this.currentQuestionIndex = 0;
        this.currentPlayerIndex = 0;

        // quizduration gegeven in de constructor
        this.quizDuration = duration;
    }

    public getGameMode() 
    {
        return this.gameMode;
    }

    public getQuestionMode(): QuestionMode { return this.questionMode; }

    public getNumberOfPlayers(): number { return this.numberOfPlayers; }

    public getCurrentPlayerName(): string 
    {
        if (this.players.length === 0) return "";
        return this.players[this.currentPlayerIndex].name;
    }

    public getCurrentQuestion() 
    { 
        return this.questions[this.currentQuestionIndex];
    }

    public updateCurrentPlayerScore(amount: number) 
    {
        this.players[this.currentPlayerIndex].updateScore(amount);
    }

    public setQuestionMode(mode: QuestionMode) 
    {
        this.questionMode = mode;
    }

    private updateTotalAmountOfQuestionToBeAsked() 
    {
        this.totalAmountOfQuestionToBeAsked = this.questions.length * this.players.length;
    }

    public addQuestion(q: Question) 
    {
        this.questions.push(q);
        this.updateTotalAmountOfQuestionToBeAsked();
    }

    public addPlayer(name: string) 
    {
        this.players.push(new Player(name));
        this.updateTotalAmountOfQuestionToBeAsked();
    }

    public removePlayer(name: string) 
    {
        this.players = this.players.filter(p => p.name !== name);
        this.updateTotalAmountOfQuestionToBeAsked();
    }

    public startQuiz() 
    { 
            this.isRunning = true;
        this.currentQuestionIndex = 0;
        this.currentPlayerIndex = 0;
        this.amountOfQuestionsAlreadyAsked = 0;
        this.updateTotalAmountOfQuestionToBeAsked();
    }

    public testIfAnswerIsCorrect(answer: string) 
    {
        // zet de huidige vraag in een variabelen
        const currentQuestion = this.getCurrentQuestion();

        // als er geen huidige vraag meer is is het antwoord sowiso niet juist
        if (!currentQuestion) return false;


        const found = currentQuestion.answers.find(a => a.text === answer);
        return found ? found.isCorrect : false;
    }

    public nextQuestion() 
    {
        this.amountOfQuestionsAlreadyAsked++;

        if (this.amountOfQuestionsAlreadyAsked >= this.totalAmountOfQuestionToBeAsked) {
            this.endQuiz();
            return;
        }

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.questions.length) {
            this.currentQuestionIndex = 0;
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
    }

    private endQuiz() 
    {
        this.isRunning = false;
    }

    public setGameMode(gameMode: GameMode, amountOfPlayers: number) 
    {
        this.gameMode = gameMode;
        this.numberOfPlayers = amountOfPlayers;
        this.currentPlayerIndex = 0;
        this.currentQuestionIndex = 0;
    }

    public sortPlayersByScore() 
    {
        const kopie = this.players.slice();
        return kopie.sort((a, b) => b.score - a.score);
    }

    public resetGame() 
    {
        this.isRunning = false;
        this.questions = [];
        this.players = [];
        this.gameMode = GameMode.Single;
        this.questionMode = QuestionMode.Custom;
        this.numberOfPlayers = 1;
        this.currentQuestionIndex = 0;
        this.currentPlayerIndex = 0;
        this.totalAmountOfQuestionToBeAsked = 0;
        this.amountOfQuestionsAlreadyAsked = 0;
    }
}
