import {springCalculation, SpringConfig} from './spring-utils';

export function measureSpring({
	from = 0,
	to = 1,
	fps,
	config = {},
	threshold = 0.005,
}: {
	fps: number;
	config?: Partial<SpringConfig>;
	threshold?: number;
	from?: number;
	to?: number;
}): number {
	if (typeof threshold !== 'number') {
		throw new TypeError(
			`threshold must be a number, got ${threshold} of type ${typeof threshold}`
		);
	}
	if (isNaN(threshold)) {
		throw new TypeError('Threshold is NaN');
	}
	if (!Number.isFinite(threshold)) {
		throw new TypeError('Threshold is not finite');
	}
	if (threshold < 0) {
		throw new TypeError('Threshold is below 0');
	}
	if (threshold > 1) {
		throw new TypeError('Threshold is above 1');
	}

	const range = Math.abs(from - to);
	let frame = 0;
	let finishedFrame = 0;
	const calc = () => {
		return springCalculation({
			fps,
			frame,
			config,
			from,
			to,
		});
	};
	let animation = calc();
	const calcDifference = () => {
		return (
			Math.abs(animation.current - animation.toValue) /
			(range === 0 ? 1 : range)
		);
	};
	let difference = calcDifference();
	while (difference > threshold) {
		frame++;
		animation = calc();
		difference = calcDifference();
	}
	// Since spring is bouncy, just because it's under the threshold we
	// cannot be sure it's done. We need to animate further until it stays in the
	// threshold for, say, 20 frames.
	finishedFrame = frame;
	for (let i = 0; i < 20; i++) {
		frame++;
		animation = calc();
		difference = calcDifference();
		if (difference > threshold) {
			i = 0;
			finishedFrame = frame + 1;
		}
	}
	return finishedFrame;
}
