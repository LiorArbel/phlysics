import { useEffect, useRef } from 'react'
import './App.css'
import { runScene, type PhlysicsScene } from './sceneRunner'
import { Scene1 } from './Scene1';

function App() {
  const rendererRef = useRef<HTMLDivElement>(null);
  const scene: PhlysicsScene = new Scene1();

  useEffect(() => {
    let destroyer;
    if (rendererRef.current) {
      destroyer = runScene(rendererRef.current, scene);
    }
    return destroyer
  }, [runScene, scene]);

  return (
    <div>
      <div>
        {Object.keys(scene.constants).map(k => (
          <SceneControl
            key={k}
            name={k}
            useStore={scene.useStore}
          />
        ))}
      </div>
      <div ref={rendererRef}></div>
    </div>
  )
}

function SceneControl({ name, useStore }: { name: string, useStore: any }) {
  const value = useStore((s: any) => s[name]);
  const setConstant = useStore((s: any) => s.setConstant);

  return <div>
    <span>{name}</span>
    <input
      type='number'
      value={value}
      onChange={(e) => setConstant(name, Number(e.target.value))}
    />
  </div>
}

export default App
