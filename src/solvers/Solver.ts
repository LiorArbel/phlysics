export abstract class Solver {
    state: number[];
    f: (currentState: number[]) => number[];

    constructor(state: typeof this.state, f: typeof this.f) {
        this.state = state;
        this.f = f;
    }

    abstract solve(d: number, t: number): void;

    solveMultistep(d: number, t: number, steps: number) {
        for (let i = 0; i < steps; i++) {
            this.solve(d / steps, t + (d * i / steps));
        }
    }
}