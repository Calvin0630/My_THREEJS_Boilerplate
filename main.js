var scene;
var camera;
var renderer;
var container;
var container_height;
var container_width;
//used in mouse events
var container_rect;
var frames_per_second = 30;
//a list of objects in the scene
var scene_objects = [];
//a list of velocioties (THREE.Vector3) coresponding to the objectss in scene_objects
var scene_object_velocities = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var grav_constant = 0.000002;
var frame_index;

var sun;

init();
animate();

function init() {
    frame_index = 0;
    //init scene, renderer, camera
    scene = new THREE.Scene();
    //background texture
    var bg_tex = new THREE.TextureLoader().load("images/textures/A_Horseshoe_Einstein_Ring_from_Hubble.jpg");
    scene.background = bg_tex;
    container = document.getElementsByClassName('webgl')[0];
    container_width = container.offsetWidth;
    container_height = container.offsetHeight;
    //console.log("(w, h): (" + container_width + ", " + container_height + ")");
    renderer = new THREE.WebGLRenderer({ canvas: container });
    renderer.setSize(container_width, container_height);
    var fov = 75;
    var aspect = container_width / container_height;  // the canvas default
    var near = 0.1;
    var far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    //create sun
    var sun_geo = new THREE.SphereGeometry();
    var sun_mat = new THREE.ShaderMaterial({
        uniforms: {
            colorB: { type: 'vec3', value: new THREE.Color(0Xff0a47) },
            colorA: { type: 'vec3', value: new THREE.Color(0xff2b0a) }
        },
        vertexShader: vertexShader(),
        fragmentShader: fragmentShader()
    });
    sun = new THREE.Mesh(sun_geo, sun_mat);
    sun.position.set(0, 0, 0);
    scene.add(sun);
    //sun.position.z=-10;
    camera.position.z = 5;

    //set up event listeners


    container.addEventListener('resize', onWindowResize, false);
    container.addEventListener('mousedown', onMouseDown, false);

    document.onkeydown = function (e) {
        //console.log(String.fromCharCode(e.keyCode));
        switch (String.fromCharCode(e.keyCode)) {
            case "A":
                debug_print_scene_object_position();
                break;
            default:
                return;
        }
    };
}

function debug_print_scene_object_position() {
    console.log("positions:");
    for (var i = 0; i < scene_objects.length; i++) {
        console.log("i = " + i);
        console.log("pos: (" + scene_objects[i].position.x + ", " + scene_objects[i].position.y + ")");
        console.log("vel: (" + scene_object_velocities[i].x + ", " + scene_object_velocities[i].y + ")");
    }
}
//event listeners
var newest_planet;
function onMouseDown(event) {
    //get the mouse pos relative to the top left corner of the webgl div
    container_rect = event.target.getBoundingClientRect();
    pixel_loc_x = event.clientX - container_rect.left;
    pixel_loc_y = event.clientY - container_rect.top;
    //console.log("pixel_loc: ("+pixel_loc_x + ", " + pixel_loc_y + ")");
    //translate to screen coordinates. ie [-1, 1]
    mouse.x = (pixel_loc_x / container_rect.width) * 2 - 1;
    mouse.y = - (pixel_loc_y / container_rect.height) * 2 + 1;
    //console.log("mouse down @ ("+ mouse.x+", "+mouse.y+")");
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene_objects, true);
    if (intersects.length > 0) {
        for (var i = 0; i < intersects.length; i++) {
            console.log(intersects[i].point);
        }
    }
    else {
        //console.log("clicked outside the mesh");
        //create a planet
        //get the rays intersection with the xy plane (z=0)
        c = -raycaster.ray.origin.z / raycaster.ray.direction.z;
        var xy_intersect = raycaster.ray.origin.add(raycaster.ray.direction.multiplyScalar(c));
        //console.log("ray intersect w xy plane is (" + xy_intersect.x + ", " + xy_intersect.y, ", " + xy_intersect.z + ")");
    }

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
}

function onMouseMove(event) {
    pixel_loc_x = event.clientX - container_rect.left;
    pixel_loc_y = event.clientY - container_rect.top;
    //console.log("pixel_loc: ("+pixel_loc_x + ", " + pixel_loc_y + ")");
    //translate to screen coordinates. ie [-1, 1]
    mouse.x = (pixel_loc_x / container_rect.width) * 2 - 1;
    mouse.y = - (pixel_loc_y / container_rect.height) * 2 + 1;
    //console.log("mouse move @ ("+ mouse.x+", "+mouse.y+")");
}

function onMouseUp(event) {
    //console.log("mouse up!");
    container.removeEventListener('mousemove', onMouseMove);
}

function onWindowResize() {

    camera.aspect = container.innerWidth / container.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.innerWidth, container.innerHeight);

}


function animate() {
    sun.rotation.x+=0.1;
    sun.rotation.y+=0.2;
    sun.rotation.z+=0.3;
    //requestAnimationFrame(animate);
    //limit the framerate to 30fps
    setTimeout(function () {

        requestAnimationFrame(animate);

    }, 1000 / frames_per_second);
    console.log("frame: " + frame_index);
    frame_index += 1;
    renderer.render(scene, camera);
}


function vertexShader() {
    return `
        varying vec3 vUv; 

        void main() {
            vUv = position; 

            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition; 
        }
    `
}

function fragmentShader() {
    return `
        uniform vec3 colorA; 
        uniform vec3 colorB; 
        varying vec3 vUv;

        void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
        }
    `
}

function vector3ToString(v) {
    return "(" + v.x + ", " + v.y + ", " + v.z + ")";
}
