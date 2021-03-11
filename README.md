# Pattern Experiments

Demonstrating the automatic creation of "textured image effects" - both static and animated - using any image provided from the archive.

---

## Overview of approach

The effects are drawn using the [HTML Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). For convenience, and in order to gain the performance benefits of WebGL, we use the library [Pixi.JS](https://www.pixijs.com/).

The main steps that are involved:

1. Load the high resolution "featured image"
1. Crop the image tightly (centred) and scale it to fit the entire screen
1. Calculate and store the _dominant colour_ using the library [ColorThief](https://lokeshdhakar.com/projects/color-thief/)
1. Apply some _filters_
   1. Make black and white
   1. Increase contrasts
   1. Apply a threshold effect (similar to [Photoshop threshold](https://layersmagazine.com/photoshop-layered-threshold.html) adjustment) using the brightness of the _dominant colour_ to set the threshold level appropriately
   1. Apply a noise [grain](https://www.shadertoy.com/view/4sXSWs) effect on the image
1. Finally, the image with the above effects is [blended](https://photoshoptrainingchannel.com/blending-modes-explained/#multiply) onto a solid background which is the _dominant colour_ again

When used as a transition effect, some of the parameters for the effects above (e.g. opacity, threshold value) are changed over time to create an animation.

Some of the filters used are "built-in" (i.e. provided with PixiJS) and some (threshold, grain) are custom-built [shaders](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_shaders_to_apply_color_in_WebGL) written in [GLSL](<https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)>).

### Compatibility and performance considerations

- Since the effect is entirely based on HTML Canvas drawing, no special extensions, plugins, etc. are needed.
- Pixi.JS is compatible with all modern browsers (Desktop and Mobile versions) including Chrome, Safari and Firefox.
- The prototype was written using the [React](https://reactjs.org/) library to make building the frontend UI easier, but PixiJS and the effect itself does not need React in order to work.

### Backend or frontend?

In our prototype, all of the processing is done in the browser (i.e. frontend Javascript) but in production it may be helpful to offload some of this work to backend (server side) processes, e.g:

- Scale and crop for common screen sizes in advance, to reduce file sizes and load times
- Create black and white version(s) of each image on the server, possibly with the threshold effect already applied, which will greatly reduce file sizes and load times
- Calculate the _dominant colour_ for each image just once - when it is first uploaded - so that this value does not need to be recalculated on the frontend. This same colour information will be used for colour filtering/ordering as well. The same [ColorThief](https://lokeshdhakar.com/projects/color-thief/) library works in NodeJS (server side) as well as frontend (client side).

---

## Development notes

### Development quick start

```
yarn install
yarn start
```

### React

Created with `create-react-app` - more details [here](./README_CREATE_REACT_APP)
