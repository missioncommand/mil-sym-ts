/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import { type int, type double } from "../graphics2d/BasicTypes";

import { Graphics2D } from "../graphics2d/Graphics2D"


/**
 *
 *
 */
export class BufferedImage {
    public static readonly TYPE_INT_ARGB: int = 2;
    public constructor(width: int,
        height: int,
        imageType: int) 
    {
        
    }
    public createGraphics(): Graphics2D {
        return new Graphics2D();
    }
    public flush(): void {
        return;
    }
    public getWidth(): double {
        return 0;
    }
    public getHeight(): double {
        return 0;
    }
}
