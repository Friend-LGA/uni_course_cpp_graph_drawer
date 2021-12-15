import { ipcRenderer } from 'electron';
import { Drawer } from './drawer';
import { Graph, Vertex, Edge, EdgeColor } from './graph';

document.addEventListener('mouseout', (event) => {
  const target = event.target as HTMLTextAreaElement;
  if (target.matches('button')) {
    target.blur();
  }
});

window.onload = () => {
  const openFileButton = document.getElementById('open-file');
  openFileButton.addEventListener('click', (event) => {
    ipcRenderer.send('open-file');
    openFileButton.blur();
  });
}

function createVerticesCanvas(): HTMLCanvasElement {
  let element = document.createElement('canvas');
  element.id = `canvas-vertices`;
  return element;
}

function createEdgesCanvas(color: EdgeColor): HTMLCanvasElement {
  let element = document.createElement('canvas');
  element.id = `canvas-edges-${color}`;
  return element;
}

ipcRenderer.on('create-or-replace-canvas', (event, graph) => {
  const openFileButton = document.getElementById('open-file');
  if (openFileButton) {
    openFileButton.remove();
  }

  const canvases = ((): HTMLDivElement => {
    let element = document.getElementById('canvases');
    if (!element) {
      element = document.createElement('div')
      element.id = 'canvases';
      document.body.appendChild(element);
    }
    element.innerHTML = '';
    return element as HTMLDivElement;
  })();

  let edgesCanvases = new Map<EdgeColor, HTMLCanvasElement>();
  [EdgeColor.Grey, EdgeColor.Green, EdgeColor.Blue, EdgeColor.Yellow, EdgeColor.Red].forEach((color) => {
    const edgesCanvas = createEdgesCanvas(color);
    canvases.appendChild(edgesCanvas);
    edgesCanvases.set(color, edgesCanvas);
  });

  const verticesCanvas = createVerticesCanvas();
  canvases.appendChild(verticesCanvas);

  const drawer = new Drawer(canvases, verticesCanvas, edgesCanvases, graph.vertices, graph.edges);
  drawer.draw();
});
