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

import { GeodeticCurve } from "./GeodeticCurve";

export class GeodeticMeasurement extends GeodeticCurve {
    private readonly mElevationChange: number = 0;
    private readonly mP2P: number = 0;

    constructor(ellipsoidalDistance: number, azimuth: number, reverseAzimuth: number, elevationChange: number);
    constructor(averageCurve: GeodeticCurve, elevationChange: number);
    public constructor(...args: unknown[]) {
        switch (args.length) {
            case 2: {
                const [averageCurve, elevationChange] = args as [GeodeticCurve, number];
                super(averageCurve.getEllipsoidalDistance(), averageCurve.getAzimuth(), averageCurve.getReverseAzimuth())
                this.mElevationChange = elevationChange;
                break;
            }

            case 4: {
                const [ellipsoidalDistance, azimuth, reverseAzimuth, elevationChange] = args as [number, number, number, number];
                super(ellipsoidalDistance, azimuth, reverseAzimuth)
                this.mElevationChange = elevationChange;
                this.mP2P = Math.sqrt(ellipsoidalDistance * ellipsoidalDistance + this.mElevationChange * this.mElevationChange);
                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }

    public getElevationChange(): number {
        return this.mElevationChange;
    };

    public getPointToPointDistance(): number {
        return this.mP2P;
    };

    public override toString(): string {
        var buffer = super.toString();
        buffer += ("elev12=");
        buffer += (this.mElevationChange);
        buffer += (";p2p=");
        buffer += (this.mP2P);
        return buffer;
    };
};