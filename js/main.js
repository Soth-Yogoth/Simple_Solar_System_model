var container;
var camera, scene, renderer;

let a = 0;
let mercury = {};

init();
animate();

function init()
{
    container = document.getElementById('container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000); 
    camera.position.set(0, -500, 200);
    camera.lookAt(new THREE.Vector3(0, 0, 0)); 
    
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    renderer.setClearColor(0x11111111, 1);
    container.appendChild(renderer.domElement);

    let planets = [];
    
    let sun = createSphere("pic/sunmap.jpg", 40, 0);
    let space = createSphere("pic/starmap.jpg", 1000, 0);

    mercury = {
        dist: 100,
        mesh: createSphere("pic/mercury/mercurymap.jpg", 4.87, 100),
        move, 
    };

    planets.push(mercury);

    let venus = createSphere("pic/venus/venusmap.jpg", 12.1, 160);
    planets.push(venus);
    let earth = createSphere("pic/earth/earthmap1k.jpg", 12.756, 240);
    planets.push(earth);
    let moon = createSphere("pic/moon/moonmap1k.jpg", 3.4, 270);
    planets.push(moon);
    let mars = createSphere("pic/mars/marsmap1k.jpg", 6.67, 350);
    planets.push(mars);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate()
{
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    mercury.move(a);
    a += 0.005;
}

function createSphere(texPath, rad, dist)
{
    let geometry = new THREE.SphereGeometry(rad, 32, 32);
    
    let loader = new THREE.TextureLoader();
    let texture = loader.load(texPath);
    texture.minFilter = THREE.NearestFilter;
    
    let material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(dist, 0, 0);
    scene.add(sphere);

    return sphere;
}

function move(a)
{
    this.mesh.position.x = this.dist * Math.cos(a);
    this.mesh.position.y = this.dist * Math.sin(a)/2;
}