const float pi = 3.1415926;
const int max_ripples = 8;

attribute vec3 coordinates;

uniform float time;
uniform float amplitudes[max_ripples];
uniform vec3 centers[max_ripples];
uniform float starts[max_ripples];

varying vec3 position;

float get_z(vec3 pos) {
    const float wave_length = 0.3; // units
    const float dist_kf = 2.0 * pi / wave_length;
    const float wave_speed = 0.3; // units per sec
    const float time_kf = -2.0 * pi / (wave_length / wave_speed);
    const float to_seconds = 0.001;

    float dist = length(centers[0] - pos);
    float time = to_seconds * (time - starts[0]);

    return amplitudes[0] * sin(dist_kf * dist + time_kf * time );
}

void main(void) {
    position = vec3(coordinates.x, coordinates.y, get_z(coordinates));
    gl_Position = vec4(coordinates, 1.0);
}

