let backgroundAudio = null; // single audio instance for special questions

class Question {
    constructor(text, answers, options = {}) {
        this.text = text;
        this.answers = answers;
        this.correctAnswer = options.correctAnswer || null;
        this.type = options.type || "none";
        this.special = options.special || null;
        this.flag = (this.type === "flag")
            ? { type: options.flagType || "color" }
            : null;
    }

    selectAnswer(answer, context) {
        switch (this.type) {
            case "life":
                if (answer !== this.correctAnswer) context.removeLife();
                break;
            case "flag":
                context.flags.push([this.flag.type, answer]);
                break;
        }
    }
}

class Quiz {
    constructor(questions, context) {
        this.questions = questions;
        this.currentIndex = 0;
        this.context = context;
    }

    nextQuestion() {
        if (this.currentIndex >= this.questions.length) return null;
        return this.questions[this.currentIndex++];
    }

    createQuestionContainer(question) {
        const container = document.createElement("div");
        container.className = "question-container";

        const qText = document.createElement("p");
        qText.textContent = question.text;

        // APPLY FLAGS
        this.context.flags.forEach(([type, value]) => {
            if (type === "BGcolor") {
                const colors = {
                    "Бела": "white",
                    "Жолта": "yellow",
                    "Плава": "lightblue",
                    "Розева": "pink",
                    "Црна": "black"
                };
                document.body.style.backgroundColor = colors[value] || "white";
            }

            if (type === "color") {
                container.style.backgroundColor =
                    { "Бела": "white", "Жолта": "yellow", "Плава": "lightblue", "Розева": "pink", "Црна": "black" }[value];
            }

            if (type === "textColor") {
                qText.style.color =
                    { "Бела": "white", "Жолта": "yellow", "Плава": "lightblue", "Розева": "pink", "Црна": "black" }[value];
            }

            if (type === "textStyle") {
                qText.classList.add(value);
            }
        });

        /* ======================
           SPECIAL: VOLUME
        ====================== */
        if (question.type === "special" && question.special === "volume") {
            container.appendChild(qText);

            if (backgroundAudio) {
                backgroundAudio.pause();
                backgroundAudio.remove();
            }

            backgroundAudio = document.createElement("audio");
            backgroundAudio.src = "sounds/wind-chimes-37762.mp3";
            backgroundAudio.loop = true;
            backgroundAudio.autoplay = true;
            container.appendChild(backgroundAudio);

            const volDiv = document.createElement("div");
            volDiv.id = "volume-control";
            volDiv.innerHTML = `
                <label>Volume</label><br>
                <input type="range" min="0" max="100" value="50"><br>
                <button>Done</button>
            `;
            container.appendChild(volDiv);

            const slider = volDiv.querySelector("input");
            slider.addEventListener("input", () => {
                backgroundAudio.volume = slider.value / 100;
            });

            volDiv.querySelector("button").onclick = () => {
                container.classList.remove("visible");
                setTimeout(() => this.showNextQuestion(container.parentElement), 300);
            };

            return container;
        }

        /* ======================
           SPECIAL: TEXT STYLE
        ====================== */
        if (question.type === "special" && question.special === "textStyle") {
            container.appendChild(qText);

            const styles = ["bold", "italic", "underline"];
            const selected = new Set();

            styles.forEach(style => {
                const btn = document.createElement("button");
                btn.textContent = style.charAt(0).toUpperCase() + style.slice(1);

                btn.onclick = () => {
                    if (selected.has(style)) {
                        selected.delete(style);
                        qText.classList.remove(style);
                        btn.classList.remove("active");
                    } else {
                        selected.add(style);
                        qText.classList.add(style);
                        btn.classList.add("active");
                    }
                };

                container.appendChild(btn);
            });

            const doneBtn = document.createElement("button");
            doneBtn.textContent = "Done";
            doneBtn.style.marginTop = "20px";

            doneBtn.onclick = () => {
                selected.forEach(style =>
                    this.context.flags.push(["textStyle", style])
                );
                container.classList.remove("visible");
                setTimeout(() => this.showNextQuestion(container.parentElement), 300);
            };

            container.appendChild(doneBtn);
            return container;
        }
        if (question.type === "special" && question.special === "colorModels") {
            container.appendChild(qText);

            // Initialize color states
            const rgb = { r: 0, g: 0, b: 0 };
            const cmy = { c: 0, m: 0, y: 0 };

            // Wrapper for the boxes (outside the question container)
            const boxesWrapper = document.createElement("div");
            boxesWrapper.className = "color-boxes-wrapper"; // Mobile-friendly wrapper

            // RGB Box
            const rgbBox = document.createElement("div");
            rgbBox.className = "color-box";
            const rgbText = document.createElement("p");
            rgbText.textContent = "RGB(0,0,0)";
            rgbBox.appendChild(rgbText);
            boxesWrapper.appendChild(rgbBox);

            // CMY Box
            const cmyBox = document.createElement("div");
            cmyBox.className = "color-box";
            const cmyText = document.createElement("p");
            cmyText.textContent = "CMY(0,0,0)";
            cmyBox.appendChild(cmyText);
            boxesWrapper.appendChild(cmyBox);

            // Append boxes to parent (outside container visually)
            setTimeout(() => {
                if (container.parentElement) {
                    container.parentElement.appendChild(boxesWrapper);
                }
            }, 0);

            // RGB buttons inside container
            const rgbBtnWrapper = document.createElement("div");
            rgbBtnWrapper.className = "btn-wrapper";
            ["r", "g", "b"].forEach(ch => {
                const btn = document.createElement("button");
                btn.textContent = ch.toUpperCase();
                btn.onclick = () => {
                    rgb[ch] = Math.min(255, rgb[ch] + 15);
                    rgbBox.style.backgroundColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
                    rgbText.textContent = `RGB(${rgb.r},${rgb.g},${rgb.b})`;
                };
                rgbBtnWrapper.appendChild(btn);
            });
            container.appendChild(rgbBtnWrapper);

            // CMY buttons inside container
            const cmyBtnWrapper = document.createElement("div");
            cmyBtnWrapper.className = "btn-wrapper";
            ["c", "m", "y"].forEach(ch => {
                const btn = document.createElement("button");
                btn.textContent = ch.toUpperCase();
                btn.onclick = () => {
                    cmy[ch] = Math.min(100, cmy[ch] + 15);
                    const r = Math.round(255 * (1 - cmy.c / 100));
                    const g = Math.round(255 * (1 - cmy.m / 100));
                    const b = Math.round(255 * (1 - cmy.y / 100));
                    cmyBox.style.backgroundColor = `rgb(${r},${g},${b})`;
                    cmyText.textContent = `CMY(${cmy.c},${cmy.m},${cmy.y})`;
                };
                cmyBtnWrapper.appendChild(btn);
            });
            container.appendChild(cmyBtnWrapper);

            // Done button
            const doneBtn = document.createElement("button");
            doneBtn.textContent = "Done";
            doneBtn.style.marginTop = "15px";
            doneBtn.onclick = () => {
                boxesWrapper.remove(); // remove outside boxes
                container.classList.remove("visible");
                setTimeout(() => this.showNextQuestion(container.parentElement), 300);
            };
            container.appendChild(doneBtn);

            return container;
        }

        if (question.type === "special" && question.special === "hyperlink") {
            container.appendChild(qText);

            let selectedAnswer = null;

            // Ensure correct answer is set
            if (!question.correctAnswer) question.correctAnswer = "Хиперлинк";

            const answerButtons = question.answers.map(answer => {
                const btn = document.createElement("button");
                btn.textContent = answer;

                btn.addEventListener("click", () => {
                    selectedAnswer = answer;               // save the answer
                    // remove "active" from all buttons
                    answerButtons.forEach(b => b.classList.remove("active"));
                    // add "active" to the clicked button
                    btn.classList.add("active");
                });


                // Double click → open hyperlink if this is the hyperlink option
                if (answer === "Хиперлинк") {
                    const url = "https://en.wikipedia.org/wiki/Hyperlink";
                    btn.addEventListener("dblclick", e => {
                        e.stopPropagation(); // prevent single-click select
                        window.open(url, "_blank");
                    });
                }

                container.appendChild(btn);
                return btn;
            });

            // Done button
            const doneBtn = document.createElement("button");
            doneBtn.textContent = "Done";
            doneBtn.style.marginTop = "20px";

            doneBtn.addEventListener("click", () => {
                if (!selectedAnswer) {
                    alert("Please select an answer before clicking Done!");
                    return;
                }

                // Check if there is a correct answer for this question
                if (question.correctAnswer && selectedAnswer !== question.correctAnswer) {
                    // manually remove a life
                    if (this.context.removeLife) this.context.removeLife();
                }

                // Optionally save the selected answer in context if needed
                if (this.context.flags && question.type === "flag") {
                    this.context.flags.push([question.flag?.type, selectedAnswer]);
                }

                container.classList.remove("visible");
                setTimeout(() => this.showNextQuestion(container.parentElement), 300);
            });


            container.appendChild(doneBtn);
            return container;
        }


        container.appendChild(qText);

        question.answers.forEach(answer => {
            const btn = document.createElement("button");
            btn.textContent = answer;
            btn.onclick = () => {
                container.classList.remove("visible");
                setTimeout(() => {
                    question.selectAnswer(answer, this.context);
                    this.showNextQuestion(container.parentElement);
                }, 300);
            };
            container.appendChild(btn);
        });

        return container;
    }

    showNextQuestion(parent) {
        parent.innerHTML = "";
        const q = this.nextQuestion();

        if (!q) {
            const end = document.createElement("p");
            end.textContent = "Quiz Finished!";
            end.className = "question-container visible";
            parent.appendChild(end);
            return;
        }

        const container = this.createQuestionContainer(q);
        parent.appendChild(container);
        setTimeout(() => container.classList.add("visible"), 20);
    }
}

/* ======================
   GAME CONTEXT
====================== */
const game = {
    lives: 3,
    flags: [],
    removeLife
};

const questions = [
    new Question("Каква боја сакаш да ти е позадината на прашањата?", ["Бела", "Жолта", "Плава", "Розева", "Црна"], { type: "flag", flagType: "color" }),
    new Question("Каква боја сакаш да ти е позадината?", ["Бела", "Жолта", "Плава", "Розева", "Црна"], { type: "flag", flagType: "BGcolor" }),
    new Question("Каква боја сакаш да ти е текстот?", ["Бела", "Жолта", "Плава", "Розева", "Црна"], { type: "flag", flagType: "textColor" }),
    new Question("Смени гласноста на звукот:", [], { type: "special", special: "volume" }),
    new Question("Боите се основни за визуелно доживување поради реакциите на фото-рецепторите во човечкото око " +
        ", еве некои модели на боја кои постојат. RGB е адитивен модел, белата се добива со присуство на сите, додека CMY е суптрактивен, белата е отсуството на сите:", [], { type: "special", special: "colorModels" }),
    new Question("Каков стил сакаш да ти има текстот?", [], { type: "special", special: "textStyle" }),
    new Question("Кое од следниве најдобро опишува интерактивна содржина?", ["Гледање видео на слушалки", "решавање онлајн квиз со кликање одговори", "powerpoint презентација што сама се менува", "гледање филм во кино"], { correctAnswer: "решавање онлајн квиз со кликање одговори", type: "life" }),
    new Question("Што ја прави дигиталната содржина интерактивна? ", ["Кликање", "Бирање опции", "гледање", "слушање музика"], { correctAnswer: "Бирање опции", type: "life" }),
    new Question("Дали само гледаш – или учествуваш? ", ["Гледам", "Учествувам"], { type: "none" }),
    new Question(
        "Кое од овие овозможува брзо пребарување и интерактивно читање? (hint: дупли клик ќе ти помогне)",
        ["Хиперлинк", "Обична веб страна", "Тетратка", "Манга"],
        { type: "special", special: "hyperlink" }
    ),




    new Question("What is 2+2?", ["3", "4"], { correctAnswer: "4", type: "life" }),
    new Question("Say hi!", ["Hi", "Hello"], { type: "none" })
];

const quiz = new Quiz(questions, game);

document.addEventListener("DOMContentLoaded", startGame);

/* ======================
   GAME FUNCTIONS
====================== */
function startGame() {
    game.lives = 3;
    game.flags = [];
    quiz.currentIndex = 0;

    document.body.style.backgroundColor = "white";

    const livesBox = document.getElementById("lives-box");
    [...livesBox.children].forEach(l => l.style.display = "inline-block");

    quiz.showNextQuestion(document.getElementById("quiz-container"));
}

function removeLife() {
    const lives = [...document.getElementById("lives-box").children];
    for (let i = lives.length - 1; i >= 0; i--) {
        if (lives[i].style.display !== "none") {
            lives[i].style.display = "none";
            game.lives--;
            break;
        }
    }
    if (game.lives <= 0) setTimeout(showGameOver, 400);
}

function showGameOver() {
    document.getElementById("game-over-screen").classList.remove("hidden");
    if (backgroundAudio) backgroundAudio.pause();
}

function restartGame() {
    document.getElementById("game-over-screen").classList.add("hidden");
    if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio.remove();
        backgroundAudio = null;
    }
    startGame();
}
