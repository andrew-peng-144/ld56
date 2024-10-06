import { Ticker } from "pixi.js";

export interface IScreen {
    onUpdate(time: Ticker): void

    onEnter(prev: IScreen): void
    onExit(next: IScreen): void
    pause(): void
    resume(): void
    isPaused(): boolean
}
