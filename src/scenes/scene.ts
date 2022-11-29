import {Engine} from "@babylonjs/core/Engines/engine";
import {Scene} from "@babylonjs/core/scene";
import {ArcRotateCamera} from "@babylonjs/core/Cameras/arcRotateCamera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight";
import {CreateSceneClass} from "../createScene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {CubeTexture} from "@babylonjs/core/Materials/Textures/cubeTexture";
import {EnvironmentHelper} from "@babylonjs/core/Helpers/environmentHelper";
import {Color3, Color4} from "@babylonjs/core/Maths/math.color";

// required imports
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
// digital assets, remove after API has been linked
import mall from "../../assets/glb/mall.glb";
import environment from "../../assets/environment/environment.env"
import {DynamicTexture, MeshBuilder, PBRMaterial, StandardMaterial} from "@babylonjs/core";
import {WeightedGraph} from "../pathfinding/weightedGraph";

export class MainScene implements CreateSceneClass {
    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0.33, 0.33, 0.33, 1.0) //scene background color
        const camera = new ArcRotateCamera(
            "camera",
            2.13,
            Math.PI / 3,
            100,
            new Vector3(0, 0, 0),
            scene
        );
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        scene.environmentTexture = new CubeTexture(environment, scene);
        new EnvironmentHelper({
            skyboxTexture: undefined,
            createGround: false
        }, scene)
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );
        light.intensity = 0.7;
        const importResult = await SceneLoader.ImportMeshAsync(
            "",
            "",
            mall,
            scene,
            undefined,
            ".glb"
        );
        //await scene.debugLayer.show()
        const show_btn = document.getElementById('show_way')
        const shop_start_sel = document.getElementById('shop_start')
        const shop_end_sel = document.getElementById('shop_end')


        const graph = new WeightedGraph();
        graph.addVertex("A");
        graph.addVertex("B");
        graph.addVertex("C");
        graph.addVertex("D");
        graph.addVertex("E");
        graph.addVertex("F");
        graph.addVertex("G");
        graph.addVertex("H");
        graph.addVertex("I");
        graph.addVertex("J");
        graph.addVertex("K");
        graph.addVertex("L");
        graph.addVertex("M");
        graph.addVertex("N");

        graph.addEdge("A", "I", undefined, scene);
        graph.addEdge("C", "J", undefined, scene);
        graph.addEdge("B", "I", undefined, scene);
        graph.addEdge("D", "K", undefined, scene);
        graph.addEdge("J", "K", undefined, scene);
        graph.addEdge("K", "L", undefined, scene);
        graph.addEdge("E", "L", undefined, scene);
        graph.addEdge("L", "N", undefined, scene);
        graph.addEdge("L", "M", undefined, scene);
        graph.addEdge("M", "F", undefined, scene);
        graph.addEdge("M", "G", undefined, scene);
        graph.addEdge("I", "J", undefined, scene);
        graph.addEdge("H", "J", undefined, scene);

        scene.meshes.map((mesh: any) => {
            if (mesh.name.includes('shop')) {
                //Set font
                const font_size = 48;
                const font = "bold " + font_size + "px Arial";

                //Set height for plane
                const planeHeight = 3;

                //Set height for dynamic texture
                const DTHeight = 1.5 * font_size; //or set as wished

                //Calcultae ratio
                const ratio = planeHeight / DTHeight;

                //Set text
                const text = mesh.name;

                //Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
                const temp = new DynamicTexture("DynamicTexture", 64, scene);
                const tmpctx = temp.getContext();
                tmpctx.font = font;
                const DTWidth = tmpctx.measureText(text).width + 8;

                //Calculate width the plane has to be 
                const planeWidth = DTWidth * ratio;

                //Create dynamic texture and write the text
                const dynamicTexture = new DynamicTexture("DynamicTexture", {
                    width: DTWidth,
                    height: DTHeight
                }, scene, false);
                const mat = new StandardMaterial("mat", scene);
                mat.diffuseTexture = dynamicTexture;
                dynamicTexture.drawText(text, null, null, font, "#000000", "#ffffff", true);

                //Create plane and set dynamic texture as material
                const plane = MeshBuilder.CreatePlane("plane", {width: planeWidth, height: planeHeight}, scene);
                plane.material = mat;
                plane.rotation.x = Math.PI / 2;
                plane.position.x = mesh.getAbsolutePosition().x;
                plane.position.y = mesh.getAbsolutePosition().y * 2.2;
                plane.position.z = mesh.getAbsolutePosition().z;
            }
        })
        if (shop_start_sel && shop_end_sel && show_btn) {

            show_btn.addEventListener('click', showPath)

            function showPath() {
                // @ts-ignore
                let start = shop_start_sel.options[shop_start_sel.selectedIndex].text;
                // @ts-ignore
                let end = shop_end_sel.options[shop_end_sel.selectedIndex].text;

                const result = graph.findWay(start, end)
                const positions: Vector3[] = [];
                const hlmat_r = new PBRMaterial('hl');
                hlmat_r.albedoColor = new Color3(1.0, 0.0, 0.0);
                hlmat_r.roughness = 1.0;
                const hlmat_g = new PBRMaterial('hl');
                hlmat_g.albedoColor = new Color3(0.0, 1.0, 0.0);
                hlmat_g.roughness = 1.0;
                const hlmat_b = new PBRMaterial('hl');
                hlmat_b.albedoColor = new Color3(0.0, 0.0, 1.0);
                hlmat_b.roughness = 1.0;

                scene.meshes.map((mesh) => {
                    const meshmat = mesh.material
                    if (meshmat && meshmat.name === 'hl') {
                        mesh.material = scene.getMaterialByName('navmesh')
                    }
                })
                result.forEach((node) => {
                    const mesh = scene.getMeshByName(node);
                    if (mesh) {
                        mesh.material = hlmat_b
                        positions.push(mesh.getAbsolutePosition())
                    }
                })
                const line = scene.getMeshByName('lines')
                if (line) line.dispose()
                MeshBuilder.CreateLines("lines", {points: positions, updatable: false});
                const startNode = scene.getMeshByName(result[0]);
                const endNode = scene.getMeshByName(result[result.length - 1]);
                // @ts-ignore
                startNode.material = hlmat_g;
                // @ts-ignore
                endNode.material = hlmat_r;
            }
        }

        return scene;
    };
}

export default new MainScene();
