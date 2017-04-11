const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

export const pathSeparator = process.platform.toLowerCase() === 'win32' ? '\\' : '/';

export function root(args = '.') {
	args = Array.prototype.slice.call(arguments, 0);
	return path.join.apply(path, [ROOT].concat(args));
}

export function modulesRoot(args = '.') {
	args = Array.prototype.slice.call(arguments, 0);
	return path.join.apply(path, [ROOT + '/node_modules'].concat(args));
}

export function staticRoot(args = '.') {
	args = Array.prototype.slice.call(arguments, 0);
	return path.join.apply(path, [ROOT + '/build'].concat(args));
}

export function walkSync(dir, filelist = []) {
	fs.readdirSync(dir).map(file => {
		fs.statSync(path.join(dir, file))
			.isDirectory() ? walkSync(path.join(dir, file), filelist) : filelist.push(path.join(dir, file))[0]
	});
}

export function getAllFiles(dir, ext = '*') {
	let fileList = [];
	walkSync(dir, fileList);
    return ext === '*' ? fileList : fileList.filter(file => path.extname(file) === ext);
}

export function beforeInit() {
	(() => {
        try {
            require('os').networkInterfaces()
        } catch (e) {
            require('os').networkInterfaces = () => ({})
        }
	})();
}