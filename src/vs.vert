attribute vec3 coordinates;
uniform float time;

varying vec3 position;

const float PI = 3.1415926;

struct Ripple {
    vec3 center;
    float start_time;
};

const Ripple r = Ripple( vec3(0.6, 0.6, 0.0), 0.0 );

float get_z(vec3 pos, Ripple ripple) {
    const float wave_length = 0.3; // units
    const float dist_kf = 2.0 * PI / wave_length;
    const float wave_speed = 0.3; // units per sec
    const float time_kf = -2.0 * PI / (wave_length / wave_speed);
    const float to_seconds = 0.001;

    float dist = length(ripple.center - pos);
    float time = to_seconds * (time - ripple.start_time);

    return sin(dist_kf * dist + time_kf * time );
}

void main(void) {
    position = vec3(coordinates.x, coordinates.y, get_z(coordinates, r));
    gl_Position = vec4(coordinates, 1.0);
}

