import { AmbientLight, BoxGeometry, CameraHelper, DirectionalLight, DirectionalLightHelper, DoubleSide, Euler, Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { create } from "zustand";
import { throttle } from "lodash";
import type { SceneState } from "three/src/renderers/common/RendererUtils.js";

const width = 800;
const height = 600;

export interface PhlysicsScene {
    variables: Record<string, unknown>;
    constants: Record<string, unknown>;
    bodies: Object3D[];
    setup: (scene: Scene) => void;
    update: (d: number) => void;
    useStore: <T>(selector: (state: Record<string, unknown>) => T) => T;
}

export function createSceneStore<T extends Record<string, any>>(initial: T) {
    const useStore = create<
        T & { setConstant: <K extends keyof T>(key: K, value: T[K]) => void }
    >((set) => ({
        ...initial,
        setConstant: <K extends keyof T>(key: K, value: T[K]) =>
            set((state) => ({
                ...state,
                [key]: value,
            })),
    }));

    return useStore;
}

export function runScene(el: HTMLElement, s: PhlysicsScene) {
    const scene = new Scene();
    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    renderer.shadowMap.enabled = true;

    renderer.setSize(width, height);
    el.appendChild(renderer.domElement);

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
        // light.castShadow = true;
        scene.add(light);
        scene.add(light.target);
        // const helper = new DirectionalLightHelper(light);
        // scene.add(helper);
        // const cameraHelper = new CameraHelper(light.shadow.camera);
        // scene.add(cameraHelper);

        scene.add(new AmbientLight(color, 0.2));
    }

    s.setup(scene);

    let lastTime = 0;
    renderer.setAnimationLoop((currentTime) => {
        const d = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        controls.update();
        renderer.render(scene, camera);
        s.update(d);
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