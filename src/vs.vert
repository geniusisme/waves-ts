const float pi = 3.1415926;
const int max_ripples = 8;

attribute vec3 coordinates;

uniform float time;
uniform float amplitudes[max_ripples];
uniform vec3 centers[max_ripples];
uniform float starts[max_ripples];

varying vec3 position;

float z_of_wave(float amplitude, vec3 center, float start, vec3 at_pos) {
    const float wave_length = 0.3; // units
    const float dist_kf = 2.0 * pi / wave_length;
    const float wave_speed = 0.3; // units per sec
    const float time_kf = -2.0 * pi / (wave_length / wave_speed);
    const float to_seconds = 0.001;

    float dist = length(center - at_pos);
    float time = to_seconds * (time - start);

    return amplitude * sin(dist_kf * dist + time_kf * time );
}

float get_z(vec3 at_pos) {
    float sum = 0.0;
    for (int i = 0; i < max_ripples; ++i) {
        sum += z_of_wave(amplitudes[i], centers[i], starts[i], at_pos);
    }
    return sum;
}

void main(void) {
    position = vec3(coordinates.x, coordinates.y, get_z(coordinates));
    gl_Position = vec4(coordinates, 1.0);
}

