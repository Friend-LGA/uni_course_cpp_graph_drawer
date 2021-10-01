export enum EdgeColor {
  Gray = "gray",
  Green = "green",
  Blue = "blue",
  Yellow = "yellow",
  Red = "red"
};

export class Vertex {
  readonly id: number;
  readonly edge_ids: Array<number>;
  readonly depth: number = -1;

  constructor(data?: Partial<Vertex>) {
    Object.assign(this, data);
  }
};

export class Edge {
  readonly id: number;
  readonly vertex_ids: Array<number>;
  readonly color: EdgeColor = EdgeColor.Gray;

  constructor(data?: Partial<Edge>) {
    Object.assign(this, data);
  }
};

export class Graph {
  readonly vertices: Array<Vertex>;
  readonly edges: Array<Edge>;

  constructor(vertices: Array<Vertex>, edges: Array<Edge>) {
    this.vertices = vertices;
    this.edges = edges;
  }

  getEdges(vertex: Vertex, color?: EdgeColor): Array<Edge> {
    let result: Array<Edge> = [];
    vertex.edge_ids.forEach((id) => {
      const edge = this.edges.find((edge) => {
        return edge.id == id && (color == undefined || edge.color == color);
      });
      if (edge) {
        result.push(edge);
      }
    });
    return result;
  }

  getVertices(edge: Edge): Array<Vertex> {
    let result: Array<Vertex> = [];
    edge.vertex_ids.forEach((id) => {
      result.push(this.vertices.find((vertex) => {
        return vertex.id == id;
      }));
    });
    return result;
  }

  getNeighbours(vertex: Vertex, color?: EdgeColor): Array<Vertex> {
    let result: Array<Vertex> = [];
    const edges = this.getEdges(vertex, color);
    edges.forEach((edge) => {
      const vertices = this.getVertices(edge);
      const filtered = vertices.filter((element) => {
        return element.id != vertex.id;
      });
      result.push(...filtered);
    });
    return result;
  }
};
