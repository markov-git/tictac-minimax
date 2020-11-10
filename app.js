// HTML
const $zero = document.querySelector('#zero')
const $cross = document.querySelector('#cross')
const selection = document.querySelector('.selection')
const status = document.querySelector('.handler__status')
const reset = document.querySelector('.handler__reset')
const cell = document.querySelectorAll('.gameGrid__cell')
const analytics = document.querySelector('.analytics')
const firstLineStatistic = document.querySelector('.statistic__first')
const secondLineStatistic = document.querySelector('.statistic__second')
const thirdLineStatistic = document.querySelector('.statistic__third')
// game
let isGame = true
let isNextX = false //cross always second
let playerFigureZero = false
let recursCounter = 0
//constants
const X = 'flagX'
const O = 'flagO'
//checkers
const endGame = tic => {
    isGame = false
    recursCounter = 0
    let text = tic === X ? 'X' : 'O'
    status.innerHTML = `<span>${text} has won!</span>`
    upStatistic().then(()=>{
        getData()
    })
}

function isWin(cBoard) {
    //checkWin
    if (cBoard[0] && cBoard[0] === cBoard[1] && cBoard[0] === cBoard[2]) {
        endGame(cBoard[0])
        cell[0].classList.add('won')
        cell[1].classList.add('won')
        cell[2].classList.add('won')
        return true
    } else if (cBoard[3] && cBoard[3] === cBoard[4] && cBoard[3] === cBoard[5]) {
        endGame(cBoard[3])
        cell[3].classList.add('won')
        cell[4].classList.add('won')
        cell[5].classList.add('won')
        return true
    } else if (cBoard[6] && cBoard[6] === cBoard[7] && cBoard[6] === cBoard[8]) {
        endGame(cBoard[6])
        cell[6].classList.add('won')
        cell[7].classList.add('won')
        cell[8].classList.add('won')
        return true
    } else if (cBoard[0] && cBoard[0] === cBoard[3] && cBoard[0] === cBoard[6]) {
        endGame(cBoard[0])
        cell[0].classList.add('won')
        cell[3].classList.add('won')
        cell[6].classList.add('won')
        return true
    } else if (cBoard[1] && cBoard[1] === cBoard[4] && cBoard[1] === cBoard[7]) {
        endGame(cBoard[1])
        cell[1].classList.add('won')
        cell[4].classList.add('won')
        cell[7].classList.add('won')
        return true
    } else if (cBoard[2] && cBoard[2] === cBoard[5] && cBoard[2] === cBoard[8]) {
        endGame(cBoard[2])
        cell[2].classList.add('won')
        cell[5].classList.add('won')
        cell[8].classList.add('won')
        return true
    } else if (cBoard[0] && cBoard[0] === cBoard[4] && cBoard[0] === cBoard[8]) {
        endGame(cBoard[0])
        cell[0].classList.add('won')
        cell[4].classList.add('won')
        cell[8].classList.add('won')
        return true
    } else if (cBoard[2] && cBoard[2] === cBoard[4] && cBoard[2] === cBoard[6]) {
        endGame(cBoard[2])
        cell[2].classList.add('won')
        cell[4].classList.add('won')
        cell[6].classList.add('won')
        return true
    } else if (cBoard[0] && cBoard[1] && cBoard[2] &&
        cBoard[3] && cBoard[4] && cBoard[5] &&
        cBoard[6] && cBoard[7] && cBoard[8]) {
        isGame = false
        recursCounter = 0
        analytics.innerHTML = 'Count of recurs function: ' + recursCounter
        status.innerHTML = `Game is tied!`
        upStatistic('tie').then(()=>{
            getData()
        })
        return true
    } else
        return false
}

const checkStatus = () => {
    if (!isWin(getCurrentBoard())) {
        isNextX = !isNextX
        if (isNextX) {
            status.innerHTML = `X is next`

            // AI step
            if (playerFigureZero)
                makeAsyncAIMove()

        } else {
            status.innerHTML = `O is next`

            // AI step
            if (!playerFigureZero)
                makeAsyncAIMove()
        }
    }
}

//bot
function minimax(newBoard, currentFigure) {
    recursCounter++
    let emptyIndex = isEmpty(newBoard)
    let currentFlag = currentFigure === true ? X : O
///////////////////////////
    //base event
    if (virtualWining(newBoard, O)) {
        return {score: 10} //если побеждает текущая фигура
    } else if (virtualWining(newBoard, X)) {
        return {score: -10}
    } else if (emptyIndex.length === 0) {
        return {score: 0}
    }
///////////////////////////
    //recursive
    let moves = [] // what we will return

    // for on empty
    for (let i = 0; i < emptyIndex.length; i++) {
        //current move in obj
        let move = {}
        move.index = emptyIndex[i]
        //do a step
        newBoard[emptyIndex[i]] = currentFlag

        //get a score
        if (currentFlag === O) {
            move.score = minimax(newBoard, true).score
        } else {
            move.score = minimax(newBoard, false).score
        }
        //clear the position
        newBoard[emptyIndex[i]] = undefined

        //save the result
        moves.push(move)
    }
    //looking fore best move
    let bestMove
    if (currentFlag === O) {
        let bestScore = -10000
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score
                bestMove = i
            }
        }
    } else {
        let bestScore = 10000
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score
                bestMove = i
            }
        }
    }
    return moves[bestMove]
}

//utils
function virtualWining(board, player) {
    return (board[0] === player && board[1] === player && board[2] === player) ||
        (board[3] === player && board[4] === player && board[5] === player) ||
        (board[6] === player && board[7] === player && board[8] === player) ||
        (board[0] === player && board[3] === player && board[6] === player) ||
        (board[1] === player && board[4] === player && board[7] === player) ||
        (board[2] === player && board[5] === player && board[8] === player) ||
        (board[0] === player && board[4] === player && board[8] === player) ||
        (board[2] === player && board[4] === player && board[6] === player)
}

function hideSelector() {
    for (let i = 20, j = 0; i >= 0; i--, j++) {
        setTimeout(() => {
            selection.style.opacity = `${i / 20}`
        }, 15 * j)
        if (i === 0) {
            setTimeout(() => {
                selection.style.display = 'none'
            }, 15 * j)
        }
    }
}

function showSelector() {
    selection.style.display = 'flex'
    for (let i = 0; i < 21; i++) {
        setTimeout(() => {
            selection.style.opacity = `${i / 20}`
        }, 15 * i)
    }
}

function isEmpty(arr) {
    let emptyArray = []
    arr.forEach((item, i) => {
        if (!item) {
            emptyArray.push(i)
        }
    })
    return emptyArray
}

function getCurrentBoard() {
    const curBoard = []
    for (const tic of cell) {
        curBoard.push(tic.classList[1])
    }
    return curBoard
}

function makeAsyncAIMove(timeout = 300) {
    isGame = false
    setTimeout(() => {
        isGame = true
        cell[minimax(getCurrentBoard(), isNextX).index].click()

        analytics.innerHTML = 'Recursive function calls: ' + recursCounter
        recursCounter = 0
    }, timeout)
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            if (isNextX)
                status.innerHTML = 'X is next' +  '.'.repeat(i)
            else
                status.innerHTML = 'O is next' +  '.'.repeat(i)
        }, timeout * i / 4)
    }
}

//listeners
getData();

$cross.addEventListener('click', e => {
    playerFigureZero = false
    status.innerHTML = `O is next`
    hideSelector()

    makeAsyncAIMove(500)    //or will be lagging
})
$zero.addEventListener('click', e => {
    playerFigureZero = true
    status.innerHTML = `O is next`

    hideSelector()
})

reset.addEventListener('click', e => {
    showSelector()
    isNextX = false
    isGame = true
    analytics.innerHTML = ''
    recursCounter = 0
    for (const tic of cell) {
        tic.classList.remove(X)
        tic.classList.remove(O)
        tic.classList.remove('won')
    }
    getData();
})

for (const tic of cell) {
    tic.addEventListener('click', e => {
        const classList = e.target.classList

        if (!isGame || classList.length === 2) {
            return
        }
        if (isNextX) {
            classList.add(X)
            checkStatus()
        } else {
            classList.add(O)
            checkStatus()
        }
    })
}

let tableShown = false
firstLineStatistic.addEventListener('click',evt => {
    if (!tableShown) {
        tableShown = !tableShown
        secondLineStatistic.style.display = 'table-row'
        thirdLineStatistic.style.display = 'table-row'
        secondLineStatistic.style.transform = 'translateY(0px)'
        thirdLineStatistic.style.transform = 'translateY(0px)'
    } else {
        tableShown = !tableShown
        secondLineStatistic.style.display = 'none'
        thirdLineStatistic.style.display = 'none'
        secondLineStatistic.style.transform = 'translateY(-43px)'
        thirdLineStatistic.style.transform = 'translateY(-86px)'
    }
})

//statistic
const total = document.getElementById('statistic__total')
const wins = document.getElementById('statistic__wins')
const ties = document.getElementById('statistic__ties')


async function getData() {
    const response = await fetch('/tic');
    const data = await response.json();

    total.innerHTML = data[0].total.toString()
    wins.innerHTML = data[0].wins.toString()
    ties.innerHTML = data[0].ties.toString()

    // console.log(data[0])
}

async function upStatistic(str='win') {

    const data = {type: str}

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    const response = await fetch('/tic', options)
    const json = await response.json();
    // console.log(json)
}
