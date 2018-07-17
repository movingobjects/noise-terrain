
attribute float colorRatio;

uniform float uElapsed;
uniform float uParticleSize;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec3 vPos;
varying vec3 vColorA;
varying vec3 vColorB;
varying float vColorRatio;

void main() {

  vec3 posNext = position;

  gl_PointSize = uParticleSize * (((8.0 - posNext.y) * 4.0) + (posNext.z * 5.0));
  gl_Position  = projectionMatrix * modelViewMatrix * vec4(posNext, 1.0);

  vPos         = posNext;
  vColorA      = uColorA;
  vColorB      = uColorB;
  vColorRatio  = colorRatio;

}
