import { Solver } from "./Solver";

export class SemiImplicitEuler extends Solver {
    constructor(initialX: number, initialV: number, f: Solver['f']) {
        super([initialX, initialV], f);
    }

    solve(d: number, t: number) {
        // First V
        this.state[1] = this.state[1] + d * this.f(this.state)[1];

        // Then X
        this.state[0] = this.state[0] + d * this.state[1];
    }

}