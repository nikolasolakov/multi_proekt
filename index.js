let backgroundAudio = null;

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

    checkMultipleChoice(selectedAnswers, context) {
        const correct = new Set(this.correctAnswer);
        const selected = new Set(selectedAnswers);

        // Must match EXACTLY
        const allCorrectSelected =
            correct.size === selected.size &&
            [...correct].every(a => selected.has(a));

        if (!allCorrectSelected) {
            context.removeLife();
        }
    }

    selectAnswer(answer, context) {
        switch (this.type) {
            case "life":
                if (answer !== this.correctAnswer) context.removeLife();
                break;
            case "flag":
                context.flags.push([this.flag.type, answer]);
                break;
            case "multipleChoice":

                break;
            case "none":
            default: break;
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
        // APPLY MOVING TEXT FLAG
        // APPLY PERSISTENT TEXT EFFECTS
        this.context.flags.forEach(([type, value]) => {
            if (type === "movingText" && value === true) {
                qText.classList.add("moving-text");
            }
            if (type === "variatingText" && value === true) {
                qText.classList.add("variating-text");
            }
        });





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

            // MAIN WRAPPER for boxes + buttons
            const colorWrapper = document.createElement("div");
            colorWrapper.style.display = "flex";
            colorWrapper.style.justifyContent = "space-around"; // RGB left, CMY right
            colorWrapper.style.alignItems = "flex-start";       // align top
            colorWrapper.style.width = "100%";
            colorWrapper.style.marginTop = "20px";
            colorWrapper.style.flexWrap = "wrap";              // wrap on small screens

            // ===== RGB Container =====
            const rgbContainer = document.createElement("div");
            rgbContainer.style.display = "flex";
            rgbContainer.style.flexDirection = "column";
            rgbContainer.style.alignItems = "center";
            rgbContainer.style.margin = "10px";

            // RGB Box
            const rgbBox = document.createElement("div");
            rgbBox.style.backgroundColor = "black";
            rgbBox.style.width = "250px";
            rgbBox.style.height = "250px";
            rgbBox.style.border = "3px solid #333";
            rgbBox.style.display = "flex";
            rgbBox.style.flexDirection = "column";
            rgbBox.style.alignItems = "center";
            rgbBox.style.justifyContent = "center";
            const rgbText = document.createElement("p");
            rgbText.textContent = "RGB(0,0,0)";
            rgbText.style.color = "white";
            rgbBox.appendChild(rgbText);
            rgbContainer.appendChild(rgbBox);

            // RGB Buttons
            const rgbBtnWrapper = document.createElement("div");
            rgbBtnWrapper.className = "color-btns";
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
            rgbContainer.appendChild(rgbBtnWrapper);

            colorWrapper.appendChild(rgbContainer);

            // ===== CMY Container =====
            const cmyContainer = document.createElement("div");
            cmyContainer.style.display = "flex";
            cmyContainer.style.flexDirection = "column";
            cmyContainer.style.alignItems = "center";
            cmyContainer.style.margin = "10px";

            // CMY Box
            const cmyBox = document.createElement("div");
            cmyBox.style.width = "250px";
            cmyBox.style.height = "250px";
            cmyBox.style.border = "3px solid #333";
            cmyBox.style.display = "flex";
            cmyBox.style.flexDirection = "column";
            cmyBox.style.alignItems = "center";
            cmyBox.style.justifyContent = "center";
            const cmyText = document.createElement("p");
            cmyText.textContent = "CMY(0,0,0)";
            cmyBox.appendChild(cmyText);
            cmyContainer.appendChild(cmyBox);

            // CMY Buttons
            const cmyBtnWrapper = document.createElement("div");
            cmyBtnWrapper.className = "color-btns";
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
            cmyContainer.appendChild(cmyBtnWrapper);

            colorWrapper.appendChild(cmyContainer);

            // Append wrapper to container
            container.appendChild(colorWrapper);

            // Done button
            const doneBtn = document.createElement("button");
            doneBtn.textContent = "Done";
            doneBtn.style.marginTop = "20px";
            doneBtn.onclick = () => {
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

        if (question.type === "special" && question.special === "movingText") {
            container.appendChild(qText);

            // Apply movement ONLY for this question initially
            qText.classList.add("moving-text");

            let selected = null;

            question.answers.forEach(answer => {
                const btn = document.createElement("button");
                btn.textContent = answer;

                btn.onclick = () => {
                    selected = answer;
                    [...container.querySelectorAll("button")].forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                };

                container.appendChild(btn);
            });

            const doneBtn = document.createElement("button");
            doneBtn.textContent = "Done";
            doneBtn.style.marginTop = "20px";

            doneBtn.onclick = () => {
                if (!selected) {
                    alert("Избери одговор 🙂");
                    return;
                }

                if (selected === "текст што се движи е лесен за читање") {
                    this.context.flags.push(["movingText", true]);
                    this.context.removeLife();
                }


                container.classList.remove("visible");
                setTimeout(() => this.showNextQuestion(container.parentElement), 300);
            };

            container.appendChild(doneBtn);
            return container;
        }

        if (question.type === "special" && question.special === "variatingText") {
            container.appendChild(qText);

            // Apply size variation ONLY for this question initially
            qText.classList.add("variating-text");

            let selected = null;

            question.answers.forEach(answer => {
                const btn = document.createElement("button");
                btn.textContent = answer;

                btn.onclick = () => {
                    selected = answer;
                    [...container.querySelectorAll("button")].forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                };

                container.appendChild(btn);
            });

            const doneBtn = document.createElement("button");
            doneBtn.textContent = "Done";
            doneBtn.style.marginTop = "20px";

            doneBtn.onclick = () => {
                if (!selected) {
                    alert("Избери одговор 🙂");
                    return;
                }

                // WRONG belief → permanent font-size variation
                if (selected === "Текст што варира во големина е лесен за читање") {
                    this.context.flags.push(["variatingText", true]);
                }

                container.classList.remove("visible");
                setTimeout(() => this.showNextQuestion(container.parentElement), 300);
            };

            container.appendChild(doneBtn);
            return container;
        }

        if (question.type === "special" && question.special === "imageChoice") {
            container.appendChild(qText);

            const grid = document.createElement("div");
            grid.className = "image-grid";

            const selected = new Set();

            question.answers.forEach((answer, index) => {
                const option = document.createElement("div");
                option.className = "image-option";

                // Image
                const img = document.createElement("img");
                img.src = answer.img;
                img.alt = answer.label;
                option.appendChild(img);

                // Label text under the image
                const label = document.createElement("p");
                label.textContent = answer.label;
                label.style.textAlign = "center";
                label.style.marginTop = "8px";
                label.style.fontWeight = "normal";
                option.appendChild(label);

                option.onclick = () => {
                    if (selected.has(index)) {
                        selected.delete(index);
                        option.classList.remove("selected");
                    } else {
                        selected.add(index);
                        option.classList.add("selected");
                    }
                };

                grid.appendChild(option);
            });

            container.appendChild(grid);

            const doneBtn = document.createElement("button");
            doneBtn.textContent = "Done";
            doneBtn.style.marginTop = "20px";

            doneBtn.onclick = () => {
                if (selected.size === 0) {
                    alert("Избери барем една слика 🙂");
                    return;
                }

                let allCorrect = true;

                question.answers.forEach((answer, index) => {
                    const isSelected = selected.has(index);
                    if ((answer.correct && !isSelected) || (!answer.correct && isSelected)) {
                        allCorrect = false;
                    }
                });

                if (!allCorrect) removeLife();

                container.classList.remove("visible");
                setTimeout(() => this.showNextQuestion(container.parentElement), 300);
            };

            container.appendChild(doneBtn);
            return container;
        }



        if (question.type === "multipleChoice") {
            container.appendChild(qText);

            const selected = new Set();

            question.answers.forEach(answer => {
                const btn = document.createElement("button");
                btn.textContent = answer;

                btn.onclick = () => {
                    if (selected.has(answer)) {
                        selected.delete(answer);
                        btn.classList.remove("active");
                    } else {
                        selected.add(answer);
                        btn.classList.add("active");
                    }
                };

                container.appendChild(btn);
            });

            const doneBtn = document.createElement("button");
            doneBtn.textContent = "Done";
            doneBtn.style.marginTop = "20px";

            doneBtn.onclick = () => {
                if (selected.size === 0) {
                    alert("Select at least one answer!");
                    return;
                }

                question.checkMultipleChoice([...selected], this.context);

                container.classList.remove("visible");
                setTimeout(() => this.showNextQuestion(container.parentElement), 300);
            };

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
        "Кое од овие овозможува брзо пребарување и интерактивно читање? (hint: двоен клик ќе ти помогне)",
        ["Хиперлинк", "Обична веб страна", "Тетратка", "Манга"],
        { type: "special", special: "hyperlink" }
    ),
    new Question(
        "Фонт претставува елемент од фамилија фонтови со?",
        ["Големина", "Стил", "Тежина", "Резолуција", "Позиција"],
        {
            type: "multipleChoice",
            correctAnswer: ["Големина", "Стил", "Тежина"]
        }
    ),
    new Question(
        "Што од ова е точно за текст:",
        ["текст што се движи е лесен за читање", "текст што се движи е тежок за читање"],
        { type: "special", special: "movingText" }
    ),
    new Question(
        "Што од ова е точно за текст:",
        ["Текст што варира во големина е лесен за читање", "текст што не варира е лесен за читање"],
        { type: "special", special: "variatingText" }
    ),
    new Question(
        "Koe од понудените е пример за линеарна мултимедија? ",
        [
            { label: "ЦД", img: "images/cds.jpg", correct: false },
            { label: "Виртуелна реалност", img: "images/vr.jpg", correct: false },
            { label: "видео", img: "images/video.jpg", correct: true },
            { label: "текст", img: "images/text.jpg", correct: true }
        ],
        { type: "special", special: "imageChoice" }
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
    const screen = document.getElementById("game-over-screen");
    screen.classList.add("show");  // show overlay
    if (backgroundAudio) backgroundAudio.pause();
}

function restartGame() {
    const screen = document.getElementById("game-over-screen");
    screen.classList.remove("show"); // hide overlay
    if (backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio.remove();
        backgroundAudio = null;
    }
    startGame();
}
