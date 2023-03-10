const selector = {
    buttonEasy: '.button-easy',
    buttonNormal: '.button-normal',
    buttonHard: '.button-hard',
    closeMenuButton: '.button-close-menu',
    closeVictoryScreenButton: '.button-close-victory-screen',
    closeRulesButton: '.button-close-rules',
    closeSettingsButton: '.button-close-settings',
    flagButton: '.button-flag',
    flagCounter: '.flag-counter',
    menu: '.menu',
    menuButton: '.button-menu',
    mineblock: '.mineblock',
    minefield: '.minefield',
    resetButton: '.button-reset',
    ruleButton: '.button-rules',
    rules: '.rules',
    settings: '.settings',
    settingsButton: '.button-settings',
    settingsCheckbox: '.settings-checkbox',
    timer: '.timer',
    victoryScreen: '.victory-screen',
    victoryTime: '.victory-time',
}

class Minesweeper{
    constructor(container) {
        this.container = container;

        // main elements
        this.flagCounter = this.container.querySelector(selector.flagCounter);
        this.menu = this.container.querySelector(selector.menu);
        this.minefield = this.container.querySelector(selector.minefield);
        this.rules = this.container.querySelector(selector.rules);
        this.settings = this.container.querySelector(selector.settings);
        this.victoryScreen = this.container.querySelector(selector.victoryScreen);
        this.victoryTime = this.container.querySelector(selector.victoryTime);

        // UI elements
        this.buttonEasy = this.container.querySelector(selector.buttonEasy);
        this.buttonNormal = this.container.querySelector(selector.buttonNormal);
        this.buttonHard = this.container.querySelector(selector.buttonHard);
        this.closeMenuButton = this.container.querySelector(selector.closeMenuButton);
        this.closeRulesButton = this.container.querySelector(selector.closeRulesButton);
        this.closeSettingsButton = this.container.querySelector(selector.closeSettingsButton);
        this.closeVictoryScreenButton = this.container.querySelector(selector.closeVictoryScreenButton);
        this.flagButton = this.container.querySelector(selector.flagButton);
        this.menuButton = this.container.querySelector(selector.menuButton);
        this.resetButton = this.container.querySelector(selector.resetButton);
        this.ruleButton = this.container.querySelector(selector.ruleButton);
        this.settingsButton = this.container.querySelector(selector.settingsButton);
        this.settingsCheckbox = this.container.querySelector(selector.settingsCheckbox);
        this.timer = this.container.querySelector(selector.timer);
        
        // variables
        this.numberOfBlocks = 280;
        this.difficulty = 'normal';
        this.safeBlocks = null;
        this.unplacedFlags = null;
        this.gameHasStarted = false;
        this.gameHasEnded = false;

        this.initEvents();
    }

    /* fills minefield div with mineblock divs and gives each of them onclick effects,
    also checks for endgame rules - calling other functions */
    initMinefield() {
        const block = '<div class="mineblock"></div>';
        this.gameHasStarted = false;
        this.gameHasEnded = false;
        let time;
        this.unplacedFlags = 0;
        this.flagCounter.innerHTML = '000';
        this.timer.innerHTML = '000';
        this.resetButton.classList.remove('button-reset-game-over'); // sets reset button icon to default
        this.container.style.removeProperty('left');
        this.container.style.removeProperty('transform');
        switch (this.difficulty) {
        case 'easy':
            this.numberOfBlocks = 81;
            this.bombs = 10;
            this.columns = 9;
            break;
        case 'normal':
            this.numberOfBlocks = 280;
            this.bombs = 44;
            this.columns = 14;
            break;
        case 'hard':
            this.numberOfBlocks = 480;
            this.bombs = 99;
            this.columns = 24;
            if (screen.width < 624) { // eslint-disable-line
                this.container.style.left = '0';
                this.container.style.transform = 'translate(0, -50%)'
            }
            break;
        default:
            this.numberOfBlocks = 280;
            this.bombs = 44;
            this.columns = 14;
            break;   
        }
        this.minefield.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
        this.safeBlocks = this.numberOfBlocks - this.bombs; // 236 by default
        for (let i = 0; i < this.numberOfBlocks; i+=1) { // places a mineblock
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
                            mineblock.classList.add('revealed'); // reveals block
                            mineblock.classList.remove('uncertain'); // removes ? if there are any
                            if (!mineblock.classList.contains('bomb')) {
                                this.safeBlocks -= 1;
                            }
                            if (this.safeBlocks === 0) { // win condition
                                this.gameHasEnded = true;
                                this.victory();
                            }
                        }
                        if (!this.gameHasStarted) { // only on first block reveal
                            this.initBombs(index);
                            this.updateUnplacedFlags();
                            this.initNumbers();
                            this.gameHasStarted = true;
                            this.startTimer();
                        }
                        if (!mineblock.classList.contains('flagged')) this.mineScan(index);
                        // game ends if you reveal a bomb
                        if (mineblock.classList.contains('revealed') && mineblock.classList.contains('bomb')){
                            this.loss();
                        }
                    }
                }
            });
            mineblock.addEventListener('contextmenu', (ev) => { // on right click
                if (this.gameHasStarted && !this.gameHasEnded) this.placeFlag(index);
                ev.preventDefault(); // prevents default menu from opening
                return false;
            });
        });
    }

    // uses rng to fill block with bombs
    initBombs(mineblockIndex) { // places mines
        this.unplacedFlags = this.bombs;
        while (this.bombs !== 0) {
            const random = (Math.floor(Math.random() * this.numberOfBlocks)); // random number from 0 to number of blocks - 1
            // checks if there is already a bomb on the rolled block and if it's the first block revealed
            if (!this.blocks[random].classList.contains('bomb') && random !== mineblockIndex) {
                this.blocks[random].classList.add('bomb');
                this.bombs -= 1;
            }
        }
    }

    // generates the numbers based on nearby bombs for each block that isnt a bomb on the field
    initNumbers() { // places numbers
        const cols = this.columns;
        this.blocks.forEach(mineblock => {
            let adjecentBlocks = [-cols-1, -cols, -cols+1, -1, 1, cols-1, cols, cols+1]; // positions of all adjecent blocks to the one selected
            let nearbyBombs = 0;
            const index = Array.prototype.indexOf.call(this.blocks, mineblock);
            if (index % cols === 0) adjecentBlocks = [-cols, -cols+1, 1, cols, cols+1]; // positions if selected block is on the left wall
            else if ((index + 1) % cols === 0) adjecentBlocks = [-cols-1, -cols, -1, cols-1, cols]; // if it's on the right wall
            adjecentBlocks.forEach(adjecentBlock => {
                // tests for out of bounds indexes
                if (((index + adjecentBlock) < 0 || (index + adjecentBlock) > this.numberOfBlocks - 1)) adjecentBlock = 0; // eslint-disable-line
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

    initButtons() {
        this.buttonEasy.addEventListener('click', () => {
            this.menu.style.display = 'none';
            this.difficulty = 'easy';
            this.minefield.innerHTML = '';
            this.initMinefield();
        });
        this.buttonNormal.addEventListener('click', () => {
            this.menu.style.display = 'none';
            this.difficulty = 'normal';
            this.minefield.innerHTML = '';
            this.initMinefield();
        });
        this.buttonHard.addEventListener('click', () => {
            this.menu.style.display = 'none';
            this.difficulty = 'hard';
            this.minefield.innerHTML = '';
            this.initMinefield();
        });
        this.closeMenuButton.addEventListener('click', () => {
            this.menu.style.display = 'none';
        });
        this.closeRulesButton.addEventListener('click', () => {
            this.rules.style.display = 'none';
        });
        this.closeSettingsButton.addEventListener('click', () => {
            this.settings.style.display = 'none';
        });
        this.menuButton.addEventListener('click', () => {
            this.menu.style.display = 'grid';
        });
        this.ruleButton.addEventListener('click', () => {
            this.rules.style.display = 'grid';
        });
        this.settingsButton.addEventListener('click', () => {
            this.settings.style.display = 'grid';
        });
        this.settingsCheckbox.addEventListener('change', () => {
            if (this.settingsCheckbox.checked) {
                this.container.classList.add('minesweeper-pink');
            } else {
                this.container.classList.remove('minesweeper-pink');
            }
        });
    }

    // resets game by emptying minefield and calling initMinefield()
    resetGame() { // resets game
        this.resetButton.addEventListener('click', () => {
            this.minefield.innerHTML = '';
            this.initMinefield();
        })
    }

    // button that replaces left click default event with right click's placeFlag() function
    flagMode() {
        this.flagButton.addEventListener('click', () => {
            this.flagButton.classList.toggle('button-flag-active');
        });
    }

    // displays victory screen
    victory() {
        this.victoryScreen.style.display = 'grid';
        this.victoryTime.innerHTML = `${this.timer.innerHTML} seconds`;
        this.closeVictoryScreenButton.addEventListener('click', () => {
            this.victoryScreen.style.display = 'none';
        });
    }

    // displays defeat screen
    loss() {
        this.gameHasEnded = true;
        this.resetButton.classList.add('button-reset-game-over');
        this.blocks.forEach(mineblock => {
            if (mineblock.classList.contains('bomb')) mineblock.classList.add('revealed');
        });
    }

    // uses recursion to scan selected block for nearby empty blocks and then repeats the function for said empty block
    mineScan(mineblockIndex) {
        const cols = this.columns;
        let adjecentBlocks = [-cols-1, -cols, -cols+1, -1, 1, cols-1, cols, cols+1]; // positions of all adjecent blocks to the one selected
        let nearbyBombs = 0;
        if (mineblockIndex % cols === 0) adjecentBlocks = [-cols, -cols+1, 1, cols, cols+1]; // positions if selected block is on the left wall
        else if ((mineblockIndex + 1) % cols === 0) adjecentBlocks = [-cols-1, -cols, -1, cols-1, cols]; // if it's on the right wall
        adjecentBlocks.forEach(adjecentBlock => {
            // tests for out of bounds indexes
            if ((mineblockIndex + adjecentBlock) < 0 || (mineblockIndex + adjecentBlock) > this.numberOfBlocks - 1) adjecentBlock = 0; // eslint-disable-line
            if (this.blocks[mineblockIndex + adjecentBlock].classList.contains('bomb')) { // increments number based on nearby bombs
                nearbyBombs += 1;
            }
        });
        if (nearbyBombs === 0 && !this.blocks[mineblockIndex].classList.contains('bomb')) {   
            adjecentBlocks.forEach(adjecentBlock => {
                // tests for out of bounds indexes
                if ((mineblockIndex + adjecentBlock) < 0 || (mineblockIndex + adjecentBlock) > this.numberOfBlocks - 1) adjecentBlock = 0; // eslint-disable-line
                // tests for already revealed blocks
                if (!this.blocks[mineblockIndex + adjecentBlock].classList.contains('revealed')) {
                    this.blocks[mineblockIndex + adjecentBlock].classList.add('revealed');
                    this.safeBlocks -= 1;
                    this.blocks[mineblockIndex + adjecentBlock].classList.remove('flagged'); // removes flags if there are any
                    this.blocks[mineblockIndex + adjecentBlock].classList.remove('uncertain'); // removes ? if there are any
                    this.mineScan(mineblockIndex + adjecentBlock); // recursion
                }
            });
        }
    }

    // places a flag on selected mineblock
    placeFlag(mineblockIndex) { // places flags
        // checks if the selected blocks is already revealed
        if (!this.blocks[mineblockIndex].classList.contains('revealed')) {
            if (!this.blocks[mineblockIndex].classList.contains('flagged')  && !this.blocks[mineblockIndex].classList.contains('uncertain')) {
                this.blocks[mineblockIndex].classList.toggle('flag-drop'); // creates a drop effect
                this.blocks[mineblockIndex].classList.add('flagged');
                this.unplacedFlags -= 1;
                setTimeout(() => {this.blocks[mineblockIndex].classList.toggle('flag-drop')}, 1);
            } else if(this.blocks[mineblockIndex].classList.contains('uncertain')) { // removes ?
                this.blocks[mineblockIndex].classList.remove('uncertain');
            } else { // replaces flag with ?
                this.blocks[mineblockIndex].classList.remove('flagged');
                this.unplacedFlags += 1;
                this.blocks[mineblockIndex].classList.add('uncertain');
            }
            this.updateUnplacedFlags();
        }
    }

    // updates the counter for placed flags
    updateUnplacedFlags() {
        this.flagCounter.innerHTML = `0${this.unplacedFlags}`;
        if ((this.unplacedFlags / 100) >= 1) {
            this.flagCounter.innerHTML = `${this.unplacedFlags}`;
        } else if ((this.unplacedFlags / 10) >= 1) {
            this.flagCounter.innerHTML = `0${this.unplacedFlags}`;
        } else {
            this.flagCounter.innerHTML = `00${this.unplacedFlags}`;
        }
    }

    // start counting seconds since the start of the game till the end
    startTimer() {
        let time = 1;
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

    // initiates all events
    initEvents() {
        this.initMinefield();
        this.initButtons();
        this.resetGame();
        this.flagMode();
    }
}

export default Minesweeper;