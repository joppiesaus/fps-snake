/*
PROBLEMS:
Cubes not showing up
Fog not visible
new cube is position always zero
*/

var Direction = 
{
	NORTH: 0,
	SOUTH: 1,
	WEST: 2,
	EAST: 3
}

// Returns an int >= 0 && < max
var randomInt = function(max)
{
	return Math.floor(Math.random() * max);
}
// Returns an int >= min && < max
var randomInt = function(min, max)
{
	return Math.floor(Math.random() * (max - min)) + min;
}

var score = 0;
var scene, camera, renderer, clock;
var CubeGeometry, CubeMaterial;
var FoodMesh;

var SIZE = 20;
var CUBE_SIZE = 2;

var delta;
var direction;
var snake = [];
var food;

var delta;
var timeSinceLastSnakeUpdate = 0.0;

function init()
{
	clock = new THREE.Clock();
	
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x0000aa, 10, 1000 );
	
	CubeGeometry = new THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );
	CubeMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
	
	camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 1, 10000 );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x131313, 1.0 );
	
	scene.add( camera );
	
	snake.push( new THREE.Mesh( CubeGeometry, CubeMaterial ) );
	
	scene.add( snake[0] );
	
	camera.position = new THREE.Vector3(10, 10, 10);
	camera.lookAt( snake[0].position );
	//camera.lookAt( scene.position );
	
	changeDirection( Direction.NORTH );

	addFood();	
	
	document.body.appendChild( renderer.domElement );
	
	clock.start();
	
	animate();
}

function addFood()
{
	// TODO: Implement
}

function changeDirection( dir )
{
	//var TAU = 6.2831853071;
	
	switch (dir)
	{
		case Direction.NORTH:
			//camera.makeRotationY(
			direction = new THREE.Vector3(CUBE_SIZE, 0, 0);
			break;
			
		case Direction.SOUTH:
			direction = new THREE.Vector3(-CUBE_SIZE, 0, 0);
			break;
		
		case Direction.WEST:
			direction = new THREE.Vector3(0, 0, CUBE_SIZE);
			break;
			
		case Direction.EAST:
			direction = new THREE.Vector3(0, 0, -CUBE_SIZE);
			break;
	}
}

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	renderer.setSize( window.innerWidth, window.innerHeight );
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



function updateSnake()
{
	if ((timeSinceLastSnakeUpdate += delta) >= 0.7)
	{
		timeSinceLastSnakeUpdate = 0.0;

		var newPos = snake[0].position.clone().add( direction );

		
		//if (food.position.equals(newPos)) // Pick up food, grow
		//{
			// part position is always zero, while newpos is not
			score++;
			var part = snake[0].clone();
			part.position = newPos;
			snake.unshift( part );
			scene.add( part );
		/*}
		else
		{
			var lastn = snake.length - 1;
			var last = snake[lastn];
			last.position = newPos;
			snake.pop();
			snake.unshift( last );
		}*/

		camera.position = newPos;
		
		console.log( direction );
		console.log( camera );
		console.log( newPos );
		console.log( part );
		console.log( snake );
	}
}

window.onload = init;