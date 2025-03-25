/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


//import java.awt.geom.Point2D;


import { Point2D } from "../../../graphics2d/Point2D";

type double = number;

/**
 *
 *
 */
export class TextInfo {
    private _ModifierString: string;
    private _ModifierStringPosition: Point2D;
    private _ModifierStringAngle: double = 0;

    public constructor() { }

    //set this when returning text string.
    public setModifierString(value: string): void {
        this._ModifierString = value;
    }

    public getModifierString(): string {
        return this._ModifierString;
    }

    //location to draw ModifierString.
    public setModifierStringPosition(value: Point2D): void {
        this._ModifierStringPosition = value;
    }

    public getModifierStringPosition(): Point2D {
        return this._ModifierStringPosition;
    }

    //angle to draw ModifierString.
    public setModifierStringAngle(value: double): void {
        this._ModifierStringAngle = value;
    }

    public getModifierStringAngle(): double {
        return this._ModifierStringAngle;
    }
}
