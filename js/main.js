var container;
var camera, scene, renderer;

let planets = [];

init();
animate();

function init()
{
    container = document.getElementById('container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000); 
    camera.position.set(0, -400, 200);
    camera.lookAt(new THREE.Vector3(0, 0, 0)); 
    
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    container.appendChild(renderer.domElement);
    
    let sun = createSphere("pic/sunmap.jpg", 40, 0);
    scene.add(sun);
    let space = createSphere("pic/starmap.jpg", 1000, 0);
    scene.add(space);

    let mercury = new Planet("pic/mercury/mercurymap.jpg", 4.87, 100, 0.011, 0.00017);
    let venus = new Planet("pic/venus/venusmap.jpg", 12.1, 160, 0.0039, 0.00004);
    let earth = new Planet("pic/earth/earthmap1k.jpg", 12.756, 240, 0.0027, 0.01);
    let moon = new Planet("pic/moon/moonmap1k.jpg", 3.4, 30, 0.036, 0.00036);
    moon.move = function()
    {
        this.mesh.position.x = this.dist * Math.cos(this.a) + earth.mesh.position.x;
        this.mesh.position.y = this.dist * Math.sin(this.a)/2 + earth.mesh.position.y;

        this.a += this.moveSpeed;
    }
    let mars = new Planet("pic/mars/marsmap1k.jpg", 6.67, 300, 0.0014, 0.0097);

    planets = [mercury, venus, earth, moon, mars];

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

    planets.forEach(Planet => {
        Planet.move();
        Planet.rotate();
    });
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
    return sphere;
}

function Planet(texPath, rad, dist, moveSpeed, rotateSpeed)
{
    this.mesh = createSphere(texPath, rad, dist),
    this.dist = dist;
    this.moveSpeed = moveSpeed;
    this.rotateSpeed = rotateSpeed;
    this.a = 0;

    this.rotate = function() 
    {
        this.mesh.rotateZ(rotateSpeed);
    }

    this.move = function() 
    {
        this.mesh.position.x = this.dist * Math.cos(this.a);
        this.mesh.position.y = this.dist * Math.sin(this.a) * 0.7;

        this.a += this.moveSpeed;
    }

    this.move();
    scene.add(this.mesh);
}