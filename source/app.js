import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import * as Stats from 'stats-js';


// Number

const canvas = document.getElementById("number");
const ctx = canvas.getContext("2d");
const x = 32;
const y = 32;
const radius = 30;
const startAngle = 0;
const endAngle = Math.PI * 2;

// ctx.fillStyle = "rgb(0, 0, 0)";
// ctx.beginPath();
// ctx.arc(x, y, radius, startAngle, endAngle);
// ctx.fill();

// ctx.strokeStyle = "rgb(255, 255, 255)";
// ctx.lineWidth = 3;
// ctx.beginPath();
// ctx.arc(x, y, radius, startAngle, endAngle);
// ctx.stroke();

// ctx.fillStyle = "rgb(255, 255, 255)";
// ctx.font = "32px sans-serif";
// ctx.textAlign = "center";
// ctx.textBaseline = "middle";
// ctx.fillText("1", x, y);



//threejs


let container;
let camera;
let renderer;
let scene;
let controls;
let theModel;
var textureEquirec, textureCube;  
let pmremGenerator;
let sprite;
let spriteBehindObject;
let mesh;


const annotation = document.querySelector(".annotation");


let stats = new Stats();
stats.showPanel( 0 );
document.body.appendChild( stats.dom );





function init(){

    container = document.querySelector('#scene');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    

   const numberTexture = new THREE.CanvasTexture(
        document.querySelector('#number')
      );
    
    const spriteMaterial = new THREE.SpriteMaterial({
        map: numberTexture,
        alphaTest: 0.5,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
    
    sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(25, 25, 25);
    sprite.scale.set(35, 35, 1);
    
    scene.add(sprite);
   
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

    mesh = new THREE.Mesh(
        cubeGeometry,
        new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        })
    );

    const line = new THREE.LineSegments(
        new THREE.WireframeGeometry(cubeGeometry),
        new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            opacity: 0.25,
            transparent: true
        })
    );

    mesh.visible = false;
    scene.add(mesh);
    //scene.add(line);

    
    createCamera();
    createControls();
    //glbLoad();
    createLight();
    createRenderer();
    
    new RGBELoader()
					.setDataType( THREE.UnsignedByteType )
					.setPath( 'texture/' )
					.load( 'royal_esplanade_1k.hdr', function ( texture ) {

						var envMap = pmremGenerator.fromEquirectangular( texture ).texture;

						//scene.background = envMap;
						scene.environment = envMap;

						texture.dispose();
						pmremGenerator.dispose();

						render();

						// model

						// use of RoughnessMipmapper is optional
						var roughnessMipmapper = new RoughnessMipmapper( renderer );

						var loader = new GLTFLoader().setPath( 'models/' );
						loader.load( 'basic.glb', function ( gltf ) {

							gltf.scene.traverse( function ( child ) {
              
                
								if ( child.isMesh ) {
                  child.material.metalness = 0.1;
                  //schild.position.set(0,0,0);
                  //child.scale.set(2,2,2);
									// TOFIX RoughnessMipmapper seems to be broken with WebGL 2.0
                  // roughnessMipmapper.generateMipmaps( child.material );
                
								}

							} );
              scene.add( gltf.scene );
              
              
							roughnessMipmapper.dispose();

							render();

            } );

    } );
    
      
      

    renderer.setAnimationLoop( () => {
        stats.begin();
        
        //update();
        // s
        render();
        stats.end();
      } );

}


// function glbLoad(){
    
//     var newMaterial = new THREE.MeshStandardMaterial();
//     let loader = new GLTFLoader();
//     let dracoLoader = new DRACOLoader();
//     dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
//     dracoLoader.setDecoderConfig({type: 'js'});
//     loader.setDRACOLoader( dracoLoader );
//     loader.load("models/virgin.glb", function(gltf){
//         theModel = gltf.scene;
//         theModel.traverse((o) => {
//             if (o.isMesh) { 
//               //o.material = newMaterial;
//               o.scale.set = 100;

//             }
//           });
//         scene.add( theModel );
//     },
//         undefined, function ( error ) {
//         console.error( error );
//     });
//   }

      
function createControls(){
    controls = new OrbitControls( camera, container); 
}

function createCamera(){

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;


    // const fov = 35;
    // const aspect = container.clientWidth / container.clientHeight;
    // const near = 0.1;
    // const far = 100;    
    
    // camera = new THREE.PerspectiveCamera(fov,aspect,near,far);
    // camera.position.set(0,0,1);
    const vector = new THREE.Vector3(0.5, 0.5, 0.5);
    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

    const annotation = document.querySelector('.annotation');
    annotation.style.top = `${vector.y}px`;
    annotation.style.left = `${vector.x}px`;

}


function createLight(){

    const ambientLight = new THREE.HemisphereLight(
      0xffffbb, 0x080820, 1
      );
      scene.add( ambientLight );
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 0, 0, 1 ).normalize();
    
      scene.add( directionalLight );
    
      
  
}

function createRenderer(){

    renderer = new THREE.WebGL1Renderer({ antialias: true });
    renderer.setSize(container.clientWidth,container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    

    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure =0.3;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    pmremGenerator = new THREE.PMREMGenerator( renderer );
    pmremGenerator.compileEquirectangularShader();
    
}


function render(){
    renderer.render(scene,camera);
    // updateAnnotationOpacity();
    // updateScreenPosition();
    

}





function onWindowResize() {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.clientWidth, container.clientHeight );
  
  }
  
  window.addEventListener( 'resize', onWindowResize );


  function updateAnnotationOpacity() {
    
    const meshDistance = camera.position.distanceTo(mesh.position);
    const spriteDistance = camera.position.distanceTo(sprite.position);
    spriteBehindObject = spriteDistance > meshDistance;
    sprite.material.opacity = spriteBehindObject ? 0.9 : 1;

    // Do you want a number that changes size according to its position?
    // Comment out the following line and the `::before` pseudo-element.
    sprite.material.opacity = 0;
}

function updateScreenPosition() {
    const vector = new THREE.Vector3(2 , 0.5, 0.5);
    const canvas = renderer.domElement;

    vector.project(camera);

    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));

    annotation.style.top = `${vector.y}px`;
    annotation.style.left = `${vector.x}px`;
    annotation.style.opacity = spriteBehindObject ? 0.6 : 1;
}

  

init();

















