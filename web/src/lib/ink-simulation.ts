/**
 * 墨流し（suminagashi）風 流体シミュレーション。
 *
 * Jos Stam の Stable Fluids を CPU 実装し、墨と水が混ざらない（相分離）
 * マーブル模様が永続的に崩れ続ける背景を Canvas 2D に描画する。
 *
 * React 非依存の純粋モジュール。createInkSimulation(canvas) で起動し、
 * 返り値の destroy() で requestAnimationFrame・イベントリスナー・
 * IntersectionObserver をすべて解放する（クライアント遷移でのリーク防止）。
 * 色（紙/墨）は setColors() で「再初期化せず」差し替えできる（テーマ連動用）。
 *
 * 仕様の出典は墨流しヒーロー実装プロンプト v2（試行錯誤を経た確定版）。
 */

export interface InkSimulation {
	/** requestAnimationFrame・イベントリスナー・Observer をすべて解放する。 */
	destroy: () => void;
	/** 紙色・墨色（RGB）を差し替える。濃度場（模様）は保持する。 */
	setColors: (paper: number[], ink: number[]) => void;
}

interface InkOptions {
	paper?: number[];
	ink?: number[];
}

interface Drop {
	cx: number;
	cy: number;
	R: number;
	dur: number;
	age: number;
	swirl: number;
}

interface Vortex {
	pa: number;
	pb: number;
	p1: number;
	p2: number;
	p3: number;
	sign: number;
	R: number;
}

export function createInkSimulation(
	canvas: HTMLCanvasElement,
	options: InkOptions = {},
): InkSimulation | null {
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const SW = 240;
	const SH = 150;
	const size = (SW + 2) * (SH + 2);
	const u = new Float32Array(size);
	const v = new Float32Array(size);
	const u0 = new Float32Array(size);
	const v0 = new Float32Array(size);
	const d = new Float32Array(size);
	const d0 = new Float32Array(size);
	const dSeed = new Float32Array(size);

	const dt = 0.12;
	const visc = 0.00005;
	const SHARP = 0.3;
	const DROP_INTERVAL = 6000;

	// 色は再初期化せず差し替えられるよう mutable に保持する。
	const colors = {
		paper: options.paper ?? [250, 250, 248],
		ink: options.ink ?? [26, 26, 26],
	};

	let target = 0.3;
	let fading = 0;
	let midPt = 0.5;
	let areaFrac = 0;
	let areaFrac0 = 0.25;
	let frameCount = 0;
	let lastDrop = 0;
	let simTime = 0;

	let destroyed = false;
	let rafId = 0;
	let visible = true;
	let inView = true;
	let firstFrame = false;

	const drops: Drop[] = [];
	const vortices: Vortex[] = [];

	function IX(i: number, j: number) {
		return i + (SW + 2) * j;
	}

	function setBnd(b: number, x: Float32Array) {
		for (let i = 1; i <= SW; i++) {
			x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
			x[IX(i, SH + 1)] = b === 2 ? -x[IX(i, SH)] : x[IX(i, SH)];
		}
		for (let j = 1; j <= SH; j++) {
			x[IX(0, j)] = b === 1 ? -x[IX(1, j)] : x[IX(1, j)];
			x[IX(SW + 1, j)] = b === 1 ? -x[IX(SW, j)] : x[IX(SW, j)];
		}
		x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
		x[IX(0, SH + 1)] = 0.5 * (x[IX(1, SH + 1)] + x[IX(0, SH)]);
		x[IX(SW + 1, 0)] = 0.5 * (x[IX(SW, 0)] + x[IX(SW + 1, 1)]);
		x[IX(SW + 1, SH + 1)] = 0.5 * (x[IX(SW, SH + 1)] + x[IX(SW + 1, SH)]);
	}

	function linSolve(b: number, x: Float32Array, x0a: Float32Array, a: number, c: number) {
		for (let k = 0; k < 10; k++) {
			for (let j = 1; j <= SH; j++) {
				const row = (SW + 2) * j;
				for (let i = 1; i <= SW; i++) {
					const n = i + row;
					x[n] =
						(x0a[n] + a * (x[n - 1] + x[n + 1] + x[n - (SW + 2)] + x[n + (SW + 2)])) / c;
				}
			}
			setBnd(b, x);
		}
	}

	function diffuse(b: number, x: Float32Array, x0a: Float32Array, df: number) {
		if (df <= 0) {
			x.set(x0a);
			setBnd(b, x);
			return;
		}
		const a = dt * df * SW * SH;
		linSolve(b, x, x0a, a, 1 + 4 * a);
	}

	function advect(b: number, dd: Float32Array, dd0: Float32Array, uu: Float32Array, vv: Float32Array) {
		const dt0x = dt * SW;
		const dt0y = dt * SH;
		for (let j = 1; j <= SH; j++) {
			for (let i = 1; i <= SW; i++) {
				const n = IX(i, j);
				let x = i - dt0x * uu[n];
				let y = j - dt0y * vv[n];
				if (x < 0.5) x = 0.5;
				if (x > SW + 0.5) x = SW + 0.5;
				if (y < 0.5) y = 0.5;
				if (y > SH + 0.5) y = SH + 0.5;
				const i0 = Math.floor(x);
				const i1 = i0 + 1;
				const j0 = Math.floor(y);
				const j1 = j0 + 1;
				const s1 = x - i0;
				const s0 = 1 - s1;
				const t1 = y - j0;
				const t0 = 1 - t1;
				dd[n] =
					s0 * (t0 * dd0[IX(i0, j0)] + t1 * dd0[IX(i0, j1)]) +
					s1 * (t0 * dd0[IX(i1, j0)] + t1 * dd0[IX(i1, j1)]);
			}
		}
		setBnd(b, dd);
	}

	function project(uu: Float32Array, vv: Float32Array, p: Float32Array, div: Float32Array) {
		const hx = 1 / SW;
		const hy = 1 / SH;
		for (let j = 1; j <= SH; j++) {
			for (let i = 1; i <= SW; i++) {
				const n = IX(i, j);
				div[n] =
					-0.5 * (hx * (uu[n + 1] - uu[n - 1]) + hy * (vv[n + (SW + 2)] - vv[n - (SW + 2)]));
				p[n] = 0;
			}
		}
		setBnd(0, div);
		setBnd(0, p);
		linSolve(0, p, div, 1, 4);
		for (let j = 1; j <= SH; j++) {
			for (let i = 1; i <= SW; i++) {
				const n = IX(i, j);
				uu[n] -= 0.5 * (p[n + 1] - p[n - 1]) / hx;
				vv[n] -= 0.5 * (p[n + (SW + 2)] - p[n - (SW + 2)]) / hy;
			}
		}
		setBnd(1, uu);
		setBnd(2, vv);
	}

	function step() {
		diffuse(1, u0, u, visc);
		diffuse(2, v0, v, visc);
		project(u0, v0, u, v);
		advect(1, u, u0, u0, v0);
		advect(2, v, v0, u0, v0);
		project(u, v, u0, v0);
		d0.set(d);
		advect(0, d, d0, u, v);

		let sum = 0;
		let sumW = 0;
		let cnt = 0;
		for (let n = 0; n < size; n++) {
			u[n] *= 0.99;
			v[n] *= 0.99;
			if (u[n] > 0.6) u[n] = 0.6;
			if (u[n] < -0.6) u[n] = -0.6;
			if (v[n] > 0.6) v[n] = 0.6;
			if (v[n] < -0.6) v[n] = -0.6;
			let dv = d[n];
			if (fading === 0) {
				dv += SHARP * dv * (1 - dv) * (dv - midPt);
			}
			if (dv < 0) dv = 0;
			if (dv > 1) dv = 1;
			d[n] = dv;
			sum += dv;
			sumW += dv * (1 - dv);
			if (dv > 0.55) cnt++;
		}
		areaFrac = cnt / size;

		if (fading > 0) {
			const a = 0.014;
			for (let n = 0; n < size; n++) {
				d[n] += (dSeed[n] - d[n]) * a;
			}
			fading--;
			if (fading === 0) midPt = 0.5;
			return;
		}

		midPt = 0.5 + (areaFrac - areaFrac0) * 1.5;
		if (midPt < 0.36) midPt = 0.36;
		if (midPt > 0.64) midPt = 0.64;

		const deficit = target * size - sum;
		if (sumW > 1) {
			let corr = deficit / sumW;
			if (corr > 0.4) corr = 0.4;
			if (corr < -0.4) corr = -0.4;
			for (let n = 0; n < size; n++) {
				let dv2 = d[n];
				dv2 += corr * dv2 * (1 - dv2);
				if (dv2 < 0) dv2 = 0;
				if (dv2 > 1) dv2 = 1;
				d[n] = dv2;
			}
		}

		if (areaFrac < areaFrac0 * 0.55 || areaFrac > areaFrac0 * 2.2) {
			revive();
		}
	}

	function revive() {
		if (fading > 0) return;
		makePattern(dSeed);
		fading = 420;
	}

	function drop(cx?: number, cy?: number) {
		const x = cx ?? 14 + Math.random() * (SW - 28);
		const y = cy ?? 12 + Math.random() * (SH - 24);
		drops.push({
			cx: x,
			cy: y,
			R: 9 + Math.random() * 6,
			dur: 90,
			age: 0,
			swirl: (Math.random() < 0.5 ? -1 : 1) * 0.25,
		});
	}

	function growDrops() {
		for (let k = drops.length - 1; k >= 0; k--) {
			const dr = drops[k];
			dr.age++;
			let p = dr.age / dr.dur;
			if (p > 1) p = 1;
			const pe = p * p * (3 - 2 * p);
			const r = dr.R * (0.25 + 0.75 * pe);
			const amp = 1.3 * pe;
			const i0 = Math.max(1, Math.floor(dr.cx - r));
			const i1 = Math.min(SW, Math.ceil(dr.cx + r));
			const j0 = Math.max(1, Math.floor(dr.cy - r));
			const j1 = Math.min(SH, Math.ceil(dr.cy + r));
			for (let j = j0; j <= j1; j++) {
				for (let i = i0; i <= i1; i++) {
					const di = i - dr.cx;
					const dj = j - dr.cy;
					const dist = Math.sqrt(di * di + dj * dj);
					if (dist > r) continue;
					const f = 1 - dist / r;
					const n = IX(i, j);
					let prof = amp * f * f;
					if (prof > 1) prof = 1;
					if (d[n] < prof) d[n] = prof;
					if (dist > 0.5) {
						u[n] += (-dj / dist) * dr.swirl * f * 0.05;
						v[n] += (di / dist) * dr.swirl * f * 0.05;
					}
				}
			}
			if (dr.age >= dr.dur) drops.splice(k, 1);
		}
	}

	function makePattern(out: Float32Array) {
		const centers = [
			{ x: SW * (0.28 + Math.random() * 0.14), y: SH * (0.4 + Math.random() * 0.2), freq: 0.34, maxR: SW * 0.32, ph: 0, w1: 0, w2: 0 },
			{ x: SW * (0.6 + Math.random() * 0.14), y: SH * (0.34 + Math.random() * 0.16), freq: 0.42, maxR: SW * 0.27, ph: 0, w1: 0, w2: 0 },
			{ x: SW * (0.46 + Math.random() * 0.16), y: SH * (0.66 + Math.random() * 0.12), freq: 0.3, maxR: SW * 0.23, ph: 0, w1: 0, w2: 0 },
		];
		for (let c = 0; c < centers.length; c++) {
			centers[c].ph = Math.random() * 6.28;
			centers[c].w1 = Math.random() * 6.28;
			centers[c].w2 = Math.random() * 6.28;
		}
		out.fill(0);
		for (let j = 1; j <= SH; j++) {
			for (let i = 1; i <= SW; i++) {
				let val = 0;
				for (let c = 0; c < centers.length; c++) {
					const ce = centers[c];
					const dx = i - ce.x;
					const dy = j - ce.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist > ce.maxR) continue;
					const ang = Math.atan2(dy, dx);
					const wob = 3.4 * Math.sin(3 * ang + ce.w1) + 2.1 * Math.sin(5 * ang + ce.w2);
					let band = 0.5 + 0.5 * Math.sin((dist + wob) * ce.freq + ce.ph);
					band = band * band * band;
					let fall = 1 - dist / ce.maxR;
					fall = fall * (2 - fall);
					const vv = band * fall;
					if (vv > val) val = vv;
				}
				let tval = (val - 0.18) * 1.7;
				if (tval < 0) tval = 0;
				if (tval > 1) tval = 1;
				out[IX(i, j)] = tval;
			}
		}
	}

	for (let k = 0; k < 4; k++) {
		vortices.push({
			pa: 0.9 + Math.random() * 0.7,
			pb: 0.7 + Math.random() * 0.8,
			p1: Math.random() * 6.28,
			p2: Math.random() * 6.28,
			p3: Math.random() * 6.28,
			sign: k % 2 === 0 ? 1 : -1,
			R: 40 + Math.random() * 20,
		});
	}

	function stir() {
		simTime += 0.0035;
		for (let k = 0; k < vortices.length; k++) {
			const vo = vortices[k];
			const cx = SW * (0.5 + 0.36 * Math.sin(simTime * vo.pa + vo.p1));
			const cy = SH * (0.5 + 0.34 * Math.cos(simTime * vo.pb + vo.p2));
			const s = vo.sign * 0.00034 * (0.65 + 0.35 * Math.sin(simTime * 1.6 + vo.p3));
			const R = vo.R;
			const R2 = R * R;
			const i0 = Math.max(1, Math.floor(cx - R));
			const i1 = Math.min(SW, Math.ceil(cx + R));
			const j0 = Math.max(1, Math.floor(cy - R));
			const j1 = Math.min(SH, Math.ceil(cy + R));
			for (let j = j0; j <= j1; j++) {
				for (let i = i0; i <= i1; i++) {
					const dx = i - cx;
					const dy = j - cy;
					const q = (dx * dx + dy * dy) / R2;
					if (q >= 1) continue;
					const f = (1 - q) * (1 - q);
					const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001;
					const n = IX(i, j);
					u[n] += (-dy / dist) * f * s * R;
					v[n] += (dx / dist) * f * s * R;
				}
			}
		}
	}

	const off = document.createElement('canvas');
	off.width = SW;
	off.height = SH;
	const octx = off.getContext('2d');
	const mid = document.createElement('canvas');
	mid.width = SW * 3;
	mid.height = SH * 3;
	const mctx = mid.getContext('2d');
	if (!octx || !mctx) return null;
	const img = octx.createImageData(SW, SH);

	function render() {
		if (!ctx || !octx || !mctx) return;
		const px = img.data;
		const pr = colors.paper;
		const ik = colors.ink;
		for (let j = 1; j <= SH; j++) {
			for (let i = 1; i <= SW; i++) {
				let tt = d[IX(i, j)];
				if (tt < 0) tt = 0;
				if (tt > 1) tt = 1;
				tt = tt * tt * (3 - 2 * tt);
				tt = tt * 0.85;
				const k = 4 * ((j - 1) * SW + (i - 1));
				px[k] = pr[0] + (ik[0] - pr[0]) * tt;
				px[k + 1] = pr[1] + (ik[1] - pr[1]) * tt;
				px[k + 2] = pr[2] + (ik[2] - pr[2]) * tt;
				px[k + 3] = 255;
			}
		}
		octx.putImageData(img, 0, 0);
		mctx.imageSmoothingEnabled = true;
		mctx.drawImage(off, 0, 0, mid.width, mid.height);
		ctx.imageSmoothingEnabled = true;
		ctx.drawImage(mid, 0, 0, canvas.width, canvas.height);
	}

	function fit() {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w;
			canvas.height = h;
		}
	}

	const host = canvas.parentElement;

	function onPointerMove(e: PointerEvent) {
		const r = canvas.getBoundingClientRect();
		const ci = ((e.clientX - r.left) / r.width) * SW;
		const cj = ((e.clientY - r.top) / r.height) * SH;
		const i = Math.round(ci);
		const j = Math.round(cj);
		if (i < 2 || i > SW - 1 || j < 2 || j > SH - 1) return;
		const mx = ((e.movementX || 0) / r.width) * SW;
		const my = ((e.movementY || 0) / r.height) * SH;
		const n = IX(i, j);
		u[n] += mx * 0.02;
		v[n] += my * 0.02;
	}

	function onVisibility() {
		visible = !document.hidden;
	}

	function loop(now: number) {
		if (destroyed) return;
		fit();
		if (visible && inView) {
			stir();
			growDrops();
			step();
			render();
			frameCount++;
			if (!firstFrame) {
				firstFrame = true;
				canvas.style.opacity = '1';
			}
			if (!lastDrop) lastDrop = now;
			if (now - lastDrop > DROP_INTERVAL) {
				if (areaFrac < areaFrac0 * 1.5 && fading === 0) drop();
				lastDrop = now;
			}
			if (frameCount % 10800 === 0 && areaFrac < areaFrac0 * 0.75) {
				revive();
			}
		}
		rafId = requestAnimationFrame(loop);
	}

	// 初期模様と基準値（黒面積・総量）を確定する。
	makePattern(d);
	{
		let s = 0;
		let c = 0;
		for (let n = 0; n < size; n++) {
			s += d[n];
			if (d[n] > 0.55) c++;
		}
		target = s / size;
		areaFrac0 = c / size;
		areaFrac = areaFrac0;
	}

	document.addEventListener('visibilitychange', onVisibility);

	let io: IntersectionObserver | null = null;
	const ioTarget = host ?? canvas;
	if (typeof IntersectionObserver !== 'undefined') {
		io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) inView = entry.isIntersecting;
			},
			{ threshold: 0 },
		);
		io.observe(ioTarget);
	}

	fit();
	if (reduceMotion) {
		render();
		canvas.style.opacity = '1';
	} else {
		if (host) host.addEventListener('pointermove', onPointerMove);
		rafId = requestAnimationFrame(loop);
	}

	function setColors(paper: number[], ink: number[]) {
		colors.paper = paper;
		colors.ink = ink;
		// ループが回っていない（reduced-motion）場合は即時再描画する。
		if (reduceMotion) render();
	}

	function destroy() {
		destroyed = true;
		if (rafId) cancelAnimationFrame(rafId);
		if (host) host.removeEventListener('pointermove', onPointerMove);
		document.removeEventListener('visibilitychange', onVisibility);
		if (io) io.disconnect();
	}

	return { destroy, setColors };
}
