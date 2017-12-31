const float pi = 3.1415926;
const int max_ripples = 8;

attribute vec3 coordinates;

uniform float time;
uniform float strengths[max_ripples];
uniform vec3 centers[max_ripples];
uniform float starts[max_ripples];
uniform mat4 matrix;

varying vec3 position;
varying vec3 normal;

/// (x, y) is gradient and z is z position of the wave
vec3 effect_of_wave(float strength, vec3 center, float start, vec3 at_pos) {
    float wave_length = 0.05 + 0.15 * strength; // units
    float dist_kf = 2.0 * pi / wave_length;
    float wave_speed = 0.2; // units per sec
    float time_kf = -2.0 * pi / (wave_length / wave_speed);
    const float to_seconds = 0.001;

    float dist = length(at_pos - center);
    float dist_arg = dist_kf * dist;
    float time_arg = time_kf * to_seconds * (time - start);

    float wave_arg = dist_arg + time_arg;
    if (wave_arg > 0.0) {
        return vec3(0.0, 0.0, 0.0);
    }
    float amplitude = strength * 0.1 * - exp(wave_arg * 0.02);
    vec3 gradient = (center - at_pos) / (dist + 0.000001) * amplitude * dist_kf * cos(wave_arg);
    gradient *= 1.0 - exp(-dist * 50.0);
    return vec3(gradient.xy, amplitude * sin(wave_arg));
}

vec3 get_sum_effect(vec3 at_pos) {
    vec3 sum = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < max_ripples; ++i) {
        sum += effect_of_wave(strengths[i], centers[i], starts[i], at_pos);
    }
    return sum;
}

void main(void) {
    vec3 effect = get_sum_effect(coordinates);
    normal = normalize(vec3(effect.xy, 1.0));
    position = vec3(coordinates.xy, effect.z);
    gl_Position = matrix * vec4(coordinates.x, coordinates.y, coordinates.z, 1.0);
}

