import { Point3D } from "./Point3D";
import { ShapeInfo } from "../../../renderer/utilities/ShapeInfo";

export class ShapeInfo3D extends ShapeInfo {
    private _ModifierPosition3D: Point3D = null;
    private _Polylines3D: Array<Array<Point3D>> = null;

    public override setModifierPosition(value: Point3D): void {
        this._ModifierPosition3D = value;
    }

    public override getModifierPosition(): Point3D {
        return this._ModifierPosition3D;
    }

    public override getPolylines(): Array<Array<Point3D>> {
        return this._Polylines3D;
    }

    public override setPolylines(value: Array<Array<Point3D>>): void {
        this._Polylines3D = value;
    }
}
