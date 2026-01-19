let flags = {};

document.addEventListener('DOMContentLoaded', (event) => {
    startGame();
})
function startGame() {
    let lives=document.getElementById('lives');
    setTimeout(() =>{
        lives.classList.add('appear');
    },  2000);










}

function removeLife() {
    let life=document.getElementById('lives-box');
    if (life.children.length > 0) {
        life.removeChild(life.lastElementChild);
    }
    if (life.children.length === 0) {
        setTimeout(() =>{
            //TODO game over screen
            alert("Game Over");
        },  1000);
    }
}