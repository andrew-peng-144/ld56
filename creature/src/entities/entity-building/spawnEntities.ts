import { Viewport } from "pixi-viewport";
import { Random } from "random-js";
import { Critter, CritterFactory } from "../CritterFactory";
import { EntityStore } from "../EntityStore";
import { Projectile, ProjectileFactory } from "../ProjectileFactory";
import { makeVirus1 } from "./makeVirus";
import { Settings } from "../../Settings";


const virus_spawn_count = 2

export function spawnCritters(count: number, spawnRadiusMultMin: number, spawnRadiusMultMax: number, name: string, _engine: Matter.Engine, _viewport: Viewport, critters: EntityStore<Critter>, critterFactory: CritterFactory, _projectiles: EntityStore<Projectile>, _projectileFactory: ProjectileFactory, rng: Random) {
    let scaleToBorder = 0.8
    let spawnRadius = Settings.WORLD_RADIUS * scaleToBorder

    let 
        projectileSpeed = 0,
        projectileLifetime = 4,
        movementSpeed = 4,
        scale = 1,
        color = 0,
        fireDelay = 1.0

    switch (name) {
        case Settings.CritterNames.GREEN:
            color = 0x3333ff //blue lol
            scale = 4.4
            movementSpeed = 8.0,
            projectileLifetime = 0.65,
            projectileSpeed = 50
            fireDelay = 0.3
            break
        default:
            color = 0x59b300
            scale = 3.8
            movementSpeed = 15.0
            projectileLifetime = 0.65,
            projectileSpeed = 50,
            fireDelay = 0.5
            break
    }
    for (let i = 0; i < count; i++) {
        let r = rng.real(spawnRadius * spawnRadiusMultMin, spawnRadius * spawnRadiusMultMax)
        let angle = rng.real(0, Math.PI * 2)

        let newCritter = critterFactory.create({
            x: r * Math.cos(angle),
            y: r * Math.sin(angle),
            team: Settings.teams.PLAYER,
            projectileLifetime: projectileLifetime,
            projectileSpeed: projectileSpeed,
            fireDelay: fireDelay,
            movementSpeed: movementSpeed,
            scale: scale,
            name: name,
            color: color
        })

        let entityID = critters.add(newCritter)
        newCritter.entityID = entityID
        newCritter.body.label = entityID
    }


}

export function spawnViruses(strength: number, spawnRadiusMultMin: number, spawnRadiusMultMax: number, engine: Matter.Engine, viewport: Viewport, critters: EntityStore<Critter>, projectiles: EntityStore<Projectile>, projectileFactory: ProjectileFactory, rng: Random) {
    // TODO have them spawn only near existing virus
    let scaleToBorder = 0.8
    let spawnRadius = Settings.WORLD_RADIUS * scaleToBorder

    let intervalMs = 0,
        projectileSpeed = 0,
        projectileLifetime = 4,
        hp = 1,
        scale = 1,
        color = 0

    switch (strength) {
        case 1:
            intervalMs = 10000
            projectileSpeed = 7
            hp = rng.integer(1, 2)
            scale = 5
            color = 0x9999ff
            break;
        case 2:
            intervalMs = 4000
            projectileSpeed = 8
            hp = rng.integer(5,15)
            scale = 5
            color = 0x66ff99
            break;
        case 3:
            intervalMs = 7000
            projectileSpeed = 10
            hp = rng.integer(10,20)
            scale = 6
            color = 0xbdbf24
            break;
        case 4:
            intervalMs = 2000
            projectileSpeed = 12
            hp = rng.integer(15, 30)
            scale = 7
            color = 0xff6600
            break;
        default:
            intervalMs = 30000
            projectileSpeed = 14.0
            hp = rng.integer(20, 40)
            scale = 8
            color = 0xbf00ff
            break;
    }

    for (let i = 0; i < virus_spawn_count; i++) {
        let r = rng.real(spawnRadius * spawnRadiusMultMin, spawnRadius * spawnRadiusMultMax)
        let angle = rng.real(0, Math.PI * 2)

        let newVirus = projectileFactory.create(
            makeVirus1(
                {
                    centerX: r * Math.cos(angle),
                    centerY: r * Math.sin(angle),
                    color: color,
                    intervalMs: intervalMs,
                    projectileSpeed: projectileSpeed,
                    projectileLifetime: projectileLifetime,
                    hp: hp,
                    scale: scale
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
}