const selector = {
    minefield: '.minefield',
    mineblock: '.mineblock',
    resetButton: '.button-reset',
    flagButton: '.button-flag',
    ruleButton: '.button-rules',
    rules: '.rules',
    closeRulesButton: '.button-close-rules',
    flagCounter: '.flag-counter',
    timer: '.timer',
}

class Minesweeper{
    constructor(container) {
        this.container = container;
        this.minefield = this.container.querySelector(selector.minefield);
        this.ruleButton = this.container.querySelector(selector.ruleButton);
        this.rules = this.container.querySelector(selector.rules);
        this.closeRulesButton = this.container.querySelector(selector.closeRulesButton);
        this.resetButton = this.container.querySelector(selector.resetButton);
        this.flagButton = this.container.querySelector(selector.flagButton);
        this.flagCounter = this.container.querySelector(selector.flagCounter);
        this.timer = this.container.querySelector(selector.timer);
        this.bombs = null;
        this.safeBlocks = null;
        this.unplacedFlags = null;
        this.gameHasStarted = false;
        this.gameHasEnded = false;

        this.initEvents();
    }

    initMinefield() { // places blocks
        const block = '<div class="mineblock"></div>';
        this.gameHasStarted = false;
        this.gameHasEnded = false;
        let time;
        this.unplacedFlags = 0;
        this.flagCounter.innerHTML = '000';
        this.timer.innerHTML = '000';
        this.safeBlocks = 236;
        this.resetButton.classList.remove('button-reset-game-over'); // sets reset button icon to default
        for (let i = 0; i < 280; i+=1) { // places a mineblock
            this.minefield.insertAdjacentHTML('afterbegin', block);
        }
        this.blocks = this.container.querySelectorAll(selector.mineblock); // all blocks
        this.blocks.forEach(mineblock => {
            const index = Array.prototype.indexOf.call(this.blocks, mineblock); // index of current block in foreach
            mineblock.onpointerdown = () => { // eslint-disable-line
                this.resetButton.classList.add('button-reset-alt');
            }
            mineblock.onpointerup = () => { // eslint-disable-line
                this.resetButton.classList.remove('button-reset-alt');
            }
            mineblock.addEventListener('click', () => {
                if (!this.gameHasEnded) { // tests if game has ended
                    if (this.flagButton.classList.contains('button-flag-active')) {
                        this.placeFlag(index);
                    } else {
                        if (!mineblock.classList.contains('flagged')) { // tests if block is flagged
                            mineblock.classList.add('mineblock--revealed'); // reveals block
                            if (!mineblock.classList.contains('bomb')) this.safeBlocks -= 1;
                            if (this.safeBlocks === 0) { // win condition
                                this.gameHasEnded = true;
                                alert(`🥳 ${Math.floor((Date.now() - time)*0.001)} seconds 🥳`);
                            }
                        }
                        if (!this.gameHasStarted) { // only on first block reveal
                            this.initBombs(index);
                            this.updateUnplacedFlags();
                            this.initNumbers();
                            this.gameHasStarted = true;
                            time = Date.now();
                            this.startTimer();
                        }
                        if (!mineblock.classList.contains('flagged')) this.mineScan(index);
                        // game ends if you reveal a bomb
                        if (mineblock.classList.contains('mineblock--revealed') && mineblock.classList.contains('bomb')){
                            this.gameHasEnded = true;
                            this.resetButton.classList.add('button-reset-game-over');
                            alert('😵 game over');
                        }
                    }
                }
            });
            mineblock.addEventListener('contextmenu', (ev) => { // on right click
                if (this.gameHasStarted) this.placeFlag(index);
                ev.preventDefault(); // prevents default menu from opening
                return false;
            });
        });
    }

    initBombs(mineblockIndex) { // places mines
        this.bombs = 44; // set difficulty here
        this.unplacedFlags = this.bombs;
        while (this.bombs !== 0) {
            const random = (Math.floor(Math.random() * 280)); // random number from 0 to number of blocks - 1
            // checks if there is already a bomb on the rolled block and if it's the first block revealed
            if (!this.blocks[random].classList.contains('bomb') && random !== mineblockIndex) {
                this.blocks[random].classList.add('bomb');
                this.bombs -= 1;
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
                // adds <p> element with number of nearby bombs inside
                mineblock.appendChild(document.createElement('p')).appendChild(document.createTextNode(`${nearbyBombs}`));
            }    
        });
    }

    openRules() {
        this.ruleButton.addEventListener('click', () => {
            this.rules.style.display = 'grid';
        });
    }

    closeRules() {
        this.closeRulesButton.addEventListener('click', () => {
            this.rules.style.display = 'none';
        });
    }

    resetGame() { // resets game
        this.resetButton.addEventListener('click', () => {
            this.minefield.innerHTML = '';
            this.initMinefield();
        })
    }

    flagMode() {
        this.flagButton.addEventListener('click', () => {
            this.flagButton.classList.toggle('button-flag-active');
        });
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
                    this.safeBlocks -= 1;
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
            this.blocks[mineblockIndex].classList.toggle('flag-drop'); // creates a drop effect
            this.blocks[mineblockIndex].classList.toggle('flagged');
            if (this.blocks[mineblockIndex].classList.contains('flagged')) {
                this.unplacedFlags -= 1;
            } else {
                this.unplacedFlags += 1;
            }
            this.updateUnplacedFlags();
            setTimeout(() => {this.blocks[mineblockIndex].classList.toggle('flag-drop')}, 1);
        }
    }

    updateUnplacedFlags() {
        this.flagCounter.innerHTML = `0${this.unplacedFlags}`;
    }

    startTimer() {
        let time = 0;
        const interval = setInterval(() => {
            if (time <= 999) {
                if (!this.gameHasStarted || this.gameHasEnded) clearInterval(interval);
                if ((time / 100) >= 1) {
                    this.timer.innerHTML = `${time}`;
                } else if ((time / 10) >= 1) {
                    this.timer.innerHTML = `0${time}`;
                } else {
                    this.timer.innerHTML = `00${time}`;
                }
                time += 1;
            }
        }, 1000);
    }

    initEvents() {
        this.initMinefield();
        this.openRules();
        this.closeRules();
        this.resetGame();
        this.flagMode();
    }
}

export default Minesweeper;