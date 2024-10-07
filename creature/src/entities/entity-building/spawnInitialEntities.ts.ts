import { Random } from "random-js";
import { Critter, CritterFactory } from "../CritterFactory";
import { EntityStore } from "../EntityStore";
import { Projectile, ProjectileFactory } from "../ProjectileFactory";
import { makeVirus1 } from "./makeVirus";
import { MyMath } from "../../utils/MyMath";
import { Settings } from "../../Settings";
import { Viewport } from "pixi-viewport";



export function makeLevelLayout(engine: Matter.Engine, viewport: Viewport, critters: EntityStore<Critter>, critterFactory: CritterFactory, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random) {





    spawnStartingViruses(engine, viewport, critters, projectiles, projectileFactory, rng)
    spawnStartingCritters(critterFactory, rng, critters)
}

function spawnStartingViruses(engine: Matter.Engine, viewport: Viewport, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random) {

    // weak starting viruses
    for (let deg = 0; deg < 360; deg += 60) {
        let scaleToBorder = 0.07
        let radius = Settings.WORLD_RADIUS * scaleToBorder
        let newVirus = projectileFactory.create(
            makeVirus1(
                {
                    centerX: radius * Math.cos(MyMath.toRadians(deg)),
                    centerY: radius * Math.sin(MyMath.toRadians(deg)),
                    color: 0x006600,
                    intervalMs: 2000,
                    projectileSpeed: 10.0,
                    projectileLifetime: 6,
                    hp: rng.integer(10, 20),
                    scale: 1.3
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

    // medium starting viruses
    for (let deg = 0; deg < 360; deg += 60) {
        let scaleToBorder = 0.4
        let radius = Settings.WORLD_RADIUS * scaleToBorder
        let newVirus = projectileFactory.create(
            makeVirus1(
                {
                    centerX: radius * Math.cos(MyMath.toRadians(deg)),
                    centerY: radius * Math.sin(MyMath.toRadians(deg)),
                    color: 0x004d00,
                    intervalMs: 10000,
                    projectileSpeed: 10.0,
                    projectileLifetime: 6,
                    hp: rng.integer(50, 150),
                    scale: 5
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



    // SUPER VIRUSES
    // hexagon
    for (let deg = 0; deg < 360; deg += 60) {
        let scaleToBorder = 0.8
        let radius = Settings.WORLD_RADIUS * scaleToBorder

        let newSuper = projectileFactory.create(
            makeVirus1(
                {
                    centerX: radius * Math.cos(MyMath.toRadians(deg)),
                    centerY: radius * Math.sin(MyMath.toRadians(deg)),
                    color: 0x001a00,
                    intervalMs: 30000,
                    projectileSpeed: 10.0,
                    projectileLifetime: 10,
                    hp: rng.integer(500, 1500),
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
        let entityID = projectiles.add(newSuper)
        newSuper.entityID = entityID
        newSuper.body.label = entityID
    }


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