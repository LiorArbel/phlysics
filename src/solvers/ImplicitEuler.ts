import { Solver } from "./Solver";

export class ImplicitEuler extends Solver {
    iter: number;
    constructor(state: Solver['state'], f: Solver['f'], iter: number) {
        super(state, f);
        this.iter = iter;
    }

    solve(d: number, t: number) {
        let nextState = this.state;
        for (let i = 0; i < this.iter; i++) {
            const d1 = this.f(nextState);
            nextState = nextState.map((n, i) => this.state[i] + d * d1[i])
        }

        this.state = nextState;
    }

}