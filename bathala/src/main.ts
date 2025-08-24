import StartGame from './game/main';

let game: Phaser.Game;

document.addEventListener('DOMContentLoaded', () => {
    game = StartGame('game-container');
    
    // Handle window resize
    const resize = () => {
        if (game && game.scale) {
            game.scale.resize(window.innerWidth, window.innerHeight);
        }
    };
    
    window.addEventListener('resize', resize);
    
    // Initial resize to fit the window
    resize();
});