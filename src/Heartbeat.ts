/**
 *
 * Elijah Cobb
 * elijah@elijahcobb.com
 * https://elijahcobb.com
 *
 *
 * Copyright 2019 Elijah Cobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import * as OS from "os";
import * as SystemInformation from "systeminformation";

export interface IHeartBeat {
	cpuUsage: number;
	cpuTempLow: number;
	cpuTempHigh: number;
	cpuTempAvg: number;
	memFree: number;
	memTotal: number;
	diskFree: number;
	diskTotal: number;
	uptime: number;
}

export class HeartBeat implements IHeartBeat {

	public readonly cpuUsage: number;
	public readonly cpuTempLow: number;
	public readonly cpuTempHigh: number;
	public readonly cpuTempAvg: number;
	public readonly memFree: number;
	public readonly memTotal: number;
	public readonly diskFree: number;
	public readonly diskTotal: number;
	public readonly uptime: number;

	private constructor(value: IHeartBeat) {

		this.cpuUsage = value.cpuUsage;
		this.cpuTempLow = value.cpuTempLow;
		this.cpuTempAvg = value.cpuTempAvg;
		this.cpuTempHigh = value.cpuTempHigh;
		this.memFree = value.memFree;
		this.memTotal = value.memTotal;
		this.diskFree = value.diskFree;
		this.diskTotal = value.diskTotal;
		this.uptime = value.uptime

	}

	public static async generate(): Promise<HeartBeat> {

		const cpuUsage: number = await SystemInformation.fullLoad();

		const mem: SystemInformation.Systeminformation.MemData = await SystemInformation.mem();
		const memFree: number = mem.free;
		const memTotal: number = mem.total;

		const fsSize: SystemInformation.Systeminformation.FsSizeData[] = await SystemInformation.fsSize();
		let free: number = 0;
		let total: number = 0;
		fsSize.forEach((size: SystemInformation.Systeminformation.FsSizeData) => {

			total += size.size;
			free += size.size - size.used;

		});

		const temps: SystemInformation.Systeminformation.CpuTemperatureData = await SystemInformation.cpuTemperature();
		let low: number = 999;
		let high: number = -999;
		let avg: number = 0;

		temps.cores.forEach((temp: number) => {

			if (temp < low) low = temp;
			if (temp > high) high = temp;

			avg += temp;

		});

		avg /= temps.cores.length;

		const uptime: number = OS.uptime();

		return new HeartBeat({
			cpuUsage,
			cpuTempLow: low,
			cpuTempAvg: avg,
			cpuTempHigh: high,
			memFree,
			memTotal,
			diskFree: free,
			diskTotal: total,
			uptime
		});

	}

}