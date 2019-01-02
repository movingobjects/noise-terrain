
// Imports

import * as _ from 'lodash';
import { random, maths, colors } from 'varyd-utils';

import dat from 'dat.gui';
import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

import imgParticle from './images/particle.png';
import shaderFrag from './shaders/frag.glsl';
import shaderVert from './shaders/vert.glsl';


// Constants

const DEFAULTS = {
  fogColor: "#163646",
  fogNear: 5,
  fogFar: 15,
  particleSize: 1,
  particleSpacing: 0.5,
  particleAreaW: 25,
  particleAreaH: 25,
  camFov: 60,
  camNear: 0.1,
  camFar: 100,
  camX: 0,
  camY: -7,
  camZ: 3,
  noiseAScale: 0.45,
  noiseASpeed: 0.45,
  noiseALevel: 0.75,
  noiseBScale: 0.2,
  noiseBSpeed: 0.25,
  noiseBLevel: 1.5,
  colorA: "#66ddff",
  colorB: "#66ffbb",
  noiseColorScale: 0.2,
  noiseColorSpeed: 0.25,
  bgColorTop: "#000000",
  bgColorBtm: "#000000",
  bgRotation: 0
}


// Class

export default class App {


  // Constructor

  constructor(elemWrap) {

    this.initState();
    this.initThree(elemWrap);
    this.initGui();

    this.start();

    this.nextScene();

  }

  initState() {

    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    this.timeStart   = Date.now();
    this.timeElapsed = 0;

    this.pts         = null;

    this.simplexA     = new SimplexNoise();
    this.simplexB     = new SimplexNoise();
    this.simplexColor = new SimplexNoise();

    this.fogColor        = DEFAULTS.fogColor;
    this.colorA          = DEFAULTS.colorA;
    this.colorB          = DEFAULTS.colorB;
    this.bgColorTop      = DEFAULTS.bgColorTop;
    this.bgColorBtm      = DEFAULTS.bgColorBtm;
    this.bgRotation      = DEFAULTS.bgRotation;
    this.particleSize    = DEFAULTS.particleSize;
    this.particleSpacing = DEFAULTS.particleSpacing;
    this.particleAreaW   = DEFAULTS.particleAreaW;
    this.particleAreaH   = DEFAULTS.particleAreaH;
    this.noiseAScale     = DEFAULTS.noiseAScale;
    this.noiseASpeed     = DEFAULTS.noiseASpeed;
    this.noiseALevel     = DEFAULTS.noiseALevel;
    this.noiseBScale     = DEFAULTS.noiseBScale;
    this.noiseBSpeed     = DEFAULTS.noiseBSpeed;
    this.noiseBLevel     = DEFAULTS.noiseBLevel;
    this.noiseColorScale = DEFAULTS.noiseColorScale;
    this.noiseColorSpeed = DEFAULTS.noiseColorSpeed;

    this.trgtFogColor        = DEFAULTS.fogColor;
    this.trgtColorA          = DEFAULTS.colorA;
    this.trgtColorB          = DEFAULTS.colorB;
    this.trgtBgColorTop      = DEFAULTS.bgColorTop;
    this.trgtBgColorBtm      = DEFAULTS.bgColorBtm;
    this.trgtBgRotation      = DEFAULTS.bgRotation;
    this.trgtParticleSize    = DEFAULTS.particleSize;
    this.trgtParticleSpacing = DEFAULTS.particleSpacing;
    this.trgtParticleAreaW   = DEFAULTS.particleAreaW;
    this.trgtParticleAreaH   = DEFAULTS.particleAreaH;
    this.trgtNoiseAScale     = DEFAULTS.noiseAScale;
    this.trgtNoiseASpeed     = DEFAULTS.noiseASpeed;
    this.trgtNoiseALevel     = DEFAULTS.noiseALevel;
    this.trgtNoiseBScale     = DEFAULTS.noiseBScale;
    this.trgtNoiseBSpeed     = DEFAULTS.noiseBSpeed;
    this.trgtNoiseBLevel     = DEFAULTS.noiseBLevel;
    this.trgtNoiseColorScale = DEFAULTS.noiseColorScale;
    this.trgtNoiseColorSpeed = DEFAULTS.noiseColorSpeed;

  }
  initThree(elemWrap) {

    const opts    = DEFAULTS;

    let renderer  = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(this.winW, this.winH);
        renderer.setPixelRatio(2);

    let camera    = new THREE.PerspectiveCamera(opts.camFov, this.winW / this.winH, opts.camNear, opts.camFar);
        camera.position.set(opts.camX, opts.camY, opts.camZ);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

    let scene     = new THREE.Scene();
        scene.fog = new THREE.Fog(opts.fogColor, opts.fogNear, opts.fogFar);
        scene.add(camera);

    elemWrap.appendChild(renderer.domElement);

    this.renderer = renderer;
    this.camera   = camera;
    this.scene    = scene;

  }
  initGui() {

    this.gui = new dat.GUI();
    this.gui.__proto__.constructor.toggleHide()

    this.fields = { };

    // View

    // Particles

    let folderParticles = this.gui.addFolder('Particles');

    this.fields.particleSize = folderParticles.add(this, 'particleSize', 0.25, 2).listen();
    this.fields.particleSize.onChange((val) => {
      this.pts.material.uniforms.uParticleSize.value = val;
    })

    this.fields.particleSpacing = folderParticles.add(this, 'particleSpacing', 0.25, 0.75).listen();
    this.fields.particleSpacing.onChange(this.handleViewChange);

    this.fields.particleAreaW = folderParticles.add(this, 'particleAreaW', 1, 50).listen();
    this.fields.particleAreaW.onChange(this.handleViewChange);

    this.fields.particleAreaH = folderParticles.add(this, 'particleAreaH', 1, 50).listen();
    this.fields.particleAreaH.onChange(this.handleViewChange);

    // Camera

    let folderCam = this.gui.addFolder('Camera');

    this.fields.camPosX = folderCam.add(this.camera.position, 'x', -20, 20).listen();
    this.fields.camPosX.onChange(this.handleCamChange);

    this.fields.camPosY = folderCam.add(this.camera.position, 'y', -20, 20).listen();
    this.fields.camPosY.onChange(this.handleCamChange);

    this.fields.camPosZ = folderCam.add(this.camera.position, 'z', -20, 20).listen();
    this.fields.camPosZ.onChange(this.handleCamChange);

    this.fields.camFov  = folderCam.add(this.camera, 'fov', 0, 180).listen();
    this.fields.camFov.onChange(this.handleCamChange);

    this.fields.camNear = folderCam.add(this.camera, 'near', 0, 10);
    this.fields.camNear.onChange(this.handleCamChange);

    this.fields.camFar  = folderCam.add(this.camera, 'far', 1, 25);
    this.fields.camFar.onChange(this.handleCamChange);

    // Color

    let folderColor = this.gui.addFolder('Color');

    this.fields.colorA = folderColor.addColor(this, 'colorA').listen();
    this.fields.colorA.onChange((val) => {
      this.pts.material.uniforms.uColorA.value = this.toThreeColor(val);
    });
    this.fields.colorB = folderColor.addColor(this, 'colorB').listen();
    this.fields.colorB.onChange((val) => {
      this.pts.material.uniforms.uColorB.value = this.toThreeColor(val);
    });

    this.fields.colorNoiseScale = folderColor.add(this, 'noiseColorScale', 0, 1).listen();
    this.fields.colorNoiseSpeed = folderColor.add(this, 'noiseColorSpeed', 0, 1).listen();

    this.fields.colorBgTop = folderColor.addColor(this, 'bgColorTop');
    this.fields.colorBgTop.onChange((val) => {
      this.bgColorTop = val;
      this.updateBg();
    });

    this.fields.colorBgBtm = folderColor.addColor(this, 'bgColorBtm');
    this.fields.colorBgBtm.onChange((val) => {
      this.bgColorBtm = val;
      this.updateBg();
    });

    this.fields.colorBgRotation = folderColor.add(this, 'bgRotation', 0, 1);
    this.fields.colorBgRotation.onChange((val) => {
      this.bgRotation = val;
      this.updateBg();
    });

    // Wave Noise

    let folderNoiseA = this.gui.addFolder('Wave Noise A');
    this.fields.waveNoiseAScale = folderNoiseA.add(this, 'noiseAScale', 0, 1).listen();
    this.fields.waveNoiseASpeed = folderNoiseA.add(this, 'noiseASpeed', 0, 1).listen();
    this.fields.waveNoiseALevel = folderNoiseA.add(this, 'noiseALevel', 0, 2).listen();

    let folderNoiseB = this.gui.addFolder('Wave Noise B');
    this.fields.waveNoiseBScale = folderNoiseB.add(this, 'noiseBScale', 0, 1).listen();
    this.fields.waveNoiseBSpeed = folderNoiseB.add(this, 'noiseBSpeed', 0, 1).listen();
    this.fields.waveNoiseBLevel = folderNoiseB.add(this, 'noiseBLevel', 0, 2).listen();

  }


  // Event handlers

  handleFrame = (e) => {

    this.timeElapsed = (Date.now() - this.timeStart);

    this.updateParticles();
    this.updateVals();

    this.pts.material.uniforms.uElapsed.value = this.timeElapsed;

    this.renderer.render(this.scene, this.camera);

    this.anim = requestAnimationFrame(this.handleFrame);

  }
  handleResize = (e) => {

    this.winW = window.innerWidth,
    this.winH = window.innerHeight;

    this.handleCamChange();

    this.renderer.setSize(this.winW, this.winH);

  }

  handleViewChange = (value) => {

    this.clearParticles();

    this.makeParticles();

  }
  handleCamChange = (value) => {
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.aspect = this.winW / this.winH;
    this.camera.updateProjectionMatrix();
  }


  // Methods

  start() {

    this.makeParticles();
    this.updateBg();

    this.anim = requestAnimationFrame(this.handleFrame);

    window.addEventListener('resize', this.handleResize, false);

  }

  makeParticles() {

    let verts       = this.generateVerts(),
        count       = verts.length / 3,
        colorRatios = _.times(count, (i) => 0.5);

    let geom = new THREE.BufferGeometry();
        geom.addAttribute(  'position', new THREE.BufferAttribute(new Float32Array(verts), 3));
        geom.addAttribute('colorRatio', new THREE.BufferAttribute(new Float32Array(colorRatios), 1));
        geom.computeBoundingSphere();

    let mat = new THREE.ShaderMaterial({
      uniforms: {
        uElapsed: {
          type: 'f',
          value: 0
        },
        uParticleSize: {
          type: 'f',
          value: this.particleSize
        },
        uColorA: {
          type: 'c',
          value: this.toThreeColor(this.colorA)
        },
        uColorB: {
          type: 'c',
          value: this.toThreeColor(this.colorB)
        },
        uTextureParticle: {
          type: 't',
          value: new THREE.TextureLoader().load(imgParticle)
        },
      },
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexShader: shaderVert,
      fragmentShader: shaderFrag
    });

    this.pts = new THREE.Points(geom, mat);

    this.scene.add(this.pts);

  }

  updateBg() {

    document.body.style = `background: linear-gradient(${this.bgRotation}turn, ${this.bgColorTop}, ${this.bgColorBtm});`;

  }
  updateParticles() {

    let verts       = this.pts.geometry.attributes.position.array,
        colorRatios = this.pts.geometry.attributes.colorRatio.array;

    for (let i = 0; i < verts.length; i += 3) {

      // Z Position

      let x = verts[i + 0],
          y = verts[i + 1],
          z = verts[i + 2];

      let noiseA = this.noiseALevel * this.simplexA.noise3D(
        x * this.noiseAScale,
        y * this.noiseAScale,
        this.noiseASpeed * (this.timeElapsed / 1000)
      );

      let noiseB = this.noiseBLevel * this.simplexB.noise3D(
        x * this.noiseBScale,
        y * this.noiseBScale,
        this.noiseBSpeed * (this.timeElapsed / 1000)
      );

      let trgtZ = noiseA + noiseB;

      if (verts[i + 2] != trgtZ) {
        verts[i + 2] = trgtZ;
      }

      // Color

      let colorIndex = Math.floor(i / 3);

      let noiseColor = this.simplexColor.noise3D(
        x * this.noiseColorScale,
        y * this.noiseColorScale,
        this.noiseColorSpeed * (this.timeElapsed / 1000)
      );
      noiseColor = Math.pow(maths.clamp((0.5 * noiseColor) + 0.5), 2);

      colorRatios[colorIndex] = noiseColor;

    }

    this.pts.geometry.attributes.position.needsUpdate   = true;
    this.pts.geometry.attributes.colorRatio.needsUpdate = true;

  }

  updateVals() {

    this.particleSize    = maths.ease(this.particleSize, this.trgtParticleSize, 0.025, 0);
    this.pts.material.uniforms.uParticleSize.value = this.particleSize;

    this.camera.position.x   = maths.ease(this.camera.position.x, this.trgtCamPosX, 0.0025, 0);
    this.camera.position.y   = maths.ease(this.camera.position.y, this.trgtCamPosY, 0.0025, 0);
    this.camera.position.z   = maths.ease(this.camera.position.z, this.trgtCamPosZ, 0.0025, 0);
    this.camera.position.fov = maths.ease(this.camera.position.fov, this.trgtCamFov, 0.0025, 0);
    this.handleCamChange();

  }

  clearParticles() {
    if(this.pts !== null){
      this.scene.remove(this.pts);
      this.pts.geometry.dispose();
      this.pts.material.dispose();
      this.pts = null;
    }

  }

  randomizeView() {

    this.trgtParticleSize = random.num(this.fields.particleSize.__min, this.fields.particleSize.__max);

    this.particleAreaW = random.num(this.fields.particleAreaW.__min, this.fields.particleAreaW.__max);
    this.particleAreaH = random.num(this.fields.particleAreaH.__min, this.fields.particleAreaH.__max);
    this.particleSpacing = random.num(this.fields.particleSpacing.__min, this.fields.particleSpacing.__max);
    this.handleViewChange();

    this.trgtCamPosX = random.num(this.fields.camPosX.__min, this.fields.camPosX.__max);
    this.trgtCamPosY = random.num(this.fields.camPosY.__min, this.fields.camPosY.__max);
    this.trgtCamPosZ = random.num(this.fields.camPosZ.__min, this.fields.camPosZ.__max);
    this.trgtCamFov  = random.num(this.fields.camFov.__min, this.fields.camFov.__max);

    this.colorA = colors.toHex(random.color());
    this.colorB = colors.toHex(random.color());
    this.pts.material.uniforms.uColorA.value = this.toThreeColor(this.colorA);
    this.pts.material.uniforms.uColorB.value = this.toThreeColor(this.colorB);

    this.noiseColorScale   = random.num(this.fields.colorNoiseScale.__min, this.fields.colorNoiseScale.__max);
    this.noiseColorSpeed   = random.num(this.fields.colorNoiseSpeed.__min, this.fields.colorNoiseSpeed.__max);

    this.noiseAScale = random.num(this.fields.waveNoiseAScale.__min, this.fields.waveNoiseAScale.__max);
    this.noiseASpeed = random.num(this.fields.waveNoiseASpeed.__min, this.fields.waveNoiseASpeed.__max);
    this.noiseALevel = random.num(this.fields.waveNoiseALevel.__min, this.fields.waveNoiseALevel.__max);
    this.noiseBScale = random.num(this.fields.waveNoiseBScale.__min, this.fields.waveNoiseBScale.__max);
    this.noiseBSpeed = random.num(this.fields.waveNoiseBSpeed.__min, this.fields.waveNoiseBSpeed.__max);
    this.noiseBLevel = random.num(this.fields.waveNoiseBLevel.__min, this.fields.waveNoiseBLevel.__max);

  }

  nextScene() {

    this.randomizeView();

    setTimeout(() => {
      this.nextScene()
    }, random.num(3000, 10000));

  }


  // Helpers

  generateVerts() {

    const colCount = Math.ceil(this.particleAreaW / this.particleSpacing),
          rowCount = Math.ceil(this.particleAreaH / this.particleSpacing);

    let verts = [];

    _.times(rowCount, (row) => {
      _.times(colCount, (col) => {

        let x = (-this.particleAreaW / 2) + (col * this.particleSpacing) + ((row % 2) * (this.particleSpacing / 2)),
            y = (-this.particleAreaH / 2) + (row * this.particleSpacing),
            z = 0;

        verts.push(x, y, z);

      })
    });

    return verts;

  }

  toThreeColor(hex) {
    return new THREE.Color(colors.fromHex(hex));
  }

}
