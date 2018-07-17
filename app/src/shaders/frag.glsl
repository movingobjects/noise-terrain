
uniform sampler2D uTextureParticle;
uniform float uElapsed;

varying vec3 vPos;
varying vec3 vColorA;
varying vec3 vColorB;
varying float vColorRatio;

float lerp(float a, float b, float w) {
  return a + (w * (b - a));
}

void main() {

  float
    r = lerp(vColorA.x, vColorB.x, vColorRatio),
    g = lerp(vColorA.y, vColorB.y, vColorRatio),
    b = lerp(vColorA.z, vColorB.z, vColorRatio),
    a = 1.0;

  gl_FragColor = texture2D(uTextureParticle, gl_PointCoord) * vec4(r, g, b, a);

}
