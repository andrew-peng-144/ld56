// just use window setinterval/timeout

export class DeltaTimer {

    currentMs: number = 0
    readonly intervalMs: number
    callback: () => void
    constructor(intervalMs: number, callback: () => void) {
        this.intervalMs = intervalMs
        this.callback = callback
    }

    update(ms: number) {
        this.currentMs += ms
        if (this.currentMs >= ms) {
            this.currentMs -= ms
            this.callback()
        }
    }
}


export class DeltaTimeout {

    currentMs: number = 0
    readonly timeout: number
    callback: () => void
    constructor(timeout: number, callback: () => void) {
        this.timeout = timeout
        this.callback = callback
    }

    update(ms: number) {
        this.currentMs += ms
        if (this.currentMs >= ms) {
            this.callback()
        }
    }
}

