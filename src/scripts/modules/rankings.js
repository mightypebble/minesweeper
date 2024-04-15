const selectors = {
    leaderBoardContainer: '.leaderboard-container',
}

class Rankings{
    constructor(container) {
        this.container = container;
        this.leaderboardContainer = this.container.querySelector(selectors.leaderBoardContainer);
        
        this.initEvents();
    }

    getData() {
        fetch('http://localhost:3000/data')
            .then(response => response.json())
            .then(data => {
                data.forEach((leader, index) => {
                    const header = document.createElement('h3');
                    switch(index + 1) {
                    case 1:
                        header.innerText = `1st: ${leader.name} ${leader.time}s`;
                        break;
                    case 2:
                        header.innerText = `2nd: ${leader.name} ${leader.time}s`;
                        break;
                    case 3:
                        header.innerText = `3rd: ${leader.name} ${leader.time}s`;
                        break;
                    default:
                        header.innerText = `${index + 1}th: ${leader.name} ${leader.time}s`;
                        break;
                    }
                    this.leaderboardContainer.appendChild(header);
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    initEvents() {
        this.getData();
    }
}

export default Rankings;