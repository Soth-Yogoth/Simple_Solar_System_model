let container;
let camera, scene, renderer;

let planets = [];
let speedUp = 1;
let clock = new THREE.Clock();
let view = 0;

init();
animate();

function init()
{
    container = document.getElementById('container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000); 
    camera.position.set(0, 200, -400);
    camera.lookAt(new THREE.Vector3(0, 0, 0)); 
    
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    container.appendChild(renderer.domElement);
    
    let sun = createSphere("pic/sunmap.jpg", 35, 0);
    scene.add(sun);
    let space = createSphere("pic/starmap.jpg", 1000, 0);
    scene.add(space);

    let mercury = new Planet("pic/mercury/mercurymap.jpg", 2.44, 46, 88, 58.65, 0.1);
    let venus = new Planet("pic/venus/venusmap.jpg", 6.052, 107, 224.7, -243, 177);
    let earth = new Planet("pic/earth/earthmap1k.jpg", 6.378, 147, 365, 1, 23);
    let moon = new Planet("pic/moon/moonmap1k.jpg", 1.737, 20, 27, 27, -6.68);
    moon.move = function()
    {
        this.mesh.position.x = this.dist * Math.cos(this.a) + earth.mesh.position.x;
        this.mesh.position.z = -this.dist * Math.sin(this.a) + earth.mesh.position.z;

        this.a += this.revolveSpeed;
    }
    let mars = new Planet("pic/mars/marsmap1k.jpg", 3.379, 206, 687, 1.026, 25);

    planets = [, mercury, venus, earth, moon, mars];

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener("keydown", changeView)
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function changeView(e)
{
    //TO DO: add a check: e belongs to [0,1,2,3,4,5]?
    view = e.key;
}

function animate()
{
    requestAnimationFrame(animate);
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

    if(view != 0)
    {
        let x = planets[view].mesh.position.x;
        let z = planets[view].mesh.position.z;
        camera.position.set(x, 0, z - 4 * planets[view].rad);
        camera.lookAt(new THREE.Vector3(x, 0, z)); 
    }
    else
    {
        camera.position.set(0, 200, -400);
        camera.lookAt(new THREE.Vector3(0, 0, 0)); 
    }
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

function Planet(texPath, rad, dist, siderealPeriod, spinPeriod, axisAngle)
{
    this.mesh = createSphere(texPath, rad),
    this.rad = rad;
    this.dist = dist;
    this.revolveSpeed = speedUp * 6.28319 / (siderealPeriod * 24); // 1 frame ≈ 1 hour;
    this.rotateSpeed = speedUp * 6.28319 / (spinPeriod * 24 * 60); // 1 frame ≈ 1 min;
    this.a = 0;

    this.mesh.rotateZ(axisAngle * Math.PI / 180);

    let sin = Math.sin((axisAngle + 90) * Math.PI / 180);
    let cos = Math.cos((axisAngle + 90) * Math.PI / 180);
    let axis = new THREE.Vector3(cos, sin, 0);

    this.rotate = function() 
    {
        this.mesh.rotateOnAxis(axis, this.rotateSpeed);
    }

    this.move = function() 
    {
        this.mesh.position.x = this.dist * Math.cos(this.a);
        this.mesh.position.z = -this.dist * Math.sin(this.a);

        this.a += this.revolveSpeed;
    }

    this.drawOrbit = function()
    {
        let lineGeometry = new THREE.Geometry();
        let vertices = lineGeometry.vertices;

        for(let i = 0; i < 6.28319; i+= 0.0872665)
        {
            vertices.push(new THREE.Vector3(Math.cos(i) * this.dist, 0, -Math.sin(i) * this.dist));
        }
        
        var lineMaterial = new THREE.LineDashedMaterial({
        color: 0x99FFFF,
        dashSize: 10,
        gapSize: 10
        });

        var line = new THREE.Line(lineGeometry, lineMaterial);
        line.computeLineDistances();
        scene.add(line);
    }

    this.move();
    this.drawOrbit();
    scene.add(this.mesh);
}

