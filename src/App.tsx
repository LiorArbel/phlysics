import { useEffect, useRef, useState } from 'react'
import './App.css'
import { initializeScene, useSceneStore } from './scene1'


function App() {
  const rendererRef = useRef<HTMLDivElement>(null);
  const { cameraTargetPos } = useSceneStore();

  useEffect(() => {
    let destroyer;
    if (rendererRef.current) {
      destroyer = initializeScene(rendererRef.current);
    }
    return destroyer
  }, [initializeScene]);

  return (
    <div>
      <div>
        <span>{cameraTargetPos.x}</span>
      </div>
      <div ref={rendererRef}></div>
    </div>
  )
}

export default App
