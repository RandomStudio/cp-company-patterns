// adapted from https://www.shadertoy.com/view/4sXSWs
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float random;
uniform float strength;

void main(void){
   vec4 color = texture2D(uSampler, vTextureCoord);

    // float strength = 16.0;

    vec2 uv = vTextureCoord;

    float iTime = (vTextureCoord.x + vTextureCoord.y) * random;

    
    float x = (uv.x + 4.0 ) * (uv.y + 4.0 ) * (iTime * 10.0);
    vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;
    
    if(abs(uv.x - 0.5) < 0.002)
        color = vec4(0.0);
    
    if(uv.x > 0.5)
    {
    	grain = 1.0 - grain;
		gl_FragColor = color * grain;
    }
    else
    {
		gl_FragColor = color + grain;
    }



}
