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

export class GeodeticCurve {
    private readonly mEllipsoidalDistance: number = 0;
    private readonly mAzimuth: number = 0;
    private readonly mReverseAzimuth: number = 0;

    constructor(ellipsoidalDistance: number, azimuth: number, reverseAzimuth: number) {
        this.mEllipsoidalDistance = ellipsoidalDistance;
        this.mAzimuth = azimuth;
        this.mReverseAzimuth = reverseAzimuth;
    }

    public getEllipsoidalDistance(): number {
        return this.mEllipsoidalDistance;
    };

    public getAzimuth(): number {
        return this.mAzimuth;
    };

    public getReverseAzimuth(): number {
        return this.mReverseAzimuth;
    };

    public toString(): string {
        var buffer = "";
        buffer += "s=";
        buffer += this.mEllipsoidalDistance;
        buffer += ";a12=";
        buffer += this.mAzimuth;
        buffer += ";a21=";
        buffer += this.mReverseAzimuth;
        buffer += ";";
        return buffer;
    };
}