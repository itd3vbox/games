const pong = new Pong({
    element: document.querySelector('#pong'),
})
//pong.draw.drawAll()

const btnPlay = document.querySelector('#options button')
btnPlay.addEventListener('click', () => {
    pong.localeStart()
})

