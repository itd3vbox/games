export default class TetrisComputation
{
    data = {
        rows: 20,
        cols: 10,
        grid: [],
        tetrominos: [
            { name: 'I', },
            { name: 'O', },
            { name: 'T', },
            { name: 'J', },
            { name: 'L', },
            { name: 'S', },
            { name: 'Z', },
        ],
    }

    constructor()
    {

    }

    getCoordinatesFromIndex(index)
    {
        const y = Math.floor(index / this.grid.cols)
        const x = index % this.grid.cols
        return { x, y }
    }

    getRandomX()
    {
        return Math.floor(Math.random() * this.data.cols)
    }

    reset()
    {
        this.data.grid = Array(200).fill(0)
    }
}