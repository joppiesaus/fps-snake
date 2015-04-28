/*
PROBLEMS:
Implement everything!!!
*/

// An int vector2, point.
var Position = function(x, y)
{
    this.x = x;
    this.y = y;
};

// Adds another Position to this position
Position.prototype.add = function(a)
{
    this.x = a.x;
    this.y = a.y;
};

// Returns true if free, otherwise occupied
Position.prototype.isFree = function()
{
    return grid[this.x][this.y] === GridState.EMPTY;
};

// Returns the real-world coordinates of this position
Position.prototype.toWorldVector = function()
{
    return new THREE.Vector3( this.x * CUBE_SIZE, 0, this.y * CUBE_SIZE );
};


var Direction = 
{
	NORTH: 0,
	SOUTH: 1,
	WEST: 2,
	EAST: 3,
};
var GridState =
{
	EMPTY: 0,
	SNAKE: 1,
	FOOD: 2,
};


// Returns an int >= min && < max
var randomInt = function(min, max)
{
	return Math.floor(Math.random() * (max - min)) + min;
};

var score = 0;
var scene, camera, renderer, clock;

var FIELD_SIZE = 30;
var CUBE_SIZE = 10;

var delta; // time since last update in seconds
var snake = []; // snake body parts in meshes with an Position, for the grid
var grid = []; // grid for all states for easy state checking and position calculating... etc.
var food;

var delta;
var timeSinceLastSnakeUpdate = 0.0;

function init()
{
	window.addEventListener  ( 'resize' , onWindowResize, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup'  , onKeyUp, false );
	
	clock = new THREE.Clock();
	
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x0000aa, 10, 1000 );
	
	var BoxGeometry = new THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );
	var CubeMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );

	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	renderer = new THREE.WebGLRenderer(/*{ antialias:true }*/);
	renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);
	renderer.setClearColor(0xf0f0f0);

	cube = new THREE.Mesh( new THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE ), new THREE.MeshNormalMaterial() );
	//cube.position.y = 150;
	scene.add( cube );
	
	var gridHelper = new THREE.GridHelper( FIELD_SIZE * CUBE_SIZE, CUBE_SIZE );
	scene.add( gridHelper );

	for (var i = 0; i < FIELD_SIZE; i++)
    {
        grid[i] = [];
        for (var j = 0; j < FIELD_SIZE; j++)
        {
            grid[i][j] = GridState.EMPTY;
		}
    }
	
	snake.push( new THREE.Mesh( BoxGeometry, CubeMaterial ) );
	snake[0].pos = new Position( 0, 0 );
	grid[0][0] = GridState.SNAKE;
    snake.dir = new Position( 1, 0 );
	scene.add( snake[0] );
	
	// camera
	camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 1, 10000 );
	//camera.position = new THREE.Vector3(0, 100, 0);
	camera.position.z = -80;
	camera.position.y = 120;
	camera.position.x = 120;
    
    
	//camera.lookAt( snake[0].position );
	camera.lookAt( scene.position );
	scene.add( camera );
	
	changeDirection( Direction.NORTH );
	
    food = new THREE.Mesh(
			new THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE ),
			new THREE.MeshLambertMaterial( { color: 0x00ff00 } )
    );
	addFood();
	scene.add( food );
	
	document.body.appendChild( renderer.domElement );
	
	clock.start();
}

function addFood()
{
    var pos;
	
	// Pick random spot, check if space for food
	// If not, try again
    do
    {
        pos = new Position( randomInt( 0, FIELD_SIZE ), randomInt( 0, FIELD_SIZE ) );
    }
    while (!pos.isFree());
	
	grid[pos.x][pos.y] = GridState.FOOD;
	
	pos = pos.toWorldVector(); // ! Changes type !
    food.position.set( pos.x, pos.y, pos.z ); // .set doesn't work with a Vector3
}

function changeDirection( dir )
{
	//var TAU = 6.2831853071;
	
	switch (dir)
	{
		case Direction.NORTH:
			//camera.makeRotationY(
			snake.dir = new Position( 1, 0 );
			break;
			
		case Direction.SOUTH:
			snake.dir = new Position( -1, 0 );
			break;
		
		case Direction.WEST:
			snake.dir = new Position( 0, 1 );
			break;
			
		case Direction.EAST:
			snake.dir = new Position( 0, -1 );
			break;
	}
}

function onWindowResize()
{
	// update the window
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// input handling
function onKeyDown( e )
{
	switch (e.keyCode)
	{
		case 38: // up
		case 87: // w
			changeDirection( Direction.NORTH );
			break;
			
		case 40: // down
		case 83: // s
			changeDirection( Direction.SOUTH );
			break;
		
		case 37: // left
		case 65: // a
			changeDirection( Direction.WEST );
			break;
		
		case 30: // right
		case 68: // d
			changeDirection( Direction.EAST );
			break;
	}
}

function onKeyUp( e )
{
	switch (e.keyCode)
	{
		
	}
}

function update()
{
	delta = clock.getDelta();
	
	updateSnake();
}

function animate()
{
	requestAnimationFrame( animate );
	
	update();
	
	renderer.render( scene, camera );
}


// TODO: Implement
function updateSnake()
{
	if ((timeSinceLastSnakeUpdate += delta) >= 0.7)
	{
		timeSinceLastSnakeUpdate = 0.0;
		
		var newPos;
		
		switch (newPos)
		{
			case EMPTY: // Move
				
				break;
			
			case SNAKE: // Die
			
				break;
			
			case FOOD: // Grow
				
				score++;
			
				break;
		}
		
	}
}

// Changes a snake segment/body/part position
function changeSnakePart(seg, pos)
{
	
}

window.onload = init;

animate();