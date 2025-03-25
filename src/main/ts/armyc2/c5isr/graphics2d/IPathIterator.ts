/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

import { type int } from "../graphics2d/BasicTypes";


/**
 *
 *
 */
interface IPathIterator {
	//methods
	currentSegment(coords: number[]): int;
	currentSegment(coords: number[]): int;
	getWindingRule(): int;
	isDone(): boolean;
	next(): void;
}

// eslint-disable-next-line @typescript-eslint/no-namespace, no-redeclare
export namespace IPathIterator {
	export const SEG_CLOSE: int = 4;
	export const SEG_CUBICTO: int = 3;
	export const SEG_LINETO: int = 1;
	export const SEG_MOVETO: int = 0;
	export const SEG_QUADTO: int = 2;
	export const WIND_EVEN_ODD: int = 0;
	export const WIND_NON_ZERO: int = 1;
}


