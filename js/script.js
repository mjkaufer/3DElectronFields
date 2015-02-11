var container;
var camera, scene, renderer, controls;
var mouseX, mouseY;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var particleMaterial; //an example particle material to use
var t = 0;//increases each call of render
vectorFormula = [];
var pause = false;
var electrons = new THREE.Object3D();
var testColor = 0x00ff00;
var negativeColor = 0xff0000;
var positiveColor = 0x0000ff;
var testCharge;
var testChargeArrow;
//declare other vars here

init();
animate();

function createElectron(charge, vector, color){
	if(!charge)
		charge = 0;
	if(!vector)
		vector = new THREE.Vector3();

	var geometry = new THREE.SphereGeometry(5, 6, 6);
	var material = new THREE.MeshBasicMaterial( {color: color} );
	var electron = new THREE.Mesh( geometry, material );

	electron.position = vector;
	electron.charge = charge;

	return electron;
}

function netChargeVector(testCharge){

	//the charges which testCharge is interacting with are in electrons
	var charges = electrons.children;

	var netCharge = new THREE.Vector3();

	for(var i = 0; i < charges.length; i++)
		netCharge.add(chargeVector(testCharge, charges[i]));
	
	// testCharge.direction = netCharge;

	return netCharge;

}

function chargeVector(testCharge, charge){
	//formula = q1q2 / r^2 * r vector - we don't care about the k constant because it's a constant and irrelevant here
	var displacement = testCharge.clone().sub(charge);
	var magnitude = testCharge.charge * charge.charge;
	magnitude /= testCharge.position.distanceToSquared(charge.position);
	var vector = displacement.normalize().multiplyScalar(magnitude);
	return vector;

}

function $(el){
	return document.getElementById(el);
}

function computePoints(x,y,z){//outputs vector based on vectorformula
	return new THREE.Vector3(eval(vectorFormula[0]), eval(vectorFormula[1]), eval(vectorFormula[2]));
}

function init(){
	
	var gui = new dat.GUI({
		height : 5 * 32 - 1
	});
	
	var Params = function() {
		this.fsize = 9;
		this.ffreq = 3;
		
		this.speed = 4;
		this.pause = function(){
			pause = !pause;
		};
		this.restart = function(){
			createStuff()
		}
	};
	
	params = new Params();
	// gui.remember(params);
	
	gui.add(params,"fsize").name("Arrow Field Size").onFinishChange(function(){
		createStuff();
	});
	gui.add(params,"ffreq").name("Arrow Frequency").onFinishChange(function(){
		createStuff();
	});
	gui.add(params,"speed").name("Slowness");
	gui.add(params,"pause").name("Pause")
	gui.add(params,"restart").name("Restart");
	
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	$('canvas').appendChild( renderer.domElement );
	
	
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
	camera.position.z = 10;//sets up camera

	scene = new THREE.Scene();//scene setup

	controls = new THREE.TrackballControls(camera);//sets up controls
	t = 0;
	var PI2 = Math.PI * 2;//constant for 2pi


	//rest of your setup here


	// var normal = new THREE.Vector3( 0, 1, 0 );
	// var color = new THREE.Color( 0xffaa00 );
	// var face = new THREE.Face3( 0, 1, 2, normal, color, 0 );
	// scene.add(face);

	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );
	
	
    testCharge = createElectron(5, new THREE.Vector3(), testColor);
    testChargeArrow = arrowHelper(testCharge.position, new THREE.Vector3());

    var negCharge = createElectron(5, new THREE.Vector3(1, 5, 3), negativeColor);
    var posCharge = createElectron(5, new THREE.Vector3(-2, 4, -4), positiveColor);

    

    scene.add(testCharge);
    scene.add(testChargeArrow);

    electrons.add(negCharge);
    electrons.add(posCharge);
    scene.add(electrons);

    renderer.setClearColor(0xededed);
    
}

function arrowHelper(pos, dir){
	if(!dir)
		dir = new THREE.Vector3();

	dir = dir.normalize();//make sure it's a unit vector
	return new THREE.ArrowHelper(dir, pos, 0.5, 0x000000, 0.25, 0.25);
}

function renderLines(){//todo - create lines that show the electric field with euler approximations
	return 0;
}

function animate(){
	requestAnimationFrame(animate);
	render();
}

function render(){
	camera.lookAt(scene.position);
	
	if(pause){
		controls.update();
		renderer.render(scene, camera);
		return;
	}


	
	t+=0.01;
	
	var electricForce = netChargeVector(testCharge);//the direction in which the testCharge will move

	testChargeArrow.position = testCharge.position.add(electricForce);//might need to divide by a scalar so it doesn't move too quickly
	var arrowDirection = electricForce.clone();
	var newMagnitude = Math.max(Math.min(Math.log(arrowDirection.length()), 4), 1);//set the magnitude to the log of its original - ensure it's within the range [1,4]

	testChargeArrow.setDirection(arrowDirection.normalize().multiplyScalar(newMagnitude));



	
	controls.update();
	renderer.render(scene, camera);
	
}