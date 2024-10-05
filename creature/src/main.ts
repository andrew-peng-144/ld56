import { Application, Assets } from 'pixi.js';
import { Game } from './GameRoot'
import MainLoop from "mainloop.js";
import Matter from "matter-js";

import { Viewport } from "pixi-viewport";
import { Application, Assets, Sprite, Texture, TextureStyle, Ticker, TickerCallback } from "pixi.js";
import { TestScreen } from "./screens/TestScreen";
import './style.css'
import { IScreen } from './screens/IScreen';




// top level definitions
const V_WIDTH = 1200
const V_HEIGHT = 720

var currentScreen : IScreen;




function update(time: Ticker) {
  currentScreen.onUpdate(time)
}
function resize(pixi_canvas: HTMLCanvasElement, matter_canvas: HTMLCanvasElement) {
  //debugger

  //const minWidth = 500;
  //const minHeight = 700;

  // https://www.pixijselementals.com/#letterbox-scale
  // current screen size
  const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  // uniform scale for our game
  const scale = Math.min(screenWidth / V_WIDTH, screenHeight / V_HEIGHT);


  // the "uniformly englarged" size for our game
  let enlargedWidth = Math.floor(scale * V_WIDTH);
  let enlargedHeight = Math.floor(scale * V_HEIGHT);

  //enlargedWidth = Math.max(enlargedWidth, minWidth)
  //enlargedHeight = Math.max(enlargedHeight, minWidth * screenHeight / screenWidth)

  // margins for centering our game
  const horizontalMargin = (screenWidth - enlargedWidth) / 2;
  const verticalMargin = (screenHeight - enlargedHeight) / 2;

  // now we use css trickery to set the sizes and margins
  pixi_canvas.style.width = `${enlargedWidth}px`;
  pixi_canvas.style.height = `${enlargedHeight}px`;
  pixi_canvas.style.marginLeft = pixi_canvas.style.marginRight = `${horizontalMargin}px`;
  pixi_canvas.style.marginTop = pixi_canvas.style.marginBottom = `${verticalMargin}px`;

  matter_canvas.style.width = `${enlargedWidth}px`;
  matter_canvas.style.height = `${enlargedHeight}px`;
  matter_canvas.style.marginLeft = matter_canvas.style.marginRight = `${horizontalMargin}px`;
  matter_canvas.style.marginTop = matter_canvas.style.marginBottom = `${verticalMargin}px`;



  window.scrollTo(0, 0);

  // Update renderer dimensions
  //app.renderer.resize(width, height);



  //viewport.resize(width, height)

}

async function main() {

  // assets
  await Assets.init({ manifest: "./assets/manifest.json" })

  // Load assets for the load screen
  await Assets.loadBundle('load-screen');

  // Start up background loading of all bundles
  //Assets.backgroundLoadBundle('game-screen');

  // just load all for now
  await Assets.loadBundle('game-screen')

  let app = new Application()
  // Intialize the application.



  await app.init({
    background: '#d6f5f5',
    //resizeTo: window, // incompatible with letterbox scale
    resolution: window.devicePixelRatio || 1,
    width: V_WIDTH,
    height: V_HEIGHT
  });
  TextureStyle.defaultOptions.scaleMode = 'nearest';

  // Then adding the application's canvas to the DOM body.
  app.canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
  document.body.appendChild(app.canvas);






  // CAMERA
  const viewport = new Viewport({
    screenWidth: V_WIDTH,
    screenHeight: V_HEIGHT,
    // worldWidth: 1000,
    // worldHeight: 1000,

    events: app.renderer.events
  });
  // add the viewport to the stage
  app.stage.addChild(viewport)
  viewport.drag({
    mouseButtons: 'right-middle'
  });
  viewport.wheel();







  // matter stuff

  // 2nd canvas for matter debug renderer because it uses 2d context but pixi uses webgl?
  var matter_canvas = document.createElement('canvas');

  matter_canvas.id = "sdfg";
  matter_canvas.style.zIndex = '8';
  matter_canvas.style.position = "absolute";
  matter_canvas.style.border = "1px solid";
  matter_canvas.style.pointerEvents = "none"; //click thru it.
  matter_canvas.style.top = "0"
  matter_canvas.style.left = "0"
  document.body.appendChild(matter_canvas);
  const matter_canvas_ctx = matter_canvas.getContext('2d')!;
  matter_canvas_ctx.globalAlpha = 0;


  const engine = Matter.Engine.create();
  engine.gravity.y = 0

  const asdfBody = Matter.Bodies.rectangle(
    150, 150, 50, 50
  )
  Matter.World.addBody(engine.world, asdfBody)

  const renderer = Matter.Render.create({
    engine: engine,
    canvas: matter_canvas,
    options: {
      background: 'transparent',
      wireframeBackground: 'transparent',
      hasBounds: true,
      showDebug: true,
      showPositions: true,
      //showMousePosition: true,
      pixelRatio: 1,
      wireframes: true,
      showVelocity: true,
      showAngleIndicator: true,
      showCollisions: true
    }
  })

  Matter.Render.run(renderer)

  window.addEventListener('resize', () => resize(app.canvas, matter_canvas))
  resize(app.canvas, matter_canvas)

  currentScreen = new TestScreen(app, viewport, engine)
  
  // TIICKER
  app.ticker.add(update);

}
main()