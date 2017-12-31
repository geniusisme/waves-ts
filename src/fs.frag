precision mediump float;

const vec3 light_direction = vec3(0.3, 0.1, -1.0);
const vec3 user_direction = vec3(0.0, -0.5, -5.0);
const vec3 diffuse_color = vec3(0.3, 0.2, 0.8);
const vec3 specular_color = vec3(1.0, 1.0, 1.0);
const float smoothness = 4.0;

varying vec3 position;
varying vec3 normal;

void main(void) {
    vec3 light_dir = normalize(light_direction);
    vec3 user_dir = normalize(user_direction);
    vec3 middle_dir = normalize(user_dir - light_dir);
    float specular = clamp(dot(normal, middle_dir), 0.0, 1.0);
    specular = pow(specular, smoothness);
    float diffuse = dot(normal, -light_dir);
    gl_FragColor = vec4((diffuse_color * diffuse) + specular_color * specular, 1.0);
}