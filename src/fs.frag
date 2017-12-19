precision mediump float;

varying vec3 position;

void main(void) {
   gl_FragColor = vec4(0.7, 0.7, position.z, 1.0);
}