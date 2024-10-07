import Matter from "matter-js";
import { Viewport } from "pixi-viewport";
import { Application, Graphics } from "pixi.js";
import { Settings } from "../../Settings";

//rect
// const WORLD_WIDTH = 1000 // Matter units
// const WORLD_HEIGHT = 700
// const WALL_WIDTH = 30



//const WORLD_WIDTH_2 = 1000

// function helper(worldWidth, worldHeight, wallWidth, boundColor) {

// }


export function makeBoundsCircle(_app: Application, engine: Matter.Engine, viewport: Viewport) {
    // https://github.com/liabru/matter-js/issues/659
    for (var i = 0; i < 90; i++) {
        let tinyRect = Matter.Bodies.rectangle(
            Settings.WORLD_CENTER_X + Math.cos(i * 4 * Math.PI / 180) * Settings.WORLD_RADIUS,
            Settings.WORLD_CENTER_Y + Math.sin(i * 4 * Math.PI / 180) * Settings.WORLD_RADIUS,
            Settings.WORLD_RADIUS / 16,
            Settings.WORLD_RADIUS / 16,
            {
                isStatic: true,
                angle: Math.PI / 180 * i * 4,
                label: `BOUNDS`,
                collisionFilter : {
                    category: Settings.collisionCategories.WALL
                }
            }
        );
        Matter.World.add(engine.world, tinyRect);
    }

    const circG = new Graphics()
    circG.circle(Settings.WORLD_CENTER_X * 2, Settings.WORLD_CENTER_Y * 2, Settings.WORLD_RADIUS * 2)
    circG.stroke({width: Settings.WORLD_RADIUS * 2 / 16, color: Settings.BOUND_COLOR});
    viewport.addChild(circG)
}

// function makeBoundsRect(app: Application, engine: Matter.Engine, viewport: Viewport) {

//     const left = Matter.Bodies.rectangle(
//         -WALL_WIDTH / 2, //CENTER x
//         WORLD_HEIGHT / 2,
//         WALL_WIDTH,
//         WORLD_HEIGHT
//     )
//     left.isSensor = false
//     left.isStatic = true
//     left.label = `BOUNDS`
//     left.collisionFilter.category = Settings.collisionCategories.WALL
//     //left.collisionFilter.m
//     Matter.World.addBody(engine.world, left);

//     const leftG = new Graphics()
//     leftG.rect(-WALL_WIDTH * 2, 0, WALL_WIDTH * 2, WORLD_HEIGHT * 2)
//     leftG.fill(BOUND_COLOR);
//     viewport.addChild(leftG)




//     const right = Matter.Bodies.rectangle(
//         WORLD_WIDTH + WALL_WIDTH / 2,
//         WORLD_HEIGHT / 2,
//         WALL_WIDTH,
//         WORLD_HEIGHT
//     )
//     right.isSensor = false
//     right.isStatic = true
//     right.label = `BOUNDS`
//     right.collisionFilter.category = Settings.collisionCategories.WALL
//     Matter.World.addBody(engine.world, right);

//     const rightG = new Graphics()
//     rightG.rect(WORLD_WIDTH * 2, 0, WALL_WIDTH * 2, WORLD_HEIGHT * 2)
//     rightG.fill(BOUND_COLOR);
//     viewport.addChild(rightG)




//     const top = Matter.Bodies.rectangle(
//         WORLD_WIDTH / 2,
//         -WALL_WIDTH / 2,
//         WORLD_WIDTH + WALL_WIDTH * 2,
//         WALL_WIDTH
//     )
//     top.isSensor = false
//     top.isStatic = true
//     top.label = `BOUNDS`
//     top.collisionFilter.category = Settings.collisionCategories.WALL
//     Matter.World.addBody(engine.world, top);

//     const topG = new Graphics()
//     topG.rect(-WALL_WIDTH * 2, -WALL_WIDTH * 2, WORLD_WIDTH * 2 + WALL_WIDTH * 4, WALL_WIDTH * 2)
//     topG.fill(BOUND_COLOR);
//     viewport.addChild(topG)




//     const bottom = Matter.Bodies.rectangle(
//         WORLD_WIDTH / 2,
//         WORLD_HEIGHT + WALL_WIDTH / 2,
//         WORLD_WIDTH + WALL_WIDTH * 2,
//         WALL_WIDTH
//     )
//     bottom.isSensor = false
//     bottom.isStatic = true
//     bottom.label = `BOUNDS`
//     bottom.collisionFilter.category = Settings.collisionCategories.WALL
//     Matter.World.addBody(engine.world, bottom);

//     const bottomG = new Graphics()
//     bottomG.rect(-WALL_WIDTH * 2, WORLD_HEIGHT * 2, WORLD_WIDTH * 2 + WALL_WIDTH * 4, WALL_WIDTH * 2)
//     bottomG.fill(BOUND_COLOR);
//     viewport.addChild(bottomG)

// }

export function destroyBounds() {
    console.log('method not implemented');
}