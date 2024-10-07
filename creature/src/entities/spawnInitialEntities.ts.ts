import { Random } from "random-js";
import { WaveHelper } from "../screens/helper/WaveHelper";
import { Critter } from "./CritterFactory";
import { EntityStore } from "./EntityStore";
import { Projectile, ProjectileFactory } from "./ProjectileFactory";
import { makeVirus1 } from "./entity-building/makeVirus";
import { MyMath } from "../utils/MyMath";
import { Settings } from "../Settings";
import { Viewport } from "pixi-viewport";



export function makeLevelLayout(engine: Matter.Engine, viewport: Viewport,  critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random) {


    // hexagon
    let scaleToBorder = 0.8
    let radius = Settings.WORLD_RADIUS  * scaleToBorder

    for (let deg = 0; deg < 360; deg += 60) {
        spawnSupers(
            radius
            ,MyMath.toRadians(deg)
            ,engine, viewport, critters, projectiles, projectileFactory, rng
        )
    }
}

function spawnSupers(r: number, t: number, engine: Matter.Engine, viewport: Viewport, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random) {

    let newVirus = projectileFactory.create(
        makeVirus1(
            {
                centerX: r * Math.cos(t),
                centerY: r * Math.sin(t),
                color: 0x9999ff,
                intervalMs: 30000,
                projectileSpeed: 10.0,
                projectileLifetime: 10,
                hp: rng.integer(500,1500),
                scale: 10
            },
            engine,
            viewport,
            critters,
            projectiles,
            projectileFactory,
            rng
        )
    )

    let entityID = projectiles.add(newVirus)
    newVirus.entityID = entityID
    newVirus.body.label = entityID
}

function spawnStartingCritters() {

    //start w/ one red
}