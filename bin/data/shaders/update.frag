#version 120

#extension GL_ARB_texture_rectangle : enable
#extension GL_ARB_draw_buffers : enable

// ユーティリティのインクルード
#pragma include "util.frag"
// 4D Simplex Noiseのインクルード
#pragma include "noise4D.frag"

uniform sampler2DRect u_posAndAgeTex;
uniform sampler2DRect u_velAndMaxAgeTex;
uniform float u_time;
uniform float u_timestep;
uniform float u_scale;
uniform vec3 u_emitterPos;
uniform vec3 u_prevEmitterPos;
uniform vec2 u_resolution;
uniform int  u_startShape;
uniform int  u_rotatePattern;

void main(void){
    vec2 st = gl_TexCoord[0].st;  // 0〜テクスチャのピクセル数
    // 前の位置情報とパーティクル初期化からの経過時間を取得
    vec4 posAndAge = texture2DRect(u_posAndAgeTex,st);
    // 前の速度と生存期間を取得
    vec4 velAndMaxAge = texture2DRect(u_velAndMaxAgeTex,st);
    
    vec3 pos = posAndAge.xyz; // 前の位置
    vec3 vel = velAndMaxAge.xyz; // 前の速度
    
    float age = posAndAge.w; // 経過時間
    float maxAge = velAndMaxAge.w; // 生存期間

    age++;
    
    // パーティクルが生存期間を過ぎたら初期化
    if(age >= maxAge){
        age = 0;
        maxAge = 50.0 + 250.0 * random(pos.xx);
        float theta = 2.0 * PI * random(pos.yy);
        float phi = PI * random(pos.zz);
        float r = 5.0 * random(pos.xy);

        vec3 startPos = vec3(0.0);

        if(u_startShape == 1){
            // Sphere Start
            float sphereR = 200.0;
            startPos = vec3(sphereR * cos(st.x) * cos(st.y), sphereR * cos(st.x) * sin(st.y), sphereR * sin(st.x));
        }

        if(u_startShape == 2){
            // Traiangle Start
            float xoffset = -(1.0/3.0 * u_resolution.x)/2.0;
            float yoffset = -(1.0/2.0 * u_resolution.x)/2.0;
            if(st.x < (u_resolution.x / 3.0)) {
                startPos = vec3(st.x - (u_resolution.x / 2.0) - xoffset, -1.73 * st.x * sin(1.0/3.0 * PI) - yoffset, 0.0);
            }else if(st.x >= (u_resolution.x / 3.0) && st.x < ((u_resolution.x / 3.0) * 2.0)){
                startPos = vec3(st.x - (u_resolution.x / 2.0) - xoffset, 1.73 * st.x * sin(1.0/3.0 * PI) -u_resolution.x - yoffset, 0.0);
            }else{
                startPos = vec3(2.0 * st.x - u_resolution.x / 2.0 - 2.0/3.0 * u_resolution.x - 2.0/ 3.0 * u_resolution.x - xoffset, -yoffset, 0.0);
            }
        }

        float rotateFlg = mod(u_rotatePattern,3);
        if(rotateFlg == 1){
            startPos = rotate(startPos, 60., vec3(0., 0., 1.));
        }else if(rotateFlg == 2){
            startPos = rotate(startPos, 120., vec3(0., 0., 1.));
        }

        pos = startPos + vec3(r * sin(theta) * cos(phi), r * sin(theta) * sin(phi), r * cos(theta));
        
        vel.xyz = vec3(normalize(startPos));
    }
    
    // Curl Noiseで速度を更新
    vel.x += snoise(vec4(pos.x * u_scale, pos.y * u_scale, pos.z * u_scale, 0.1352 * u_time * u_timestep));
    vel.y += snoise(vec4(pos.x * u_scale, pos.y * u_scale, pos.z * u_scale, 1.2814 * u_time * u_timestep));
    vel.z += snoise(vec4(pos.x * u_scale, pos.y * u_scale, pos.z * u_scale, 2.5564 * u_time * u_timestep));
   
    pos += vel;
    
    gl_FragData[0].rgba = vec4(pos, age); // 位置と経過時間を出力
    gl_FragData[1].rgba = vec4(vel, maxAge); //速度と生存期間を出力
}