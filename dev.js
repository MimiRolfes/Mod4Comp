/**
 * Startet den Testserver (WordPress Playground) auf dem ersten freien Port ab 9488,
 * damit er nicht mit anderen lokalen Projekten kollidiert. Eigener Port: PORT=9500 npm run dev
 */
const net = require('net');
const { spawn } = require('child_process');

function free(port) {
	return new Promise((resolve) => {
		const s = net.createServer().once('error', () => resolve(false)).once('listening', () => s.close(() => resolve(true)));
		s.listen(port);
	});
}

(async () => {
	let port = Number(process.env.PORT) || 9488;
	while (!(await free(port))) port++;
	console.log(`Testserver: http://127.0.0.1:${port}  (Login admin / password)`);
	spawn('npx', ['@wp-playground/cli@latest', 'server', '--mount=.:/wordpress/wp-content/themes/mod4comp', '--blueprint=blueprint-local.json', `--port=${port}`], { stdio: 'inherit', cwd: __dirname });
})();
