/*
TODO:
# Walls!
	[] Act like screens?
# Find replacement for ugly wireframe

# Implement gameover & reset
# Fix double left/right bug (causes to run into itself)
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
Position.prototype.added = function(a)
{
	return new Position(
		this.x + a.x,
		this.y + a.y
	);
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
	// Turns out the default orientation is much more easy to work with
	NORTH: 0,
	EAST:  1,
	SOUTH: 2,
	WEST:  3
};

// State of a grid cell.
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

var FIELD_SIZE = 10;
var CUBE_SIZE = 10;
var CAMERA_HEAD_Y_OFFSET = 11;

var BoxGeometry = new THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );
var CubeMaterial = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );

var delta; // time since last update in seconds
var snake = []; // snake body parts in meshes with an Position, for the grid
var grid = []; // grid for all states for easy state checking and position calculating... etc.
var food;

var gameover = false;
var delta;
var timeSinceLastSnakeUpdate = 0.0;

// Nope, no JQuery today.
// Returns an element based on id(a macro)
function $( id )
{
	return document.getElementById( id );
}

function init()
{
	window.addEventListener  ( 'resize' , onWindowResize, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	
	clock = new THREE.Clock();
	
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x0000aa, 10, 1000 );

	var light = new THREE.AmbientLight( /*0x404040*/ 0x919191 ); // soft white light
	scene.add( light );

	renderer = new THREE.WebGLRenderer(/*{ antialias:true }*/);
	renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);
	renderer.setClearColor(0xf0f0f0);
	
	//var gridHelper = new THREE.GridHelper( FIELD_SIZE * CUBE_SIZE, CUBE_SIZE );
	//scene.add( gridHelper );

	// Init field
	for (var i = 0; i < FIELD_SIZE; i++)
	{
		grid[i] = [];
		for (var j = 0; j < FIELD_SIZE; j++)
		{
			grid[i][j] = GridState.EMPTY;
		}
	}
	
	// camera
	camera = new THREE.PerspectiveCamera( 85, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.y = CAMERA_HEAD_Y_OFFSET;
	scene.add( camera );

	food = new THREE.Mesh(
		BoxGeometry,
		new THREE.MeshLambertMaterial( { color: 0x00ff00 } )
	);
	
	initSnake();
	scene.add( food );
	
	document.body.appendChild( renderer.domElement );
	
	clock.start();
	
	animate();
}

function resetSnake()
{
	for (var i = 0; i < FIELD_SIZE; i++)
	{
		for (var j = 0; j < FIELD_SIZE; j++)
		{
			grid[i][j] = GridState.EMPTY;
		}
	}
	
	snake.dir = undefined;
	score = 0;
	snake = [];
}

function initSnake()
{
	snake.push( new THREE.Mesh( BoxGeometry, CubeMaterial ) );
	snake[0].pos = new Position( 0, 0 );
	grid[0][0] = GridState.SNAKE;
	snake.literaldir = Direction.NORTH;
	updateDirection();
	scene.add( snake[0] );
	
	addScore();
	
	addFood();
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

// changes literaldir relatively
function changeRelativeDirection( dir )
{
	if (dir == Direction.EAST)
	{
		// Turn right
		if (++snake.literaldir > 3)
		{
			snake.literaldir = 0;
		}
	}
	else // --> West
	{
		// Turn left
		if (--snake.literaldir < 0)
		{
			snake.literaldir = 3;
		}
	}
	
	updateDirection();
}

// Updates the camera and "velocity" based on snake.literaldir
function updateDirection()
{
	var TAU = 6.2831853071; // pi u suk go search friends lel

	switch (snake.literaldir)
	{
		case Direction.NORTH:
			camera.rotation.y = TAU / 2;
			snake.dir = new Position( 0, 1 );
			break;
			
		case Direction.SOUTH:
			camera.rotation.y = 0;
			snake.dir = new Position( 0, -1 );
			break;
		
		case Direction.WEST:
			camera.rotation.y = TAU / 4;
			snake.dir = new Position( -1, 0 );
			break;
			
		case Direction.EAST:
			camera.rotation.y = TAU * 3 / 4;
			snake.dir = new Position( 1, 0 );
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
			// Dear javascript,
			// I really hate that I can't check if a key is down manually or not.
			// This is a crap method.
			timeSinceLastSnakeUpdate += 25 * delta;
			break;
		
		case 37: // left
		case 65: // a
			changeRelativeDirection( Direction.EAST );
			break;
		
		case 39: // right
		case 68: // d
			changeRelativeDirection( Direction.WEST );
			break;
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
	
	if (gameover)
	{
		
	}
	else
	{
		update();
	}
	
	renderer.render( scene, camera );
}


function updateSnake()
{
	if ((timeSinceLastSnakeUpdate += delta) >= 0.7)
	{
		timeSinceLastSnakeUpdate = 0.0;
		
		var prevPos = snake[0].pos;
		var newPos = prevPos.added( snake.dir );
		adjustToField( newPos );
		
		switch (grid[newPos.x][newPos.y])
		{
			case GridState.EMPTY: // Move
				var last = snake[snake.length - 1];
				grid[last.pos.x][last.pos.y] = GridState.EMPTY;
				changeSnakePart( last, newPos );
				snake.pop();
				snake.unshift( last );
				break;
			
			case GridState.SNAKE: // Die
				
				toggleGameOver();
				
				break;
			
			case GridState.FOOD: // Grow
				
				var last = snake[snake.length - 1].clone();
				changeSnakePart( last, newPos );
				scene.add( last );
				snake.unshift( last );
				
				addScore();
				addFood();
			
				break;
		}
		
		camera.position.set(
			snake[0].position.x,
			snake[0].position.y + CAMERA_HEAD_Y_OFFSET, // Always equal to camheadyoff
			snake[0].position.z
		);
	}
}

// Changes a snake segment/body/part position
function changeSnakePart( seg, pos )
{
	seg.pos = pos;
	grid[pos.x][pos.y] = GridState.SNAKE;
	pos = pos.toWorldVector();
	seg.position.set( pos.x, pos.y, pos.z );
}

// Adjusts this snake's position to the field ones, and inversing directions with it too
function adjustToField( pos )
{
	// Can't use modulo, javascript math sucks
	if (pos.x < 0)
	{
		pos.x = FIELD_SIZE - 1;
		snake.literaldir = Direction.WEST;
		updateDirection();
	}
	else if (pos.x >= FIELD_SIZE)
	{
		pos.x = 0;
		snake.literaldir = Direction.EAST;
		updateDirection();
	}
	if (pos.y < 0)
	{
		pos.y = FIELD_SIZE - 1;
		snake.literaldir = Direction.SOUTH;
		updateDirection();
	}
	else if (pos.y >= FIELD_SIZE)
	{
		pos.y = 0;
		snake.literaldir = Direction.NORTH;
		updateDirection();
	}
}

// Adds 1 to the score, and also updates HUD.
function addScore()
{
	$( "score" ).innerHTML = "Score: " + ++score;
}

// Toggles gamover & ui
function toggleGameOver()
{
	gameover = !gameover;
	
	if (gameover)
	{
		$( "gameover" ).display = "visible";
		$( "resetmessage" ).display = "visible";
	}
	else
	{
		$( "gameover" ).display = "none";
		$( "resetmessage" ).display = "none";
	}
}

window.onload = init;