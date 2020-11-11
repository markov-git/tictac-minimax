// DOM ell
const $zero = document.querySelector('#zero')
const $cross = document.querySelector('#cross')
const $eng = document.querySelector('.eng')
const $rus = document.querySelector('.rus')
const $total = document.getElementById('statistic__total')
const $wins = document.getElementById('statistic__wins')
const $ties = document.getElementById('statistic__ties')
const $selection = document.querySelector('.selection')
const $status = document.querySelector('.handler__status')
const $reset = document.querySelector('.handler__reset')
const $cell = document.querySelectorAll('.gameGrid__cell')
const $analytics = document.querySelector('.analytics')
const $firstLineStatistic = document.querySelector('.statistic__first')
const $secondLineStatistic = document.querySelector('.statistic__second')
const $thirdLineStatistic = document.querySelector('.statistic__third')
const $toTranslate = document.querySelectorAll('[data-language]')
// game variable
let isGame = true
let isTie = false
let isNextX = false
let playerFigureZero = false
let recursCounter = 0
let tableShown = false
// constants
const X = 'flagX'
const O = 'flagO'
const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]
const language = {
    status: window.navigator.languages.includes('ru') ? 'rus' : 'eng',
    marked: 'width: 110%; background-color: #FFCCFF;',
    default: 'width: 100%; background-color: #9900ff;'
}
const initState = {
    rus: {
        htmlTitle: 'Крестики-нолики',
        title: 'Крестики <span>Нолики</span>',
        chose: 'Выберите игрока!',
        reset: 'Перезапустить',
        next: `ходят `,
        win: 'победили!',
        tie: 'Ничья!',
        totalStatistic: 'Всего сыграно игр',
        winsStatistic: 'Побед компьютера',
        tiesStatistic: 'Ничьи'
    },
    eng: {
        htmlTitle: 'Tic Tac Toe',
        title: 'Tic <span>Tac</span> Toe',
        chose: 'Chose your player!',
        reset: 'Reset',
        next: `is next`,
        win: 'has won!',
        tie: 'Game is tied!',
        totalStatistic: 'Total played',
        winsStatistic: 'Computer wins',
        tiesStatistic: 'Ties'
    }
}
// core
getDataFromServer()
language.status === 'eng'
    ? $eng.style = language.marked
    : $rus.style = language.marked
translateDocument(language.status)

$cross.addEventListener('click', () => {
    playerFigureZero = false
    $status.innerHTML = nextStepToString('O')
    hideSelector()
    makeAsyncAIMove(500)
})

$zero.addEventListener('click', () => {
    playerFigureZero = true
    $status.innerHTML = nextStepToString('O')
    hideSelector()
})

$eng.addEventListener('click', () => {
    if (language.status !== 'eng') {
        changeLanguage('eng')
        translateDocument('eng')
    }
})

$rus.addEventListener('click', () => {
    if (language.status !== 'rus') {
        changeLanguage('rus')
        translateDocument('rus')
    }
})

$reset.addEventListener('click', () => {
    showSelector()
    $reset.classList.remove('blink')
    isNextX = false
    isGame = true
    isTie = false
    $analytics.innerHTML = ''
    $status.innerHTML = ''
    recursCounter = 0
    for (const tic of $cell) {
        tic.classList.remove(X)
        tic.classList.remove(O)
        tic.classList.remove('won')
    }
})

for (const tic of $cell) {
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

$firstLineStatistic.addEventListener('click', () => {
    if (!tableShown) {
        $secondLineStatistic.style.display = 'table-row'
        $thirdLineStatistic.style.display = 'table-row'
        $secondLineStatistic.style.transform = 'translateY(0px)'
        $thirdLineStatistic.style.transform = 'translateY(0px)'
    } else {
        $secondLineStatistic.style.display = 'none'
        $thirdLineStatistic.style.display = 'none'
        $secondLineStatistic.style.transform = 'translateY(-43px)'
        $thirdLineStatistic.style.transform = 'translateY(-86px)'
    }
    tableShown = !tableShown
})

// game func
function isWin(cBoard) {
    if (isLineFill(cBoard).some(value => value)) {
        return true
    } else if (isLineFill(cBoard).every(value => typeof value === 'boolean')
        && cBoard.every(value => typeof value !== 'undefined')) {
        isTie = true
        endGame('tie')
        $analytics.innerHTML = 'Count of recurs function: ' + recursCounter
        $status.innerHTML = language.status === 'eng'
            ? initState.eng.tie
            : initState.rus.tie
        return true
    } else if (isLineFill(cBoard).some(value => typeof value === 'undefined')) {
        return false
    }
}

function endGame(strPost) {
    isGame = false
    $reset.classList.add('blink')
    recursCounter = 0
    setWinner()
    postDataToServer(strPost)
}

function checkStatus() {
    if (!isWin(getCurrentBoard())) {
        isNextX = !isNextX
        if (isNextX) {
            $status.innerHTML = nextStepToString('X')
            if (playerFigureZero) makeAsyncAIMove()
        } else {
            $status.innerHTML = nextStepToString('O')
            if (!playerFigureZero) makeAsyncAIMove()
        }
    } else {
        endGame()
    }
}

//bot
function minimax(newBoard, currentFigure) {
    recursCounter++
    let emptyIndexes = isEmpty(newBoard)
    let currentFlag = currentFigure === true ? X : O

    if (virtualWining(newBoard, O)) {
        return {score: 10}
    } else if (virtualWining(newBoard, X)) {
        return {score: -10}
    } else if (emptyIndexes.length === 0) {
        return {score: 0}
    }

    const moves = []
    for (const index of emptyIndexes) {
        const move = {index}
        const tempBoard = newBoard.map((val, i) => {
            if (i === index) return currentFlag
            return val
        })
        if (currentFlag === O) {
            move.score = minimax(tempBoard, true).score
        } else {
            move.score = minimax(tempBoard, false).score
        }
        moves.push(move)
    }
    let bestMove
    if (currentFlag === O) {
        let bestScore = -Infinity
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score
                bestMove = i
            }
        }
    } else {
        let bestScore = Infinity
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
function addClassWonToCell(nums) {
    for (const num of nums) {
        $cell[num].classList.add('won')
    }
}

function virtualWining(board, player) {
    return lines.some(line => {
        return board[line[0]] === player && board[line[1]] === player && board[line[2]] === player
    })
}

function isLineFill(board) {
    const matrixLine = []
    lines.forEach(line => {
        const bool = board[line[0]] && board[line[0]] === board[line[1]] && board[line[0]] === board[line[2]]
        matrixLine.push(bool)
        if (bool) addClassWonToCell(line)
    })
    return matrixLine
}

function hideSelector() {
    $selection.style.opacity = 0
    setTimeout(() => {
        $selection.style.display = 'none'
    }, 500)
}

function showSelector() {
    $selection.style.display = 'flex'
    for (let i = 0; i < 21; i++) {
        setTimeout(() => {
            $selection.style.opacity = `${i / 20}`
        }, 15 * i)
    }
}

function isEmpty(arr) {
    const emptyArray = []
    arr.forEach((item, i) => {
        if (!item) emptyArray.push(i)
    })
    return emptyArray
}

function getCurrentBoard() {
    const curBoard = []
    for (const tic of $cell) {
        curBoard.push(tic.classList[1])
    }
    return curBoard
}

function makeAsyncAIMove(timeout = 300) {
    isGame = false
    setTimeout(() => {
        isGame = true
        $cell[minimax(getCurrentBoard(), isNextX).index].click()
        $analytics.innerHTML = 'Recursive function calls: ' + recursCounter
        recursCounter = 0
    }, timeout)
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            if (isNextX)
                $status.innerHTML = nextStepToString('X') + '.'.repeat(i)
            else
                $status.innerHTML = nextStepToString('O') + '.'.repeat(i)
        }, timeout * i / 4)
    }
}

function nextStepToString(str) {
    if (language.status === 'eng') {
        return `'${str}' ${initState.eng.next}`
    } else {
        return `${initState.rus.next} '${str}'`
    }
}

function setWinner() {
    if (!isGame) {
        const part1 = isNextX ? 'X' : 'O'
        const part2 = language.status === 'eng' ? initState.eng.win : initState.rus.win
        $status.innerHTML = `<span>'${part1}' ${part2}</span>`
    }
    if (isTie) {
        $status.innerHTML = language.status === 'eng'
            ? initState.eng.tie
            : initState.rus.tie
    }
}

function translateDocument(lang) {
    for (let node of $toTranslate) {
        node.innerHTML = initState[lang][node.dataset.language]
    }
}

function changeLanguage(lang) {
    language.status = lang
    $eng.style = lang === 'eng' ? language.marked : language.default
    $rus.style = lang === 'eng' ? language.default : language.marked
    $status.innerHTML = isNextX === true
        ? nextStepToString('X')
        : nextStepToString('O')
    setWinner()
}

function getDataFromServer() {
    try {
        getData();
    } catch {
        console.log('get request failed successfully')
    }
}

function postDataToServer(res) {
    try {
        upStatistic(res).then(() => {
            getData()
        })
    } catch {
        console.log('post request failed successfully')
    }
}

//statistic interface
async function getData() {
    const response = await fetch('/tic');
    const data = await response.json();
    $total.innerHTML = data[0].total.toString()
    $wins.innerHTML = data[0].wins.toString()
    $ties.innerHTML = data[0].ties.toString()
}

async function upStatistic(str = 'win') {
    const data = {type: str}
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    await fetch('/tic', options)
}
