import { Solver } from "./Solver";

export class RKSolver extends Solver {
    state: number[];
    f: (currentState: number[]) => number[];
    method: "RK1" | "RK2" | "RK4";

    constructor(state: Solver['state'], f: Solver['f'], method: "RK1" | "RK2" | "RK4") {
        super(state, f);
        this.state = state;
        this.f = f;
        this.method = method;
    }

    solve(d: number, t: number) {
        if (this.method === 'RK1') {
            const d1 = this.f(this.state);

            this.state = this.state.map((n, i) => n + d * d1[i]);
        }
        if (this.method === 'RK2') {
            const d1 = this.f(this.state);
            const d2 = this.f(this.state.map((n, i) => n + d * d1[i]));

            this.state = this.state.map((n, i) => n + (d / 2) * (d1[i] + d2[i]));
        }
        if (this.method === 'RK4') {
            const d1 = this.f(this.state);
            const d2 = this.f(this.state.map((n, i) => n + 0.5 * d * d1[i]));
            const d3 = this.f(this.state.map((n, i) => n + 0.5 * d * d2[i]));
            const d4 = this.f(this.state.map((n, i) => n + d * d3[i]));

            this.state = this.state.map((n, i) => n + (d / 6) * (d1[i] + 2 * d2[i] + 2 * d3[i] + d4[i]));
        }
    }

}