const selector = {
    minefield: '.minefield',
    mineblock: '.mineblock',
    resetButton: '.button-reset',
}

class Minesweeper{
    constructor(container) {
        this.container = container;
        this.minefield = this.container.querySelector(selector.minefield);
        this.resetButton = this.container.querySelector(selector.resetButton);
        // this.fieldWidth = this.minefield.offsetWidth;  for future use!
        // this.fieldHeight = this.minefield.offsetHeight; for future use!

        this.initEvents();
    }

    initMinefield() { // places blocks
        const block = '<div class="mineblock"></div>';
        let gameHasStarted = false;
        let gameHasEnded = false;
        for (let i = 0; i < 280; i+=1) { // places a mineblock
            this.minefield.insertAdjacentHTML('afterbegin', block);
        }
        this.blocks = this.container.querySelectorAll(selector.mineblock); // all blocks
        this.blocks.forEach(mineblock => {
            const index = Array.prototype.indexOf.call(this.blocks, mineblock); // index of current block in foreach
            mineblock.addEventListener('click', () => {
                if (!gameHasEnded) { // tests if game has ended
                    if (!mineblock.classList.contains('flagged')) mineblock.classList.add('mineblock--revealed'); // reveals block
                    if (!gameHasStarted) { // only on first block reveal
                        this.initBombs(index);
                        this.initNumbers();
                        gameHasStarted = true;
                    }
                    if (!mineblock.classList.contains('flagged')) this.mineScan(index);
                    // game ends if you reveal a bomb
                    if (mineblock.classList.contains('mineblock--revealed') && mineblock.classList.contains('bomb')) gameHasEnded = true;
                }
            });
            mineblock.addEventListener('contextmenu', (ev) => { // on right click
                this.placeFlag(index);
                ev.preventDefault(); // prevents default menu from opening
                return false;
            });
        });
    }

    initBombs(mineblockIndex) { // places mines
        let bombs = 44; // set difficulty here
        while (bombs !== 0) {
            const random = (Math.floor(Math.random() * 280)); // random number from 0 to number of blocks - 1
            // checks if there is already a bomb on the rolled block and if it's the first block revealed
            if (!this.blocks[random].classList.contains('bomb') && random !== mineblockIndex) {
                this.blocks[random].classList.add('bomb');
                bombs -= 1;
            }
        }
    }

    initNumbers() { // places numbers
        this.blocks = this.container.querySelectorAll(selector.mineblock);
        this.blocks.forEach(mineblock => {
            let adjecentBlocks = [-15, -14, -13, -1, 1, 13, 14, 15]; // positions of all adjecent blocks to the one selected
            let nearbyBombs = 0;
            const index = Array.prototype.indexOf.call(this.blocks, mineblock);
            if (index % 14 === 0) adjecentBlocks = [-14, -13, 1, 14, 15]; // positions if selected block is on the left wall
            else if ((index + 1) % 14 === 0) adjecentBlocks = [-15, -14, -1, 13, 14]; // if it's on the right wall
            adjecentBlocks.forEach(adjecentBlock => {
                // tests for out of bounds indexes
                if (((index + adjecentBlock) < 0 || (index + adjecentBlock) > 279)) adjecentBlock = 0; // eslint-disable-line
                if (this.blocks[index + adjecentBlock].classList.contains('bomb')) { // increments number based on nearby bombs
                    nearbyBombs += 1;
                }
            });
            if (nearbyBombs > 0 && !mineblock.classList.contains('bomb')) { // tests for positive number of bombs and if block is a bomb
                mineblock.appendChild(document.createElement('p')).appendChild(document.createTextNode(`${nearbyBombs}`));
            }    
        });
    }

    resetGame() { // resets game
        this.resetButton.addEventListener('click', () => {
            this.minefield.innerHTML = '';
            this.initEvents();
        })
    }

    mineScan(mineblockIndex) { // scans for nearby empty blocks and reveals them
        let adjecentBlocks = [-15, -14, -13, -1, 1, 13, 14, 15]; // positions of all adjecent blocks to the one selected
        let nearbyBombs = 0;
        if (mineblockIndex % 14 === 0) adjecentBlocks = [-14, -13, 1, 14, 15]; // positions if selected block is on the left wall
        else if ((mineblockIndex + 1) % 14 === 0) adjecentBlocks = [-15, -14, -1, 13, 14]; // if it's on the right wall
        adjecentBlocks.forEach(adjecentBlock => {
            // tests for out of bounds indexes
            if ((mineblockIndex + adjecentBlock) < 0 || (mineblockIndex + adjecentBlock) > 279) adjecentBlock = 0; // eslint-disable-line
            if (this.blocks[mineblockIndex + adjecentBlock].classList.contains('bomb')) { // increments number based on nearby bombs
                nearbyBombs += 1;
            }
        });
        if (nearbyBombs === 0 && !this.blocks[mineblockIndex].classList.contains('bomb')) {   
            adjecentBlocks.forEach(adjecentBlock => {
                // tests for out of bounds indexes
                if ((mineblockIndex + adjecentBlock) < 0 || (mineblockIndex + adjecentBlock) > 279) adjecentBlock = 0; // eslint-disable-line
                // tests for already revealed blocks
                if (!this.blocks[mineblockIndex + adjecentBlock].classList.contains('mineblock--revealed')) {
                    this.blocks[mineblockIndex + adjecentBlock].classList.add('mineblock--revealed');
                    // removes flags if there are any
                    if (this.blocks[mineblockIndex + adjecentBlock].classList.contains('flagged')) {
                        this.blocks[mineblockIndex + adjecentBlock].classList.remove('flagged');
                    }
                    this.mineScan(mineblockIndex + adjecentBlock); // recursion
                }
            });
        }
    }

    placeFlag(mineblockIndex) { // places flags
        // checks if the selected blocks is already revealed
        if (!this.blocks[mineblockIndex].classList.contains('mineblock--revealed')) {
            this.blocks[mineblockIndex].classList.toggle('flagged');
        }
    }

    initEvents() {
        this.initMinefield();
        this.resetGame();
    }
}

export default Minesweeper;