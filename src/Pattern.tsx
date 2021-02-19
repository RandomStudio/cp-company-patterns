import React from "react";
import * as PIXI from 'pixi.js';

interface PatternProps {
  canvasSize: {
    width: number,
    height: number
  }
}

export default class Pattern extends React.Component<PatternProps, any> {

  private canvasRef: React.RefObject<HTMLCanvasElement>;
  private app: PIXI.Application | null;

  constructor(props: PatternProps) {
    super(props);
    this.canvasRef = React.createRef();
    this.app = null;
  }

  componentDidMount = () => {
    this.app = new PIXI.Application({
      view: this.canvasRef.current !== null ? this.canvasRef.current : undefined,
      backgroundColor: 0x000022,
      width: this.props.canvasSize.width,
      height: this.props.canvasSize.height
    });
    
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xDE3249);
    graphics.drawRect(50, 50, 100, 100);
    graphics.endFill();

    this.app.stage.addChild(graphics);
  }

  render = () => (
    <div style={{ height: this.props.canvasSize.height }}>
      <canvas ref={this.canvasRef} style={{ position: 'absolute', top: 0, left: 0}}></canvas>
    </div>
  )

}