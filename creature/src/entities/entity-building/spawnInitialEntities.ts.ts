import { Random } from "random-js";
import { Critter, CritterFactory } from "../CritterFactory";
import { EntityStore } from "../EntityStore";
import { Projectile, ProjectileFactory } from "../ProjectileFactory";
import { makeVirus1 } from "./makeVirus";
import { MyMath } from "../../utils/MyMath";
import { Settings } from "../../Settings";
import { Viewport } from "pixi-viewport";



export function makeLevelLayout(engine: Matter.Engine, viewport: Viewport,  critters: EntityStore<Critter>, critterFactory: CritterFactory, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random) {


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

    spawnStartingCritters(critterFactory, rng, critters)
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

function spawnStartingCritters(critterFactory: CritterFactory, rng: Random, critters: EntityStore<Critter>) {

    //start w/ one STRONG guy
    let newCritter = critterFactory.create({
        x: 0,
        y: 0,
        team: Settings.teams.PLAYER,
        movementSpeed: 5.5,
        projectileLifetime: 0.5,
        projectileSpeed: 25,
        fireDelay: 0.08,
        color: 0xe6b800,
        scale: 2.2,
        name: Settings.CritterNames.YELLOW
    })

    let entityID = critters.add(newCritter)
    newCritter.entityID = entityID
    newCritter.body.label = entityID
}