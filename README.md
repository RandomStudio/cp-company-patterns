# Pattern Experiments

Demonstrating the automatic creation of "textured image effects" - both static and animated - using any image provided from the archive.

## Development notes

### Development quick start

(This project favours the use of [yarn](https://yarnpkg.com/) over npm.)

```
yarn install
yarn start
```

### Languages / Frameworks / Libraries used

- Extensive use of [Pixi JS](https://www.pixijs.com/) for ease of WebGL (GPU-accelerated) HTML Canvas drawing
- Some custom [shaders](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_shaders_to_apply_color_in_WebGL) have been written using [GLSL](<https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)>)
- [React](https://reactjs.org/) was used for ease of UI development, but core functionality does not depend on React
- Created with `create-react-app` - more details [here](./README_CREATE_REACT_APP)
- Some of the core components and functionality are written in [TypeScript](https://www.typescriptlang.org/) to aid readability/documentation and enforce type safety
- [Sass](https://sass-lang.com/) is generally used instead of plain CSS
