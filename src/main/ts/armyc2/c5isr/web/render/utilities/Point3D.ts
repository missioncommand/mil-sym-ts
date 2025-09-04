import { type double } from "../../../graphics2d/BasicTypes";
import { Point2D } from "../../../graphics2d/Point2D";

export class Point3D extends Point2D {
    public z: double;

    public constructor(pt: Point2D, z: double);
    public constructor(x: double, y: double, z: double);
    public constructor(...args: unknown[]) {

        switch (args.length) {
            case 0: {
                super();
                break;
            }

            case 2: {
                const [pt, z] = args as [Point2D, double];
                super(pt.x, pt.y);
                this.z = z;
                break;
            }

            case 3: {
                const [x, y, z] = args as [double, double, double];
                super(x, y);
                this.z = z;
                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    public getZ(): double {
        return this.z;
    }
}