import { Graph, Vertex, Edge } from "./graph";

const kVertexDiameter = 48;
const kDistanceBetweenVerticesH = kVertexDiameter * 2;
const kDistanceBetweenVerticesV = kVertexDiameter;
const kBgColor = '#1e1e1e';
const kVertexFillColor = 'rgb(205, 205, 205)';
const kVertexStrokeColor = kBgColor;
const kVertexStrokeWidth = 4;
const kVertexTextFillColor = 'black';
const kEdgeStrokeColor = 'rgb(205, 205, 205)';
const kEdgeStrokeWidth = 2;
const kEdgeTextBgColor = kBgColor;
const kEdgeTextFillColor = 'white'
const kEdgeTextBorder = 4;
const kFontSize = 16;
const kFont = `bold ${kFontSize}px Helvetica`;
const kTextAlign = 'center';
const kTextBaseline = 'middle';

class Position {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
};

class Size {
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
};

class VertexShape {
  readonly vertexId: number;
  readonly position: Position;

  constructor(vertexId: number, position: Position) {
    this.vertexId = vertexId;
    this.position = position;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();

    ctx.arc(
      this.position.x,
      this.position.y,
      kVertexDiameter / 2,
      0,
      2 * Math.PI
    );

    ctx.lineWidth = kVertexStrokeWidth;
    ctx.strokeStyle = kVertexStrokeColor;
    ctx.fillStyle = kVertexFillColor;
    ctx.fill();
    ctx.stroke();

    ctx.closePath();

    ctx.font = kFont;
    ctx.textAlign = kTextAlign;
    ctx.textBaseline = kTextBaseline;
    ctx.fillStyle = kVertexTextFillColor;
    ctx.fillText(this.vertexId.toString(), this.position.x, this.position.y);
  }
};

class EdgeShape {
  readonly edgeId: number;
  readonly startPosition: Position;
  readonly endPosition: Position;

  constructor(edgeId: number, startPosition: Position, endPosition: Position) {
    this.edgeId = edgeId;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();

    ctx.moveTo(this.startPosition.x, this.startPosition.y);
    ctx.lineTo(this.endPosition.x, this.endPosition.y);

    ctx.lineWidth = kEdgeStrokeWidth;
    ctx.strokeStyle = kEdgeStrokeColor;
    ctx.stroke();

    ctx.closePath();

    ctx.font = kFont;
    ctx.textAlign = kTextAlign;
    ctx.textBaseline = kTextBaseline;

    const text = ctx.measureText(this.edgeId.toString());
    const textSize = new Size(text.width + kEdgeTextBorder * 2, kFontSize + kEdgeTextBorder * 2);

    const middlePosition = this.getMiddlePosition();
    const textPosition = new Position(
      middlePosition.x - textSize.width / 2,
      middlePosition.y - textSize.height / 2
    );

    ctx.fillStyle = kEdgeTextBgColor;
    ctx.fillRect(
      textPosition.x,
      textPosition.y,
      textSize.width,
      textSize.height
    );

    ctx.fillStyle = kEdgeTextFillColor;
    ctx.fillText(this.edgeId.toString(), middlePosition.x, middlePosition.y);
  }

  private getMiddlePosition() {
    return new Position(
      (this.startPosition.x + this.endPosition.x) / 2,
      (this.startPosition.y + this.endPosition.y) / 2
    );
  }
}

export class Drawer {
  readonly canvas: HTMLCanvasElement;
  readonly graph: Graph;

  private canvasSize: Size;
  private vertexShapes: Array<VertexShape>;
  private edgeShapes: Array<EdgeShape>;

  constructor(canvas: HTMLCanvasElement, vertices: Array<Vertex>, edges: Array<Edge>) {
    this.canvas = canvas;
    this.graph = new Graph(vertices, edges);

    const verticesDepths = this.getVerticesDepths(this.graph.vertices.length > 0 ? [this.graph.vertices[0]] : []);
    const longestDepthLength = this.findLongestDepthLength(verticesDepths);

    this.canvasSize = this.calculateCanvasSize(verticesDepths, longestDepthLength);
    this.vertexShapes = this.generateVertexShapes(verticesDepths);
    this.edgeShapes = this.generateEdgeShapes();
  }

  draw() {
    this.canvas.width = this.canvasSize.width;
    this.canvas.height = this.canvasSize.height;

    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.edgeShapes.forEach((edgeShape) => {
      edgeShape.draw(ctx);
    });

    this.vertexShapes.forEach((vertexShape) => {
      vertexShape.draw(ctx);
    });
  }

  private getVerticesDepths(currentDepth: Array<Vertex>, visitedVertices: Array<Vertex> = []): Array<Array<Vertex>> {
    if (currentDepth.length == 0) {
      return [];
    }

    const nextDepth: Array<Vertex> = [];

    currentDepth.forEach((vertex) => {
      visitedVertices.push(vertex);
      const neighbours = this.graph.getNeighbours(vertex);
      const nextDepthNeightbours = neighbours.filter((neighbour) => {
        return !visitedVertices.includes(neighbour) && !nextDepth.includes(neighbour);
      });
      nextDepth.push(...nextDepthNeightbours);
    });

    const result = [currentDepth];
    const nextDepths = this.getVerticesDepths(nextDepth, visitedVertices);
    result.push(...nextDepths);
    return result;
  }

  private findLongestDepthLength(verticesDepths: Array<Array<Vertex>>): number {
    let result = 0;
    verticesDepths.forEach((depth) => {
      if (depth.length > result) {
        result = depth.length;
      }
    });
    return result;
  }

  private calculateCanvasSize(verticesDepths: Array<Array<Vertex>>, longestDepthLength: number) {
    const depthsLength = verticesDepths.length;
    return new Size(
      (kVertexDiameter * depthsLength) + (kDistanceBetweenVerticesH * (depthsLength - 1)),
      this.calculateDepthHeight(longestDepthLength),
    );
  }

  private calculateDepthHeight(depthLength: number): number {
    return (kVertexDiameter * depthLength) + (kDistanceBetweenVerticesV * (depthLength - 1))
  }

  private generateVertexShapes(verticesDepths: Array<Array<Vertex>>): Array<VertexShape> {
    const result: Array<VertexShape> = []
    verticesDepths.forEach((depth, depthIndex) => {
      const shiftY = (this.canvasSize.height - this.calculateDepthHeight(depth.length)) / 2;
      depth.forEach((vertex, vertexIndex) => {
        result.push(
          new VertexShape(
            vertex.id,
            new Position(
              kVertexDiameter / 2 + depthIndex * (kVertexDiameter + kDistanceBetweenVerticesH),
              shiftY + kVertexDiameter / 2 + vertexIndex * (kVertexDiameter + kDistanceBetweenVerticesV)
            )
          )
        )
      });
    });
    return result;
  }

  private generateEdgeShapes(): Array<EdgeShape> {
    return this.graph.edges.map((edge) => {
      return new EdgeShape(
        edge.id,
        this.getVertexShapePosition(edge.vertex_ids[0]),
        this.getVertexShapePosition(edge.vertex_ids[1])
      )
    });
  }

  private getVertexShapePosition(vertexId: number): Position {
    const vertexShape = this.vertexShapes.find((vertexShape) => {
      return vertexShape.vertexId == vertexId;
    });
    return vertexShape.position;
  }
};
