import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.124.0/+esm";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.min.js";
import { Reflector } from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/objects/Reflector.min.js";
import * as geometric from "https://cdn.jsdelivr.net/npm/geometric@2.5.0/+esm";
import hull from "https://cdn.jsdelivr.net/npm/hull.js@1.0.3/+esm";
import isMobile from "https://cdn.jsdelivr.net/npm/ismobilejs@1.1.1/+esm";
import { createNoise4D } from "https://cdn.jsdelivr.net/npm/simplex-noise@4.0.1/+esm";
import SpriteText from "https://cdn.jsdelivr.net/npm/three-spritetext@1.7.1/+esm";

// Initialize renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Initialize scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdae5eb);

// Set up camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(100, 100, 100);

// Set up controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.enablePan = false;

// Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

// Event listeners
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("click", pickObject);
window.addEventListener("touchend", pickObject);

// Generate random points
const points = [];
const vectors = [];

for (var i = 0; i < 20; i++) {
	points.push([Math.floor(Math.random() * 100) + 1, Math.floor(Math.random() * 100) + 1]);
}

// Calculate concave hull
const concave = hull(points, 60);

// Create vectors
concave.forEach(item => vectors.push(new THREE.Vector2(item[0], item[1])));

// Draw new polygon
const landShape = new THREE.Shape(vectors);

const extrudeSettings = {
	steps: 2,
	depth: 3,
	bevelEnabled: false
};

const mesh = new THREE.Mesh(
	new THREE.ExtrudeGeometry(landShape, extrudeSettings),
	new THREE.MeshPhysicalMaterial({
		color: 0xffffff
	})
);
mesh.rotation.set(-Math.PI / 2, 0, 0);
mesh.receiveShadow = true;
mesh.layers.set(1);
scene.add(mesh);

// Draw some boxes
const group = new THREE.Group();
const cubeArray = [];

for (var i = 0; i < 24; i++) {
	for (var j = 0; j < 24; j++) {
		var height = Math.floor(Math.random() * 16) + 4;
		var width = 3;
		var dist = 4.5;

		const cube = new THREE.Mesh(
			new THREE.BoxGeometry(width, height, width),
			new THREE.MeshPhysicalMaterial({
				color: 0xffffff
			})
		);
		cube.position.set(i * dist, (height / 2) + 1, -j * dist);
		cube.castShadow = true;
		cube.receiveShadow = true;

		// Check if boxes are contained within polygon
		const polygonA = [
			[(i * dist) - (width / 2), (j * dist) - (width / 2)],
			[(i * dist) - (width / 2), (j * dist) + (width / 2)],
			[(i * dist) + (width / 2), (j * dist) + (width / 2)],
			[(i * dist) + (width / 2), (j * dist) - (width / 2)]
		];

		const polygonB = concave;

		if (geometric.polygonInPolygon(polygonA, polygonB) === true) {
			group.add(cube);
			cubeArray.push(cube);
		}
	}
}

// Add boxes to scene
scene.add(group);

// Center camera
const bb = new THREE.Box3();
bb.setFromObject(mesh);
bb.getCenter(controls.target);

// Lighting
var mapsize = 1024 * 8;

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.5);
hemiLight.position.set(50, 100, -50);
scene.add(hemiLight);

const light = new THREE.PointLight(0xffffff, 0.7);
light.position.set(-50, 40, -60);
light.castShadow = true;
light.shadow.mapSize.set(mapsize, mapsize);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x5f96b8, 0.6);
scene.add(ambientLight);

// Modify random cubes
shuffleArray(cubeArray);
const selected = cubeArray.slice(0, data.length);

for (var i = 0; i < selected.length; i++) {
	// Scale height
	selected[i].scale.set(1, 2, 1);

	// Get parameters
	const size = new THREE.Vector3();
	const center = new THREE.Vector3();

	const bb = new THREE.Box3();
	bb.setFromObject(selected[i]);
	bb.getSize(size);
	bb.getCenter(center);

	// Translate upward and change color
	selected[i].position.set(center.x, (size.y / 2) + 1, center.z);
	selected[i].material.color = new THREE.Color(data[i].color);

	// Draw labels
	const label = new SpriteText(data[i].label, 3, data[i].color);
	label.position.x = center.x;
	label.position.y = size.y + 3.5;
	label.position.z = center.z;
	label.layers.set(1);
	scene.add(label);

	// Add user data
	selected[i].userData = {url: data[i].url};
}

// Show hidden objects
camera.layers.enable(1);

// Draw water
const mirrorOptions = {
	clipBias: 0.003,
	textureWidth: mapsize,
	textureHeight: mapsize,
	color: 0x666666
};

const mirrorGeometry = new THREE.PlaneGeometry(400, 400, 64, 64);
const mirror = new Reflector(mirrorGeometry, mirrorOptions);

mirror.rotation.set(-Math.PI / 2, 0, 0);
mirror.position.set(50, 1.5, -50);

// Disable water on mobile devices
if (isMobile(navigator.userAgentData).any === false) {
	scene.add(mirror);
}

// Horizon
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(10000, 10000),
	new THREE.MeshBasicMaterial({
		color: 0xd4e0e7
	})
);
plane.rotation.set(-Math.PI / 2, 0, 0);
scene.add(plane);

// Generate noise
const noise4D = createNoise4D();

// Animate scene
animate();

function animate() {
	// Update controls
	controls.update();

	// Update camera parameters
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	// Update renderer size
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Update water
	animateWater(16);

	// Animation loop
	requestAnimationFrame(animate);

	// Render scene
	renderer.render(scene, camera);
}

function animateWater(speed) {
	for (var i = 0; i < mirrorGeometry.vertices.length; i++) {
		var z = (i + Date.now() * speed/100000);
		mirrorGeometry.vertices[i].z = noise4D(z,z,z,z);
		mirror.geometry.verticesNeedUpdate = true;
	}
}

function pickObject() {
	raycaster.setFromCamera(pointer, camera);
	const intersects = raycaster.intersectObjects(scene.children, true);
	// Open URL if object has one assigned
	if (intersects.length > 0) {
		if (intersects[0].object.userData.url) {
			window.open(intersects[0].object.userData.url);
		}
	}
}

function shuffleArray(array) {
	// Durstenfeld shuffle
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}
