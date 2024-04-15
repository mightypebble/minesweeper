import $ from './libs/jquery.min';
import Minesweeper from './modules/minesweeper';
import Rankings from './modules/rankings';

$(document).ready(() => {
    const minesweeper = document.querySelector('.minesweeper');
    const rankings = document.querySelector('.leaderboard');

    const minesweeperInstance = new Minesweeper(minesweeper);
    const rankingsInstance = new Rankings(rankings);
});
