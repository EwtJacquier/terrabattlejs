import battle from './battle/battle';

class Game {
    setBattle(battle){
        this.battle = battle;
    }
}

game = new Game();

document.addEventListener("DOMContentLoaded", function() {
    game.setBattle(battle()) ;
});