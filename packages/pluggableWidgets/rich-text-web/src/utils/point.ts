/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
export class Point {
    private readonly _x: number;
    private readonly _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    equals({ x, y }: Point): boolean {
        return this.x === x && this.y === y;
    }

    calcDeltaXTo({ x }: Point): number {
        return this.x - x;
    }

    calcDeltaYTo({ y }: Point): number {
        return this.y - y;
    }

    calcHorizontalDistanceTo(point: Point): number {
        return Math.abs(this.calcDeltaXTo(point));
    }

    calcVerticalDistance(point: Point): number {
        return Math.abs(this.calcDeltaYTo(point));
    }

    calcDistanceTo(point: Point): number {
        return Math.sqrt(Math.pow(this.calcDeltaXTo(point), 2) + Math.pow(this.calcDeltaYTo(point), 2));
    }
}

export function isPoint(x: unknown): x is Point {
    return x instanceof Point;
}
