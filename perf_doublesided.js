/**
 * 
 * @param {WebGLRenderingContext} gl 
 */
function layaNativeAdpt(gl){
    gl.getShaderPrecisionFormat=function(shadertype, precisiontype){
        return {
            rangeMin:127,
            rangeMax:127,
            precision:23
        };   
    }
}

var container;
/**@type {THREE.PerspectiveCamera} */
var camera;
/**@type {THREE.scene} */
var scene;
/**@type {THREE.WebGLRenderer} */
var renderer;
var mesh, geometry;
var mouseX = 0, mouseY = 0;
var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;

var windowHalfX = SCREEN_WIDTH / 2;
var windowHalfY = SCREEN_HEIGHT / 2;
var webgl = null;

init();
//setTimeout(animate,2000);
var startRender=false;
setTimeout(()=>{startRender=true;},1000);
animate();

function patchgl(gl){
    gl.getActiveAttrib = function(program, index){
        switch(index){
            case 0:
            return {size: 1, type: 35665, name: "position"};
            break;
            case 1:
            return {size: 1, type: 35665, name: "normal"};
            break;
            case 2:
            break;
        }
        return null;        
    }
    
    gl.getActiveUniform=function(program, index) {
        var uniformInfo = [
            {size: 1, type: 35676, name: "modelMatrix"},
            {size: 1, type: 35676, name: "modelViewMatrix"},
            {size: 1, type: 35676, name: "projectionMatrix"},
            {size: 1, type: 35676, name: "viewMatrix"},
            {size: 1, type: 35675, name: "normalMatrix"},
            {size: 1, type: 35665, name: "cameraPosition"},
            {size: 1, type: 35665, name: "diffuse"},
            {size: 1, type: 35665, name: "emissive"},
            {size: 1, type: 35665, name: "specular"},
            {size: 1, type: 5126, name: "shininess"},
            {size: 1, type: 5126, name: "opacity"},
            {size: 1, type: 5126, name: "reflectivity"},
            {size: 1, type: 5126, name: "flipEnvMap"},
            {size: 1, type: 35665, name: "ambientLightColor"},
            {size: 1, type: 35665, name: "pointLights[0].position"},
            {size: 1, type: 35665, name: "pointLights[0].color"},
            {size: 1, type: 5126, name: "pointLights[0].distance"},
            {size: 1, type: 5126, name: "pointLights[0].decay"},
            {size: 1, type: 5124, name: "pointLights[0].shadow"},
            {size: 1, type: 5126, name: "pointLights[0].shadowBias"},
            {size: 1, type: 5126, name: "pointLights[0].shadowRadius"},
            {size: 1, type: 35664, name: "pointLights[0].shadowMapSize"},
            {size: 1, type: 35665, name: "pointLights[1].position"},
            {size: 1, type: 35665, name: "pointLights[1].color"},
            {size: 1, type: 5126, name: "pointLights[1].distance"},
            {size: 1, type: 5126, name: "pointLights[1].decay"},
            {size: 1, type: 5124, name: "pointLights[1].shadow"},
            {size: 1, type: 5126, name: "pointLights[1].shadowBias"},
            {size: 1, type: 5126, name: "pointLights[1].shadowRadius"},
            {size: 1, type: 35664, name: "pointLights[1].shadowMapSize"},
            {size: 1, type: 35665, name: "pointLights[2].position"},
            {size: 1, type: 35665, name: "pointLights[2].color"},
            {size: 1, type: 5126, name: "pointLights[2].distance"},
            {size: 1, type: 5126, name: "pointLights[2].decay"},
            {size: 1, type: 5124, name: "pointLights[2].shadow"},
            {size: 1, type: 5126, name: "pointLights[2].shadowBias"},
            {size: 1, type: 5126, name: "pointLights[2].shadowRadius"},
            {size: 1, type: 35664, name: "pointLights[2].shadowMapSize"},
            {size: 1, type: 35680, name: "envMap"}        
        ];
        return uniformInfo[index];    
    }

    gl.getProgramParameter = function(program, pname) {
        var ACTIVE_ATTRIBUTES = 0x8b89;
        var ACTIVE_UNIFORMS = 0x8b86;
        switch(pname){
            case ACTIVE_ATTRIBUTES:
            return 2;
            break;
            case ACTIVE_UNIFORMS:
            return 39;
            break;
        }
        //console.log("getProgramParameter can't support");
        return true;
    }    

    gl.getProgramInfoLog=function(program) {
        return '';
    }

    gl.getShaderPrecisionFormat = function(_args) {
        return {
            rangeMin:127,
            rangeMax:127,
            precision:23
        };   
    }

    gl.getShaderInfoLog = function(shader) {
        return '';
    }
    
    gl.getParameter = function(pname) {
        switch(pname){
            case this.MAX_CUBE_MAP_TEXTURE_SIZE:
            return 4096;
            break;
        }
        return 0;
    }    
}

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 50, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 20000 );
    camera.position.z = 3200;

    scene = new THREE.Scene();

    scene.add( new THREE.AmbientLight( 0x050505 ) );

    var light = new THREE.PointLight( 0x0011ff, 1, 5500 );
    light.position.set( 4000, 0, 0 );
    scene.add( light );

    var light = new THREE.PointLight( 0xff1100, 1, 5500 );
    light.position.set( -4000, 0, 0 );
    scene.add( light );

    var light = new THREE.PointLight( 0xffaa00, 2, 3000 );
    light.position.set( 0, 0, 0 );
    scene.add( light );

    var path = "examples/textures/cube/SwedishRoyalCastle/";
    var format = '.jpg';
    var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

    var reflectionCube = new THREE.CubeTextureLoader().load( urls );
    reflectionCube.format = THREE.RGBFormat;

    var material = new THREE.MeshPhongMaterial( { specular: 0x101010, shininess: 100, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.1, side: THREE.DoubleSide } );

    var geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI );

    for ( var i = 0; i < 5000; i ++ ) {

        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.x = Math.random() * 10000 - 5000;
        mesh.position.y = Math.random() * 10000 - 5000;
        mesh.position.z = Math.random() * 10000 - 5000;

        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50 + 100;

        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();

        scene.add( mesh );

    }
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0x050505 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    container.appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );

    webgl = renderer.context;
    if(webgl == null){
        alert("do not support webgl");
        return;
    }
}

//
function onWindowResize( event ) {

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    windowHalfX = SCREEN_WIDTH / 2;
    windowHalfY = SCREEN_HEIGHT / 2;

}

function onDocumentMouseMove(event) {

    mouseX = ( event.clientX - windowHalfX ) * 10;
    mouseY = ( event.clientY - windowHalfY ) * 10;

}

//

function animate() {
    requestAnimationFrame( animate );
    if(startRender)
        render();
}

function render() {
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;
    camera.lookAt( scene.position );
    renderer.render( scene, camera );
}
