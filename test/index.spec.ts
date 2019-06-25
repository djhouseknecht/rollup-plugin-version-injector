// import { defaultConfig as config } from '../src/config'

describe('injectVersion()', () => {
  test.skip('should write some tests', () => {
    fail('no tests');
  });
	// test('should work', () => {
	// 	expect(true).toBe(true);
	// });

	// test('should work', () => {
	// 	const code = `function() {
	// 		return {
	// 			name: '[VI]{version}[/VI]',
	// 			con: {}
	// 		}
	// 	}`;
	// 	const expectedCode = `function() {
	// 		return {
	// 			name: '1.1',
	// 			con: {}
	// 		}
	// 	}`;

		// if (config.injectInTags) {
		// 	const pattern = buildTagRegexp(config.injectInTags.tagId);

		// 	let match: RegExpExecArray | null;
		// 	while ((match = pattern.exec(code))) {
		// 		console.log('match', match)
		// 		let start = match.index;
		// 		let end = start + match[0].length;
		// 		let replacement = stripTags(match[0], config.injectInTags.tagId);
		// 		console.log('replacement', replacement);
		// 		replacement = replaceVersion(replacement, '1.1');
		// 		replacement = replaceDate(replacement, config.injectInTags.dateFormat);
		// 		magicString.overwrite(start, end, replacement);
		// 	}
		// }

		// expect(magicString.toString()).toEqual(expectedCode);

	// });
});
