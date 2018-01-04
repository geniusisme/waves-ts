precision mediump float;

const vec3 light_direction = vec3(0.3, 0.1, -1.0);
const vec3 user_direction = vec3(0.0, -0.5, -5.0);
const vec3 diffuse_color = vec3(0.04, 0.01, 0.8);
const vec3 specular_color = vec3(1.0, 1.0, 1.0);
const float smoothness = 16.0;
const float ambient = 0.2;

varying vec3 position;
varying vec3 normal;

void main(void) {
    vec3 light_dir = normalize(light_direction);
    vec3 user_dir = normalize(user_direction);
    vec3 middle_dir = normalize(user_dir - light_dir);
    float specular = clamp(dot(normal, middle_dir), 0.0, 1.0);
    specular = pow(specular, smoothness);
    float diffuse = dot(normal, -light_dir);
    vec3 final = (diffuse_color * diffuse) + specular_color * specular + diffuse_color * ambient;
    final = pow(final, vec3(1.0 / 2.2));

    gl_FragColor = vec4(final, 1.0);
}
