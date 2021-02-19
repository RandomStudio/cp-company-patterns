varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float cutoff;

void main(void){
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = vTextureCoord;

  float grey = step(cutoff, color.r);

  gl_FragColor = vec4(grey, grey, grey, 1.0);


}
