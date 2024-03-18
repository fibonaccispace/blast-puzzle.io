class Tile
{
	constructor(currentY,type,imagePath)
	{
		this.currentY = currentY
		this.type = type
		this.deleted = false

		this.image = new Image()
        this.image.src = imagePath
        this.zoom = 1
        this.minZoom = 1
        this.maxZoom = 3
        this.zoomSpeed = 0.15
	}
}

function random(min, max) {return Math.floor(Math.random()*(max-min))+min}
function isDefined(row, col, array) {return row >=0 && col >= 0 && row < array.length && col < array[row].length}

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const width = canvas.width
const height = canvas.height

const tiles = ['red','green','blue']
const tilesImagesPath = 
[
	'images/blue.png',
	'images/green.png',
	'images/purple.png',
	'images/red.png',
	'images/yellow.png',
]
const tileSize = 50
const tileMinNeighboor = 2
const tileSpeed = 0.16
const imageWidth = 192
const imageHeight = 171
const imageMissingSize = tileSize*imageWidth/imageHeight - tileSize
const tileFallingMargin = 1.5
const addedCanvasHeight = 6

let grid = initializeGrid(10,10,tiles)

// ЛКМ
canvas.addEventListener('click', (e)=>
{
	let x = Math.floor((e.offsetX-8)/tileSize)
	let y = Math.floor((e.offsetY-15)/tileSize)

	// ЕСЛИ ТАЙЛ НЕ НАЙДЕН
	if(!isDefined(x,y,grid)) return

	// ЕСЛИ ТАЙЛ ПАДАЕТ
	if(grid[x][y].currentY<y) return

	// ЕСЛИ ТАЙЛ УДАЛЕН
	if(grid[x][y].deleted) return

	const removeCoordinatesList = findSameTiles(x,y,grid,grid[x][y].type)
	deleteTiles(removeCoordinatesList,grid)
})

// ОСНОВНОЙ ЦИКЛ ПРОГРАММЫ
requestAnimationFrame(main)
function main() 
{
	requestAnimationFrame(main)
	ctx.clearRect(0,0,width,height)

	print(grid)
	move(grid)
	sort(grid)
	add(grid)
}

// ДОБАВЛЕНИЕ НОВЫХ
function add(grid) 
{
	for(let i = 0; i < grid.length; i++)
	{
		let startY = 0
		for(let j = grid[i].length-1; j >= 0; j--)
		{
			// ЕСЛИ ТАЙЛ ЗАПОЛНЕН - ПРОПУСТИТЬ
			if(!grid[i][j].deleted) continue

			// ЕСЛИ ТАЙЛ УМЕНЬШАЕТСЯ
			if(grid[i][j].zoom < grid[i][j].maxZoom) continue

			// ЕСЛИ СПАВНУ НЕ МЕШАЕТ ПАДАЮЩИЙ ТАЙЛ
			if(j!=grid[i].length-1 && !grid[i][j+1].deleted && grid[i][j+1].currentY < startY*tileFallingMargin) break

			const currentY = --startY*tileFallingMargin
			const type = random(0,tilesImagesPath.length)
			const imagePath = tilesImagesPath[type]
			grid[i][j] = new Tile(currentY,type,imagePath)
		}
	}
}

// СОРТИРОВКА
function sort(grid) 
{
	for(let i = 0; i < grid.length; i++)
	{
		for(let choose = grid[i].length-1; choose > 0; choose--)
		{
			// ЕСЛИ ТАЙЛ ЗАПОЛНЕН - ПРОПУСТИТЬ
			if(!grid[i][choose].deleted) continue

			// ЕСЛИ ТАЙЛ УМЕНЬШАЕТСЯ
			if(grid[i][choose].zoom < grid[i][choose].maxZoom) continue

			for(let arrow = choose-1; arrow >= 0; arrow--)
			{
				// ЕСЛИ ТАЙЛ ЗАПОЛНЕН - МЕНЯЕМ МЕСТАМИ
				if(grid[i][arrow].deleted) continue

				let temp = grid[i][choose]
				grid[i][choose] = grid[i][arrow]
				grid[i][arrow] = temp
				break;
			}
		}
	}
}

// ПОИСК СОСЕДНИХ КЛЕТОК
function findSameTiles(x,y,grid,type,found=[]) 
{
	// ЕСЛИ ТАЙЛ НЕ НАЙДЕН
	if (!isDefined(x,y,grid)) return

	// ЕСЛИ ТАЙЛ УДАЛЕН
	if(grid[x][y].deleted) return

	// ЕСЛИ ТАЙЛ ДРУГОГО ТИПА
	if (grid[x][y].type != type) return

	// ЕСЛИ ТАЙЛ ПАДАЕТ
	if(grid[x][y].currentY < y) return

	// ЕСЛИ ТАЙЛ УЖЕ НАЙДЕН
	if (found.some(tile => tile.x == x && tile.y == y)) return

	found.push({x,y})
	findSameTiles(x+1,y,grid,type,found)
	findSameTiles(x-1,y,grid,type,found)
	findSameTiles(x,y+1,grid,type,found)
	findSameTiles(x,y-1,grid,type,found)
	return found
}

// УДАЛЕНИЕ СОСЕДНИХ ТАЙЛОВ
function deleteTiles(coordinates,grid) 
{
	// ЕСЛИ ТАЙЛОВ МЕНЬШЕ ДВУХ
	if(coordinates.length < tileMinNeighboor) return

	for(let coordinate of coordinates)
		grid[coordinate.x][coordinate.y].deleted = true
}

// ОТРИСОВКА СЕТКИ
function print(grid) 
{
	for(let i = 0; i < grid.length; i++)
	{
		for(let j = grid[i].length-1; j >= 0; j--)
		{
			const tile = grid[i][j]

			// ЕСЛИ ТАЙЛ УДАЛИЛСЯ
			if(tile.zoom >= tile.maxZoom) continue

			// ЕСЛИ ТАЙЛ УДАЛЯЕТСЯ
			if(tile.deleted)
				tile.zoom = Math.min(Math.max(tile.zoom+tile.zoomSpeed,tile.minZoom),tile.maxZoom)

			// ФОРМУЛЫ РИСОВАНИЯ
			const image = tile.image
			const tileWidth = tileSize/tile.zoom
			const tileHeight = tileSize/tile.zoom+imageMissingSize
			const xPosition = i*tileSize+(tile.zoom-tile.minZoom)*tileWidth/2
			const yPosition = tile.currentY*tileSize-imageMissingSize+(tile.zoom-tile.minZoom)*tileHeight/2+addedCanvasHeight
			ctx.drawImage(image, xPosition, yPosition, tileWidth, tileHeight);
		}
	}
}

// ПЕРЕДВИЖЕНИЕ ТАЙЛОВ
function move(grid) 
{
	for(let i = 0; i < grid.length; i++)
	{
		for(let j = 0; j < grid[i].length; j++)
		{
			const tile = grid[i][j]
			if(tile.currentY<j) 
				tile.currentY+=tileSpeed
			else 
				tile.currentY=j
		}
	}
}

// ИНИЦИАЛИЗАЦИЯ СЕТКИ
function initializeGrid(w,h,tiles) 
{
	let temp = []
	for(let i = 0; i < w; i++)
	{
		temp[i] = []
		for(let j = 0; j < h; j++)
		{
			const currentY = j*tileFallingMargin-h*tileFallingMargin
			const type = random(0,tilesImagesPath.length)
			const imagePath = tilesImagesPath[type]
			temp[i][j] = new Tile(currentY,type,imagePath)
		}
	}
	return temp
}



















































