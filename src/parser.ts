import * as fs from 'fs';
import { Graph, Vertex, Edge } from './graph';

export function parseJSON(filePath: string): Graph {
  let rawData = fs.readFileSync(filePath);
  let dataString = rawData.toString();
  dataString = dataString.replace(/gray/gi, "grey");
  let jsonData = JSON.parse(dataString);
  let vertices: Array<Vertex> = (jsonData.vertices || []).map((vertexData: Object) => { return new Vertex(vertexData) });
  let edges: Array<Edge> = (jsonData.edges || []).map((edgeData: Object) => { return new Edge(edgeData) });
  vertices.sort((lhs: Vertex, rhs: Vertex) => { return lhs.id - rhs.id });
  edges.sort((lhs: Edge, rhs: Edge) => { return lhs.id - rhs.id });
  return new Graph(vertices, edges);
}
