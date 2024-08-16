class Collider {
    constructor(element){
        const rect = element.getBoundingClientRect();

        this.top = rect.top + window.scrollY;
        this.left = rect.left + window.scrollX;
        this.right = rect.right + window.scrollX;
        this.bottom = rect.bottom + window.scrollY;
    }
}

class GridCell {
    constructor(element, row, column){
        this.ref = element;
        this.row = row;
        this.column = column;
    }
}

class Character {
    constructor(id, name){
        this.id = id;
        this.name = name;
    }

    getId(){
        return this.id;
    }
}

class Card {
    constructor(character, type){
        this.ref = this.createCardFromCharacter(character, type);
        this.character = character;
        this.lastGridCell = null;
        this.currentGridCell = null;
    }

    getContainerPosition() {
        return new Collider(this.ref.parentNode);
    }

    createCardFromCharacter(character, type) {
        let gameCard = document.createElement('div')
        gameCard.id = 'game__card-' + character.getId();
        gameCard.classList.add('game__card');
        gameCard.classList.add('game__card-'+type);
        gameCard.style.setProperty('--top','0');
        gameCard.style.setProperty('--left','0');
        document.querySelector('.game__grid__characters-container').appendChild(gameCard);
        return gameCard;
    }

    goToCell(cell) {
        const containerPosition = this.getContainerPosition();
        const cellPosition = new Collider(cell.ref);
        
        this.ref.style.setProperty('--left', ( cellPosition.left - containerPosition.left ) + 'px');
        this.ref.style.setProperty('--top', ( cellPosition.top - containerPosition.top ) + 'px');
        this.currentGridCell = cell;
    }

    updatePosition(x,y){
        const containerPosition = this.getContainerPosition();
        const cardPosition = new Collider(this.ref);

        this.ref.style.setProperty('--left', ( (x - containerPosition.left) - (this.ref.offsetWidth / 2) ) + 'px');
        this.ref.style.setProperty('--top', ( (y - containerPosition.top) - (this.ref.offsetHeight / 2) ) + 'px');
        
        let foundCell = false;

        game.battle.gridCells.forEach((cell) => {
            const padding = this.ref.offsetWidth / 2;
            const cellPosition = new Collider(cell.ref);
            
            if (
                cardPosition.right >= cellPosition.left + padding && 
                cardPosition.left <= cellPosition.right - padding && 
                cardPosition.bottom >= cellPosition.top + padding &&
                cardPosition.top <= cellPosition.bottom - padding &&
                !foundCell
            ){
                
                if (!cell.ref.classList.contains('game__grid__cell--hover')){
                    cell.ref.classList.add('game__grid__cell--hover');
                }

                let cardInCell = game.battle.playerCards.find((card) => card.character.id !== this.character.id && card.currentGridCell.row === cell.row && card.currentGridCell.column === cell.column);

                if ( undefined !== cardInCell ){
                    cardInCell.goToCell(this.lastGridCell);
                }
                
                this.lastGridCell = cell;

                foundCell = true;
            }
            else{
                if (cell.ref.classList.contains('game__grid__cell--hover')){
                    cell.ref.classList.remove('game__grid__cell--hover');
                }
            }
        });
    }

    drag() {
        this.ref.classList.add('game__card--dragging');
    }

    release() {
        this.ref.classList.remove('game__card--dragging');

        if (this.lastGridCell){
            this.goToCell(this.lastGridCell);
        }

        game.battle.gridCells.forEach((cell) => {
            if (cell.ref.classList.contains('game__grid__cell--hover')){
                cell.ref.classList.remove('game__grid__cell--hover');
            }
        });
    }
}

class Battle {
    constructor(){
        this.draggingCard = null;
        this.gridCells = [];
        this.playerCards = this.fetchPlayerCards();

        let row = 1;
        let column = 1;

        document.querySelectorAll('.game__grid__cell').forEach((cell) => {
            this.gridCells.push(new GridCell(cell, row, column));

            if (++column === 7){
                column = 1;
                row++;
            }
        });

        this.instantiatePlayers([42,43,44,45,46,47]);
        this.bindEvents();
    }

    fetchPlayerCards(){
        return [
            new Card(new Character(1, 'Cloud'), 'player'),
            new Card(new Character(2, 'Tifa'), 'player'),
            new Card(new Character(3, 'Barret'), 'player'),
            new Card(new Character(4, 'Aerith'), 'player'),
            new Card(new Character(5, 'Red XII'), 'player'),
            new Card(new Character(6, 'Vincent'), 'player'),
        ]
    }

    setDraggingCard(card){
        if (card) {
            card.drag();
        }
        else if (this.draggingCard) {
            this.draggingCard.release();
        }

        this.draggingCard = card;
    }

    findCard(element){
        return this.playerCards.find((card) => card.ref.id === element.id);
    }

    bindEvents(){
        document.addEventListener('mousedown', this.mouseDown, false);
        document.addEventListener('mousemove', this.mouseMove, false);
        document.addEventListener('mouseup', this.mouseUp, false);
        document.addEventListener('touchstart', this.mouseDown, false);
        document.addEventListener('touchmove', this.mouseMove, false);
        document.addEventListener('touchend', this.mouseUp, false);
        window.addEventListener('resize', this.updateCardsPosition, false);
    }

    mouseDown(e) {
        if (e.target && e.target.classList.contains('game__card')){
            const cardFound = game.battle.findCard(e.target);

            if (cardFound){
                game.battle.setDraggingCard(cardFound);

                const x = undefined === e.touches ? e.clientX : e.touches[0].clientX;
                const y = undefined === e.touches ? e.clientY : e.touches[0].clientY;

                game.battle.draggingCard.updatePosition(x, y);
            }
        }
    }
    
    mouseMove(e) {
        if (game.battle.draggingCard){
            const x = undefined === e.touches ? e.clientX : e.touches[0].clientX;
            const y = undefined === e.touches ? e.clientY : e.touches[0].clientY;

            game.battle.draggingCard.updatePosition(x, y);
        }
    }
    
    mouseUp(e) {
        game.battle.setDraggingCard(null);
    }

    instantiatePlayers(characterCellsIndexes){
        characterCellsIndexes.forEach((index) => {
            this.playerCards.every((card) => {
                if (!card.currentGridCell) {
                    card.goToCell(this.gridCells[index]);

                    return false;
                }

                return true;
            })
        });
    }

    updateCardsPosition(){
        game.battle.playerCards.forEach((card) => {
            card.goToCell(card.currentGridCell);
        });
    }
}

export default () => {
    return new Battle();
};