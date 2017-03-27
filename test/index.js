import fs from 'fs'
import path from 'path'
import glob from 'glob'
import { assert } from 'chai'
import { transformFileSync } from 'babel-core'
import plugin from '../src/index'

function trim(str) {
	return str.replace(/(\r\n|\n|\r|\t)/gm, '')
}

function createTestName(fixturePath) {
	return path.basename(fixturePath).split('-').join(' ')
}

describe('babel-plugin-react-pug fixture tests', () => {
	
	const fixturePaths = glob.sync(path.join(__dirname, 'fixtures/*/'))
	
	fixturePaths.forEach((fixturePath) => {
		
		const testName = createTestName(fixturePath)
		const actualPath = path.join(fixturePath, 'actual.js')
		const expectedPath = path.join(fixturePath, 'expected.js')
		
		it(`should transform to react function call(s) from ${ testName }`, () => {
			
			const expected = fs.readFileSync(expectedPath, 'utf8')
			const actual = transformFileSync(actualPath, {
				'plugins': [ plugin ]
			}).code

			assert.strictEqual(trim(actual), trim(expected))
			
		})
		
	})
	
})

describe('babel-plugin-react-pug error fixture tests', () => {
	
	const fixturePaths = glob.sync(path.join(__dirname, 'error-fixtures/*/'))
	
	fixturePaths.forEach((fixturePath) => {
		
		const testName = createTestName(fixturePath)
		const codePath = path.join(fixturePath, 'code.js')
		
		it(`should fail when ${ testName }`, () => {
			
			assert.throws(function() {
				transformFileSync(codePath, { 'plugins': [ plugin ]})
			})
			
		})
		
	})
	
})