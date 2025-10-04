import { Mesh, BoxGeometry, MeshStandardMaterial, Scene, Line } from "three";
import { PhlysicsScene } from "./PhlysicsScene";
import { createSpring } from "./Spring";
import { RKSolver } from "./solvers/RKSolver";
import { ImplicitEuler } from "./solvers/ImplicitEuler";
import { SemiImplicitEuler } from "./solvers/SemiImpEuler";
import type { Solver } from "./solvers/Solver";

type Scene1Props = {
    springConstant: number,
    cubeMass: number,
    friction: number,
    cubeRest: number,
    cubeStart: number
}

type Scene1Variables = {
    cubeVelocities: number[]
}

export class Scene1 extends PhlysicsScene<Scene1Props, Scene1Variables> {
    cubes: Mesh[] = [];
    springs: Line[] = [];

    constructor() {
        const constants = { springConstant: 10, cubeMass: 1, friction: 0, cubeRest: 0, cubeStart: 3 };
        const variables = { cubeVelocities: [0, 0, 0, 0, 0] };

        super(
            constants,
            variables
        );

        const geo = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ color: "rgba(250, 227, 134, 1)" });
        for (let i = 0; i < 5; i++) {
            const cube = new Mesh(geo, material);
            cube.castShadow = true;
            cube.position.x = constants.cubeStart;
            cube.position.z = -1.5 + i * 2;
            cube.position.y = 0.5;
            this.cubes[i] = cube;

            const spring = createSpring(1, 10, 0.5, 10);
            spring.position.copy(cube.position)
            // spring.rotateZ(-Math.PI / 2);
            // spring.rotateX(Math.PI / 2);
            spring.rotateY(-Math.PI / 2);
            spring.position.x = cube.position.x;
            this.springs[i] = spring;
        }


        this.snapshotBodies(this.cubes);
    }

    setup(scene: Scene) {
        scene.add(...this.springs, ...this.cubes);
    }

    update(d: number) {
        const c = this.useStore.getState() as typeof this.constants;
        this.constants = c;

        function derivative(p: number[]) {
            const [x, v] = p;
            const displacement = x - c.cubeRest;
            const acceleration = -c.springConstant * displacement / c.cubeMass - c.friction * c.cubeMass * v;
            return [v, acceleration];
        }

        this.cubes.forEach((c, i) => {
            let solver: Solver;
            switch (i) {
                case 0: solver = new RKSolver([c.position.x, this.variables.cubeVelocities[i]], derivative, "RK1"); break;
                case 1: solver = new RKSolver([c.position.x, this.variables.cubeVelocities[i]], derivative, "RK2"); break;
                case 2: solver = new RKSolver([c.position.x, this.variables.cubeVelocities[i]], derivative, "RK4"); break;
                case 3: solver = new ImplicitEuler([c.position.x, this.variables.cubeVelocities[i]], derivative, 100); break;
                case 4: solver = new SemiImplicitEuler(c.position.x, this.variables.cubeVelocities[i], derivative); break;
                default: solver = new RKSolver([c.position.x, this.variables.cubeVelocities[i]], derivative, "RK1"); break
            }
            solver.solve(d, 0);
            c.position.x = solver.state[0];
            this.variables.cubeVelocities[i] = solver.state[1];

            this.springs[i].scale.z = -c.position.x + this.constants.cubeStart - 0.5;
        });
    }
}