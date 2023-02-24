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
        this.fieldWidth = this.minefield.offsetWidth;
        this.fieldHeight = this.minefield.offsetHeight;

        this.initEvents();
    }

    initMinefield() {
        const block = '<div class="mineblock"></div>';
        let gameHasStarted = false;
        for (let i = 0; i < 280; i+=1) {
            this.minefield.insertAdjacentHTML('afterbegin', block);
        }
        this.blocks = this.container.querySelectorAll(selector.mineblock);
        this.blocks.forEach(mineblock => {
            const index = Array.prototype.indexOf.call(this.blocks, mineblock);
            mineblock.addEventListener('click', () => {
                mineblock.classList.add('mineblock--revealed');
                if (!gameHasStarted) {
                    this.initBombs(index);
                    this.initNumbers();
                    gameHasStarted = true;
                }
                this.mineScan(index);
            });
        });
    }

    initBombs(mineblockIndex) {
        let bombs = 44;
        while (bombs !== 0) {
            const random = (Math.floor(Math.random() * 280));
            if (!this.blocks[random].classList.contains('bomb') && random !== mineblockIndex) {
                this.blocks[random].classList.add('bomb');
                bombs -= 1;
            }
        }
    }

    initNumbers() {
        this.blocks = this.container.querySelectorAll(selector.mineblock);
        this.blocks.forEach(mineblock => {
            let adjecentBlocks = [-15, -14, -13, -1, 1, 13, 14, 15];
            let nearbyBombs = 0;
            const index = Array.prototype.indexOf.call(this.blocks, mineblock);
            if (index % 14 === 0) adjecentBlocks = [-14, -13, 1, 14, 15];
            else if ((index + 1) % 14 === 0) adjecentBlocks = [-15, -14, -1, 13, 14];
            adjecentBlocks.forEach(adjecentBlock => {
                if (((index + adjecentBlock) < 0 || (index + adjecentBlock) > 279)) adjecentBlock = 0; // eslint-disable-line
                if (this.blocks[index + adjecentBlock].classList.contains('bomb')) {
                    nearbyBombs += 1;
                }
            });
            if (nearbyBombs > 0 && !mineblock.classList.contains('bomb')) {
                mineblock.appendChild(document.createElement('p')).appendChild(document.createTextNode(`${nearbyBombs}`));
            }    
        });
    }

    resetGame() {
        this.resetButton.addEventListener('click', () => {
            this.minefield.innerHTML = '';
            this.initEvents();
        })
    }

    mineScan(mineblockIndex) {
        this.blocks = this.container.querySelectorAll(selector.mineblock);
        let adjecentBlocks = [-15, -14, -13, -1, 1, 13, 14, 15];
        let nearbyBombs = 0;
        if (mineblockIndex % 14 === 0) adjecentBlocks = [-14, -13, 1, 14, 15];
        else if ((mineblockIndex + 1) % 14 === 0) adjecentBlocks = [-15, -14, -1, 13, 14];
        adjecentBlocks.forEach(adjecentBlock => {
            if ((mineblockIndex + adjecentBlock) < 0 || (mineblockIndex + adjecentBlock) > 279) adjecentBlock = 0; // eslint-disable-line
            if (this.blocks[mineblockIndex + adjecentBlock].classList.contains('bomb')) {
                nearbyBombs += 1;
            }
        });
        if (nearbyBombs === 0 && !this.blocks[mineblockIndex].classList.contains('bomb')) {   
            adjecentBlocks.forEach(adjecentBlock => {
                if ((mineblockIndex + adjecentBlock) < 0 || (mineblockIndex + adjecentBlock) > 279) adjecentBlock = 0; // eslint-disable-line
                if (!this.blocks[mineblockIndex + adjecentBlock].classList.contains('mineblock--revealed')) {
                    this.blocks[mineblockIndex + adjecentBlock].classList.add('mineblock--revealed');
                    this.mineScan(mineblockIndex + adjecentBlock);
                }
            });
        }
    }

    initEvents() {
        this.initMinefield();
        this.resetGame();
    }
}

export default Minesweeper;