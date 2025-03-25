/* 
 *  Geodesy by Mike Gavaghan
 * 
 *      http://www.gavaghan.org/blog/free-source-code/geodesy-library-vincentys-formula/
 * 
 *  Copyright 2007 Mike Gavaghan - mike@gavaghan.org
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { GlobalCoordinates } from "./GlobalCoordinates";

export class GlobalPosition extends GlobalCoordinates {
    private mElevation: number = 0;

    constructor(latitude: number, longitude: number, elevation: number);
    constructor(coords: GlobalCoordinates, elevation: number);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 3: {
                const [latitude, longitude, elevation] = args as [number, number, number];
                super(latitude, longitude)
                this.mElevation = elevation;
                break;
            }
            case 2: {
                const [coords, elevation] = args as [GlobalCoordinates, number];
                super(coords.getLatitude(), coords.getLongitude())
                this.mElevation = elevation;
                break;
            }
            default: {
                throw Error(`Invalid number of arguments`);
            }

        }
    }

    public getElevation(): number {
        return this.mElevation;
    }

    public setElevation(elevation: number): void {
        this.mElevation = elevation;
    }

    public override compareTo(other: GlobalPosition) {
        let retval: number = super.compareTo(other);

        if (retval == 0) {
            if (this.mElevation < other.mElevation)
                retval = -1;
            else if (this.mElevation > other.mElevation)
                retval = +1;
        }
        return retval;
    }

    public override hashCode(): number {
        var hash = super.hashCode();
        if (this.mElevation !== 0)
            hash *= Math.round(this.mElevation);
        return hash;
    }

    public override equals(obj: any): boolean {
        if (!(obj instanceof GlobalPosition))
            return false;
        var other: GlobalPosition = obj;
        return (this.mElevation === other.mElevation) && super.equals(other);
    }

    public override toString(): string {
        var buffer = super.toString();
        buffer += ("elevation=");
        buffer += (this.mElevation);
        buffer += ("m");
        return buffer;
    }
}
