/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


import { type int } from "../graphics2d/BasicTypes";

import { BasicStroke } from "../graphics2d/BasicStroke"
import { GeneralPath } from "../graphics2d/GeneralPath"
import { PathIterator } from "../graphics2d/PathIterator"
import { Rectangle } from "../graphics2d/Rectangle"
import { POINT2 } from "../JavaLineArray/POINT2"
import { ShapeInfo } from "../renderer/utilities/ShapeInfo"
import { IPathIterator } from "../graphics2d/IPathIterator";


/**
 *
 *
 */
export class Shape2 extends ShapeInfo {

    public constructor(value: int) {
        super();
        this.setShapeType(value);
        this._Shape = new GeneralPath();
        let stroke: BasicStroke = new BasicStroke();
        this.setStroke(stroke);
    }
    private style: int = 0;  //e.g. 26 for enemy flots
    public set_Style(value: int): void {
        this.style = value;
    }
    public get_Style(): int  //used by TacticalRenderer but not client
    {
        return this.style;
    }
    public lineTo(pt: POINT2): void {
        (this._Shape as GeneralPath).lineTo(pt.x, pt.y);
    }
    public moveTo(pt: POINT2): void {
        (this._Shape as GeneralPath).moveTo(pt.x, pt.y);
    }
    public override getBounds(): Rectangle {
        if (this._Shape instanceof GeneralPath) {
            return this._Shape.getBounds();
        }
        else {
            return this.getBounds();
        }

    }

    public getPoints(): Array<POINT2> {
        let points: Array<POINT2> = new Array();
        for (let i: PathIterator = this.getShape().getPathIterator(null); !i.isDone(); i.next()) {
            let coords: number[] = new Array<number>(6);
            let type: int = i.currentSegment(coords);
            switch (type) {
                case IPathIterator.SEG_MOVETO:
                case IPathIterator.SEG_LINETO:
                case IPathIterator.SEG_CLOSE: {
                    points.push(new POINT2(coords[0], coords[1], type));
                    break;
                }

                case IPathIterator.SEG_QUADTO: {
                    points.push(new POINT2(coords[0], coords[1], type));
                    points.push(new POINT2(coords[2], coords[3], type));
                    break;
                }

                case IPathIterator.SEG_CUBICTO: {
                    points.push(new POINT2(coords[0], coords[1], type));
                    points.push(new POINT2(coords[2], coords[3], type));
                    points.push(new POINT2(coords[4], coords[5], type));
                    break;
                }

                default: {
                    break;
                }

            }
        }
        return points;
    }
}
