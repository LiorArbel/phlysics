import { BufferGeometry, Curve, Line, LineBasicMaterial, Mesh, MeshStandardMaterial, TubeGeometry, Vector3 } from "three";

class HelixCurve extends Curve<Vector3> {
    radius: number;
    height: number;
    turns: number;

    constructor(radius = 1, height = 5, turns = 10) {
        super();
        this.radius = radius;
        this.height = height;
        this.turns = turns;
    }

    getPoint(t: number, optionalTarget = new Vector3()) {
        const angle = this.turns * Math.PI * 2 * t;
        const x = Math.cos(angle) * this.radius;
        const y = Math.sin(angle) * this.radius;
        const z = this.height * t;
        return optionalTarget.set(x, y, z);
    }
}

export const createSpring = (height: number, segments: number, width: number, linewidth: number) => {
    // Create the spring geometry
    const points: Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
        const z = (i / segments) * height;
        const x = (i % 2 === 0 ? -width : width); // alternate left/right
        points.push(new Vector3(x, 0, z));
    }

    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: 0x0077ff, linewidth });
    const zigzagSpring = new Line(geometry, material);

    const fromTo = (from: Vector3, to: Vector3) => {
        zigzagSpring.position.copy(from);
        zigzagSpring.lookAt(to);
        const dist = new Vector3().subVectors(to, from).length();
        zigzagSpring.scale.z = dist / height;
    }
    return { obj: zigzagSpring, fromTo }
}