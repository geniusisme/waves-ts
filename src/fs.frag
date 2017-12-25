precision mediump float;

varying vec3 position;


void main(void) {
   gl_FragColor = vec4(0.0, 0.0, position.z * 5.0 + 0.3, 1.0);
}