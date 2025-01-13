install:
	npm ci

build:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

develop:
	npx webpack serve