import Question from "../models/Question";
import { IApiQuestion } from "../types/interfaces/IApiQuestion";
import { displayAlert } from "../utils";

export class QuestionService {

    baseUrl: string = "https://opentdb.com/api.php?";
    categoryUrl: string = "https://opentdb.com/api_category.php";

    constructor() {
    }

    getCategories = async () => {

        try {

            const response = await fetch(this.categoryUrl);

            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }

            const data = await response.json();

            return data.trivia_categories;

        } catch (error) {

            displayAlert("Error loading categories");
            console.error(error);

            return [];
        }
    }

    getQuestions = async (
        amount: number,
        category: number,
        difficulty: string
    ) => {

        try {

            const url =
                `${this.baseUrl}amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;

            console.log("Fetching:", url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch questions");
            }

            const data = await response.json();

            console.log("API DATA:", data);

            if (data.response_code !== 0) {
                throw new Error("No questions found");
            }

            return this.mapQuestionsToQuestionModel(data.results);

        } catch (error) {

            displayAlert("Error loading questions");
            console.error(error);

            return [];
        }
    }

    mapQuestionsToQuestionModel = (
        questions: IApiQuestion[]
    ): Question[] => {

        const questionList: Question[] = [];

        for (const q of questions) {

            const question = new Question(q.question);

            question.addAnswer({
                text: q.correct_answer,
                isCorrect: true
            });

            q.incorrect_answers.forEach(a => {

                question.addAnswer({
                    text: a,
                    isCorrect: false
                });

            });

            questionList.push(question);
        }

        return questionList;
    }
}