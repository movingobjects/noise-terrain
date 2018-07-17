
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

const GUI_DEFAULTS = {
  pixelRatio: 2.0,
  linesOn: true,
  fogColor: "#163646",
  fogNear: 5,
  fogFar: 15,
  particleSize: 1,
  particleSpacing: 0.5,
  particleAreaW: 25,
  particleAreaH: 5,
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
  bgColorTop: "#0b3039",
  bgColorBtm: "#0b2534",
  bgRotation: 0.875
}


// Class

export default class App {


  // Constructor

  constructor(elemWrap) {

    this.initState();
    this.initThree(elemWrap);
    this.initGui();

    this.start();

  }

  initState() {

    this.winW = window.innerWidth;
    this.winH = window.innerHeight;

    this.timeStart   = Date.now();
    this.timeElapsed = 0;

    this.lines       = [];
    this.pts         = null;

    this.simplexA     = new SimplexNoise();
    this.simplexB     = new SimplexNoise();
    this.simplexColor = new SimplexNoise();

    this.pixelRatio      = GUI_DEFAULTS.pixelRatio;
    this.fogColor        = GUI_DEFAULTS.fogColor;
    this.colorA          = GUI_DEFAULTS.colorA;
    this.colorB          = GUI_DEFAULTS.colorB;
    this.bgColorTop      = GUI_DEFAULTS.bgColorTop;
    this.bgColorBtm      = GUI_DEFAULTS.bgColorBtm;
    this.bgRotation      = GUI_DEFAULTS.bgRotation;
    this.particleSize    = GUI_DEFAULTS.particleSize;
    this.linesOn         = GUI_DEFAULTS.linesOn;
    this.particleSpacing = GUI_DEFAULTS.particleSpacing;
    this.particleAreaW   = GUI_DEFAULTS.particleAreaW;
    this.particleAreaH   = GUI_DEFAULTS.particleAreaH;
    this.noiseAScale     = GUI_DEFAULTS.noiseAScale;
    this.noiseASpeed     = GUI_DEFAULTS.noiseASpeed;
    this.noiseALevel     = GUI_DEFAULTS.noiseALevel;
    this.noiseBScale     = GUI_DEFAULTS.noiseBScale;
    this.noiseBSpeed     = GUI_DEFAULTS.noiseBSpeed;
    this.noiseBLevel     = GUI_DEFAULTS.noiseBLevel;
    this.noiseColorScale = GUI_DEFAULTS.noiseColorScale;
    this.noiseColorSpeed = GUI_DEFAULTS.noiseColorSpeed;

  }
  initThree(elemWrap) {

    const opts    = GUI_DEFAULTS;

    let renderer  = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(this.winW, this.winH);
        renderer.setPixelRatio(opts.pixelRatio);

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

    // View

    let folderView = this.gui.addFolder('View');

    let fieldPixelRatio = folderView.add(this, 'pixelRatio', 1, 3);
        fieldPixelRatio.onChange((val) => {
          this.renderer.setPixelRatio(val);
        });

    // Lines

    let folderLines  = this.gui.addFolder('Lines');

    let fieldLinesOn = folderLines.add(this, 'linesOn');
        fieldLinesOn.onChange(this.handleViewChange);

    let fieldFogColor = folderLines.addColor(this, 'fogColor');
        fieldFogColor.onChange((val) => {
          this.scene.fog.color = this.toThreeColor(val);
        })
        folderLines.add(this.scene.fog, 'near', 0, 25);
        folderLines.add(this.scene.fog, 'far', 0, 25);

    // Particles

    let folderParticles = this.gui.addFolder('Particles');

    let fieldSize = folderParticles.add(this, 'particleSize', 0.25, 4);
        fieldSize.onChange((val) => {
          this.pts.material.uniforms.uParticleSize.value = val;
        })

    let fieldSpacing = folderParticles.add(this, 'particleSpacing', 0.15, 0.75);
        fieldSpacing.onChange(this.handleViewChange);

    let fieldAreaW = folderParticles.add(this, 'particleAreaW', 1, 50);
        fieldAreaW.onChange(this.handleViewChange);

    let fieldAreaH = folderParticles.add(this, 'particleAreaH', 1, 50);
        fieldAreaH.onChange(this.handleViewChange);

    // Camera

    let folderCam = this.gui.addFolder('Camera');

    let fieldCamPosX = folderCam.add(this.camera.position, 'x', -20, 20);
        fieldCamPosX.onChange(this.handleCamChange);

    let fieldCamPosY = folderCam.add(this.camera.position, 'y', -20, 20);
        fieldCamPosY.onChange(this.handleCamChange);

    let fieldCamPosZ = folderCam.add(this.camera.position, 'z', -20, 20);
        fieldCamPosZ.onChange(this.handleCamChange);

    let fieldCamFov  = folderCam.add(this.camera, 'fov', 0, 180);
        fieldCamFov.onChange(this.handleCamChange);

    let fieldCamNear = folderCam.add(this.camera, 'near', 0, 10);
        fieldCamNear.onChange(this.handleCamChange);

    let fieldCamFar  = folderCam.add(this.camera, 'far', 1, 25);
        fieldCamFar.onChange(this.handleCamChange);

    // Color

    let folderColor = this.gui.addFolder('Color');
    let fieldColorA = folderColor.addColor(this, 'colorA');
        fieldColorA.onChange((val) => {
          this.pts.material.uniforms.uColorA.value = this.toThreeColor(val);
        });
    let fieldColorB = folderColor.addColor(this, 'colorB');
        fieldColorB.onChange((val) => {
          this.pts.material.uniforms.uColorB.value = this.toThreeColor(val);
        });

        folderColor.add(this, 'noiseColorScale', 0, 1);
        folderColor.add(this, 'noiseColorSpeed', 0, 1);

    let fieldBgColorTop = folderColor.addColor(this, 'bgColorTop');
        fieldBgColorTop.onChange((val) => {
          this.bgColorTop = val;
          this.updateBg();
        });
    let fieldBgColorBtm = folderColor.addColor(this, 'bgColorBtm');
        fieldBgColorBtm.onChange((val) => {
          this.bgColorBtm = val;
          this.updateBg();
        });
    let fieldBgRotation = folderColor.add(this, 'bgRotation', 0, 1);
        fieldBgRotation.onChange((val) => {
          this.bgRotation = val;
          this.updateBg();
        });

    // Wave Noise

    let folderNoiseA = this.gui.addFolder('Wave Noise A');
        folderNoiseA.add(this, 'noiseAScale', 0, 1);
        folderNoiseA.add(this, 'noiseASpeed', 0, 1);
        folderNoiseA.add(this, 'noiseALevel', 0, 2);

    let folderNoiseB = this.gui.addFolder('Wave Noise B');
        folderNoiseB.add(this, 'noiseBScale', 0, 1);
        folderNoiseB.add(this, 'noiseBSpeed', 0, 1);
        folderNoiseB.add(this, 'noiseBLevel', 0, 2);

  }


  // Event handlers

  handleFrame = (e) => {

    this.timeElapsed = (Date.now() - this.timeStart);

    this.updateParticles();
    this.updateLines();

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
    this.clearLines();

    this.makeParticles();
    this.makeLines();

  }
  handleCamChange = (value) => {
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.aspect = this.winW / this.winH;
    this.camera.updateProjectionMatrix();
  }


  // Methods

  start() {

    this.makeParticles();
    this.makeLines();
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
  makeLines() {

    if (!this.linesOn) return;

    const colCount = Math.ceil(this.particleAreaW / this.particleSpacing),
          rowCount = Math.ceil(this.particleAreaH / this.particleSpacing);

    let verts = this.pts.geometry.attributes.position.array,
        linesGeometry = new THREE.Geometry();

    const addLine = (colA, rowA, colB, rowB) => {

      if (colA < 0 || colA >= colCount) return;
      if (colB < 0 || colB >= colCount) return;
      if (rowA < 0 || rowA >= rowCount) return;
      if (rowB < 0 || rowB >= rowCount) return;

      let indexA = 3 * (colA + (rowA * colCount)),
          indexB = 3 * (colB + (rowB * colCount));

      let vertA = new THREE.Vector3(
        verts[indexA + 0],
        verts[indexA + 1],
        verts[indexA + 2]
      );
      let vertB = new THREE.Vector3(
        verts[indexB + 0],
        verts[indexB + 1],
        verts[indexB + 2]
      );

      linesGeometry.vertices.push(vertA);
      linesGeometry.vertices.push(vertB);
    }

    _.times(rowCount, (row) => {
      _.times(colCount, (col) => {

        addLine(col, row, col + 1, row);
        addLine(col, row, col, row + 1);

        if (row % 2) {
          addLine(col, row, col + 1, row + 1);
        } else {
          addLine(col, row, col - 1, row + 1);
        }

      });
    });


    this.lines = new THREE.LineSegments(linesGeometry, new THREE.LineBasicMaterial({vertexColors: true, transparent: true}));
    this.scene.add(this.lines);

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
  updateLines() {

    if (!this.linesOn) return;

    const colCount = Math.ceil(this.particleAreaW / this.particleSpacing),
          rowCount = Math.ceil(this.particleAreaH / this.particleSpacing);

    const colorRgbA = colors.hexToRgb(this.colorA),
          colorRgbB = colors.hexToRgb(this.colorB);

    let verts       = this.pts.geometry.attributes.position.array,
        colorRatios = this.pts.geometry.attributes.colorRatio.array,
        lineIndex   = 0;

    const updateLine = (colA, rowA, colB, rowB) => {

      if (colA < 0 || colA >= colCount) return;
      if (colB < 0 || colB >= colCount) return;
      if (rowA < 0 || rowA >= rowCount) return;
      if (rowB < 0 || rowB >= rowCount) return;

      let indexA = 3 * (colA + (rowA * colCount)),
          indexB = 3 * (colB + (rowB * colCount));

      let colorRatioA = colorRatios[(colA + (rowA * colCount))],
          colorRatioB = colorRatios[(colB + (rowB * colCount))];

      let colorRatio = maths.lerp(colorRatioA, colorRatioB, 0.5),
          colorR     = maths.lerp(colorRgbA.r, colorRgbB.r, colorRatio),
          colorG     = maths.lerp(colorRgbA.g, colorRgbB.g, colorRatio),
          colorB     = maths.lerp(colorRgbA.b, colorRgbB.b, colorRatio);

      this.lines.geometry.vertices[lineIndex*2].x = verts[indexA];
      this.lines.geometry.vertices[lineIndex*2].y = verts[indexA + 1];
      this.lines.geometry.vertices[lineIndex*2].z = verts[indexA + 2];
      this.lines.geometry.vertices[lineIndex*2+1].x = verts[indexB];
      this.lines.geometry.vertices[lineIndex*2+1].y = verts[indexB + 1];
      this.lines.geometry.vertices[lineIndex*2+1].z = verts[indexB + 2];

      this.lines.geometry.verticesNeedUpdate = true;
      if(!this.lines.geometry.colors[lineIndex*2]) {
        this.lines.geometry.colors[lineIndex*2] = new THREE.Color(colorR, colorG, colorB);
        this.lines.geometry.colors[lineIndex*2+1] = new THREE.Color(colorR, colorG, colorB); 
      } else {
        this.lines.geometry.colors[lineIndex*2].r = colorR;
        this.lines.geometry.colors[lineIndex*2].g = colorG;
        this.lines.geometry.colors[lineIndex*2].b = colorB;
        this.lines.geometry.colors[lineIndex*2 + 1].r = colorR;
        this.lines.geometry.colors[lineIndex*2 + 1].g = colorG;
        this.lines.geometry.colors[lineIndex*2 + 1].b = colorB;
      }
      lineIndex++;
      this.lines.geometry.colorsNeedUpdate = true;
    }

    _.times(rowCount, (row) => {
      _.times(colCount, (col) => {

        updateLine(col, row, col + 1, row);
        updateLine(col, row, col, row + 1);

        if (row % 2) {
          updateLine(col, row, col + 1, row + 1);
        } else {
          updateLine(col, row, col - 1, row + 1);
        }

      });
    });

  }

  clearLines() {
    if(this.lines !== null){
      this.scene.remove(this.lines);
      this.lines.geometry.dispose();
      this.lines.material.dispose();
      this.lines = null;
    }
  }
  clearParticles() {
    if(this.pts !== null){
      this.scene.remove(this.pts);
      this.pts.geometry.dispose();
      this.pts.material.dispose();
      this.pts = null;
    }

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
