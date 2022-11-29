import {PriorityQueue} from "./priorityQueue";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

interface WeightedGraphInterface {
    adjacencyList: any;

    addVertex(vertex: string): void;

    addEdge(vertex1: string, vertex2: string, weight: number, scene?: any): void;

    findWay(start: string, finish: string): Array<any>
}

export class WeightedGraph implements WeightedGraphInterface {
    readonly adjacencyList: any;

    constructor() {
        this.adjacencyList = {};
    }

    addVertex(vertex: string): void {
        if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
    }

    addEdge(vertex1: string, vertex2: string, weight?: number | undefined, scene?: any): void {

        if (!weight) {
            const v1 = scene.getMeshByName(vertex1);
            const v2 = scene.getMeshByName(vertex2);
            let weight = Vector3.Distance(v1?.position, v2?.position)
            console.log(weight)
            this.adjacencyList[vertex1].push({node: vertex2, weight});
            this.adjacencyList[vertex2].push({node: vertex1, weight});
        } else {
            this.adjacencyList[vertex1].push({node: vertex2, weight});
            this.adjacencyList[vertex2].push({node: vertex1, weight});
        }


    }

    findWay(start: string, finish: string): Array<any> {
        const nodes = new PriorityQueue();
        const distances: any = {};
        const previous: any = {};
        let path = []; //to return at end
        let smallest;
        //build up initial state
        for (let vertex in this.adjacencyList) {
            if (vertex === start) {
                distances[vertex] = 0;
                nodes.enqueue(vertex, 0);
            } else {
                distances[vertex] = Infinity;
                nodes.enqueue(vertex, Infinity);
            }
            previous[vertex] = null;
        }
        // as long as there is something to visit
        while (nodes.values.length) {
            smallest = nodes.dequeue().val;
            if (smallest === finish) {
                //WE ARE DONE
                //BUILD UP PATH TO RETURN AT END
                while (previous[smallest]) {
                    path.push(smallest);
                    smallest = previous[smallest];
                }
                break;
            }
            if (smallest || distances[smallest] !== Infinity) {
                for (let neighbor in this.adjacencyList[smallest]) {
                    //find neighboring node
                    let nextNode = this.adjacencyList[smallest][neighbor];
                    //calculate new distance to neighboring node
                    let candidate = distances[smallest] + nextNode.weight;
                    let nextNeighbor = nextNode.node;
                    if (candidate < distances[nextNeighbor]) {
                        //updating new smallest distance to neighbor
                        distances[nextNeighbor] = candidate;
                        //updating previous - How we got to neighbor
                        previous[nextNeighbor] = smallest;
                        //enqueue in priority queue with new priority
                        nodes.enqueue(nextNeighbor, candidate);
                    }
                }
            }
        }
        return path.concat(smallest).reverse();
    }
}