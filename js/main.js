let container;
let camera, scene, renderer;

let clock = new THREE.Clock();
let planets = [];
let targets = [];
let revolveSpeed = 1;
let rotateSpeed = 1;
let cameraTarget;

init();
animate();

function init()
{
    container = document.getElementById('container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000); 
    
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    container.appendChild(renderer.domElement);
    
    const sun = createSphere("pic/sunmap.jpg", 15, 0);
    scene.add(sun);
    const space = createSphere("pic/starmap.jpg", 500, 0);
    scene.add(space);

    const mercury = new Planet("pic/mercury/mercurymap.jpg", "pic/mercury/mercurybump.jpg", 2.44, 46, 88, 58.65, 0.1);
    const venus = new Planet("pic/venus/venusmap.jpg", "pic/venus/venusbump.png", 6.052, 107, 224.7, -243, 177);
    const earth = new Planet("pic/earth/earthmap.jpg", "pic/earth/earthbump.jpg", 6.378, 147, 365, 1, 23);
    const moon = new Planet("pic/moon/moonmap.jpg", "pic/moon/moonbump.jpg", 1.737, 20, 27, 27, -6.68);
    moon.move = function()
    {
        this.mesh.position.x = this.dist * Math.cos(this.a) + earth.mesh.position.x;
        this.mesh.position.z = -this.dist * Math.sin(this.a) + earth.mesh.position.z;

        this.a += revolveSpeed * this.revolveSpeed;
    }
    const mars = new Planet("pic/mars/marsmap.jpg", "pic/mars/marsbump.jpg", 3.379, 206, 687, 1.026, 25);

    targets = [, mercury, venus, earth, mars];
    planets = [mercury, venus, earth, moon, mars];

    targets.forEach(Planet => {
        drawOrbit(Planet.dist);
    });

    const sunlight = new THREE.PointLight(0xEEE8AA, 2);
    scene.add(sunlight);
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener("keydown", keyboardEventListener)
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function keyboardEventListener(e)
{
    switch(e.key)
    {
        case "ArrowRight":
            rotateSpeed += 1;
            break;
        case "ArrowLeft":
            rotateSpeed -= 1;
            break;
        case "ArrowUp":
            revolveSpeed += 1;
            break;
        case "ArrowDown":
            revolveSpeed -= 1;
            break;
        default:
            if(e.key > -1 && e.key < 5)
            {
                cameraTarget = targets[e.key];
            }   
            break;
    }
}

function animate()
{
    requestAnimationFrame(animate);
    setCameraTarget(camera, cameraTarget);
    renderer.render(scene, camera);

    let i = clock.getDelta();
    while(i < 0.001)
    { 
        i += clock.getDelta();
    }

    planets.forEach(Planet => {
        Planet.move();
        Planet.rotate();
    });
}

function createSphere(texPath, rad)
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

function Planet(texPath, normalMpPath, rad, dist, siderealPeriod, spinPeriod, axisAngle)
{
    let geometry = new THREE.SphereGeometry(rad, 32, 32);
    
    let loader = new THREE.TextureLoader();
    let texture = loader.load(texPath);
    let normalMp = loader.load(normalMpPath)
    texture.minFilter = THREE.NearestFilter;
    
    let material = new THREE.MeshStandardMaterial({
        map: texture,
        bumpMap: normalMp,
        side: THREE.DoubleSide
    });
    
    this.mesh = new THREE.Mesh(geometry, material);

    this.rad = rad;
    this.dist = dist;
    this.revolveSpeed = 6.28319 / (siderealPeriod * 24); // 1 frame ≈ 1 hour;
    this.rotateSpeed = 6.28319 / (spinPeriod * 24 * 60); // 1 frame ≈ 1 min;
    this.a = 0;

    this.mesh.rotateZ(axisAngle * Math.PI / 180);

    let sin = Math.sin((axisAngle + 90) * Math.PI / 180);
    let cos = Math.cos((axisAngle + 90) * Math.PI / 180);
    let axis = new THREE.Vector3(cos, sin, 0);

    this.rotate = function() 
    {
        this.mesh.rotateOnAxis(axis, rotateSpeed * this.rotateSpeed);
    }

    this.move = function() 
    {
        this.mesh.position.x = this.dist * Math.cos(this.a);
        this.mesh.position.z = -this.dist * Math.sin(this.a);

        this.a += revolveSpeed * this.revolveSpeed;
    }

    this.move();
    scene.add(this.mesh);
}

function drawOrbit(rad)
{
    let lineGeometry = new THREE.Geometry();
    let vertices = lineGeometry.vertices;

    for(let i = 0; i < 6.28319; i+= 0.0872665)
    {
        vertices.push(new THREE.Vector3(Math.cos(i) * rad, 0, -Math.sin(i) * rad));
    }       
        
    let lineMaterial = new THREE.LineDashedMaterial({
        color: 0x99FFFF,
        dashSize: 10,
        gapSize: 10
    });     

    let line = new THREE.Line(lineGeometry, lineMaterial);
    line.computeLineDistances();
    scene.add(line);    
}

function setCameraTarget(camera, target)
{
    if(target == null)
    {
        camera.position.set(0, 200, -400);
        camera.lookAt(0, 0, -50);
        return;
    }

    let a = target.a - 1.5708;

    let x = target.mesh.position.x + 4 * target.rad * Math.cos(a);
    let z = target.mesh.position.z - 4 * target.rad * Math.sin(a);

    camera.position.set(x, target.rad, z);
    camera.lookAt(target.mesh.position.x, 0, target.mesh.position.z); 
}

