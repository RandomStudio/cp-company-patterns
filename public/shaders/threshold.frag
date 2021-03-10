varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float cutoff;
uniform bool useAlpha;

void main(void){
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = vTextureCoord;

  float finalColour = step(cutoff, color.r);

  gl_FragColor = vec4(finalColour, finalColour, finalColour, useAlpha ? step(1.0, 1.0-finalColour) : 1.0);


}
