import Matter from "matter-js"
import { CritterSettings } from "../../CritterFactory"
import { Graphics } from "pixi.js"

export function ceratron(x: number, y: number, team: number): CritterSettings {

    const radius = 10
    const body = Matter.Bodies.circle(
        x,
        y,
        radius
    )
    const triangleWidth = 15
    const triangleHeight = 25
    let graphics = new Graphics() //new Graphics(settings.graphicsContext)

    graphics.moveTo(triangleWidth / 2, 0)
    graphics.lineTo(triangleWidth, triangleHeight)
    graphics.lineTo(0, triangleHeight)
    graphics.lineTo(triangleWidth / 2, 0)
    graphics.fill(0x3399ff);
    graphics.stroke({ width: 4, color: 0x0000b3 });
    //this.container.addChild(graphics)
    //graphics.position.set(settings.x - triangleWidth / 2, settings.y - triangleHeight / 2) //not needed, as handled in update?
    graphics.pivot.set(triangleWidth / 2, triangleHeight / 2)
    return {
        team: team,
        x: x,
        y: y,
        body: body,
        graphics: graphics,
        fireDelay: 0.4,
        movementSpeed: 0.6,
        power: 4,
        projectileLifetime: 0.5,
        projectileSpeed: 1,
        totalHealth: 85,
        name: 'ceratron'
    }
}