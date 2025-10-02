import { AmbientLight, BoxGeometry, CameraHelper, DirectionalLight, DirectionalLightHelper, DoubleSide, Euler, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshMatcapMaterial, MeshStandardMaterial, MeshToonMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { create } from "zustand";
import { last, throttle } from "lodash";

const width = 800;
const height = 600;

interface SceneState {
    cameraTargetPos: Euler;
    setCameraTargetPos: (pos: Euler) => void
}

export const useSceneStore = create<SceneState>((set) => ({
    cameraTargetPos: new Euler(0, 0, 0),
    setCameraTargetPos: throttle((pos) => set({ cameraTargetPos: pos }), 100),
}))

export function initializeScene(el: HTMLElement) {
    const scene = new Scene();
    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    renderer.shadowMap.enabled = true;

    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

    const cube = addCube(scene);

    const ground = addGround(scene);

    const camera = new PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 5;
    const controls = new OrbitControls(camera, el);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    {
        const color = "rgba(255, 244, 179, 1)";
        const intensity = 5;
        const light = new DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, -5, -2);
        light.castShadow = true;
        scene.add(light);
        scene.add(light.target);
        const helper = new DirectionalLightHelper(light);
        scene.add(helper);
        const cameraHelper = new CameraHelper(light.shadow.camera);
        scene.add(cameraHelper);

        scene.add(new AmbientLight(color, 0.2));
    }

    // F=ma, F = -kx, ma = -kx -
    let cubeVelocity = 0;
    const springConstant = 100;
    const cubeOrigin = 0;
    cube.position.x = 3;
    cube.position.y = 0.5;
    const cubeMass = 1;
    const damping = 0.1;

    let lastTime = 0;
    renderer.setAnimationLoop((currentTime) => {
        const d = (currentTime - lastTime) / 1000; // convert ms → seconds
        lastTime = currentTime;
        controls.update();
        useSceneStore.getState().setCameraTargetPos(cube.position.x);
        renderer.render(scene, camera);

        const displacement = cube.position.x - cubeOrigin;
        cubeVelocity += d * (-springConstant * displacement / cubeMass);
        cubeVelocity += -cubeVelocity * damping;
        cube.position.x += d * cubeVelocity;
    });

    return () => {
        renderer.setAnimationLoop(null);
        el.removeChild(renderer.domElement)
        renderer.dispose();
    }
}

function addGround(scene: Scene) {
    const material = new MeshStandardMaterial({ color: "rgba(123, 159, 163, 1)", side: DoubleSide });
    const geo = new PlaneGeometry(100, 100);
    const mesh = new Mesh(geo, material);
    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * -.5;

    scene.add(mesh);
    return { mesh, geo, material };
}

function addCube(scene: Scene) {
    const geo = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({ color: "rgba(250, 227, 134, 1)" });
    const cube = new Mesh(geo, material);
    cube.castShadow = true;
    cube.position.y = 1;

    scene.add(cube);
    return cube;
}