import $ from './libs/jquery.min';
import Minesweeper from './modules/minesweeper';

$(document).ready(() => {
    const minesweeper = document.querySelector('.minesweeper');

    const minesweeperInstance = new Minesweeper(minesweeper);
});
