[🎮 Interactive Quiz Game
-----------------------------------------------------------

A web-based quiz game built with HTML, CSS, and JavaScript, featuring interactive multimedia elements, color/volume customization, and lives management. Designed to work on both desktop and mobile devices.

🚀 Features
-----------------------------------------------------------

Multiple question types: text questions, special interactive questions (volume slider, color models, text styles, hyperlinks).

Lives system: 3 lives per game, losing all shows a Game Over screen.

Color & style customization: change question text color, background, and text styles (bold, italic, underline).

RGB & CMY interactive boxes: visual demonstration of additive and subtractive color models.

Audio integration: volume control for background sounds.

Responsive design: works well on PC, tablets, and mobile devices.


🎯 Installation
-----------------------------------------------------------

Clone the repository:

git clone https://github.com/nikolasolakov/quiz-game.git


Open index.html in your favorite browser.

Enjoy the game!

⚠️ No server or build tools required — everything runs in the browser.

📂 Project Structure
-----------------------------------------------------------

quiz-game/
----------------
├─ index.html         # Main HTML file

├─ style.css          # Game styling

├─ index.js           # Game logic

├─ images/            # Hearts and other assets

├─ sounds/            # Audio files

└─ README.md          # Project documentation

🛠 How It Works
-----------------------------------------------------------

Questions: Defined in index.js as Question objects.

Lives system: Heart images are displayed in the top-right; removeLife() handles incorrect answers.

Special questions: Use a type: "special" flag in the constructor. Examples:

Volume control: Adjust background audio.

Text styles: Toggle bold, italic, underline.

Color models: RGB (additive) and CMY (subtractive) demonstration.

Hyperlink: Double-click opens external links.

Responsive design: CSS media queries adjust layout, font sizes, and boxes for mobile.

🖱 Controls
-----------------------------------------------------------
Click: Select an answer.

Double-click: Open hyperlink (if applicable).

Done button: Confirm special question selections (e.g., text style, RGB/CMY).

🎨 Technologies Used
-----------------------------------------------------------

HTML5

CSS3 (Flexbox, Media Queries, Transitions)

Vanilla JavaScript

📱 Responsive Design
-----------------------------------------------------------

Desktop](): full-width question boxes, RGB/CMY boxes side by side.

Mobile: stacked layout, buttons and boxes scale appropriately.
