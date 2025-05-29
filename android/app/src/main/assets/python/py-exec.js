/* py-exec.js */
// 將 console.log 轉送到 React Native
const originalLog = console.log;
console.log = function (...args) {
    originalLog(...args);
    try {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', log: args.join(' ') }));
    } catch (e) {}
};
function log(msg) {
    const output = document.getElementById('output');
    output.textContent += msg + '\n';
    output.scrollTop = output.scrollHeight;
}

function clearLog() {
    document.getElementById('output').textContent = '';
}

function reLoad() {
    document.location.reload();
}

function control_motor(speed) {
    log(`🌀 控制馬達速度為：${speed}`);
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'MOTOR', spd: speed }));
}

async function initPyodide() {
    log("🔄 正在載入 Pyodide...");
    pyodide = await loadPyodide();
    await pyodide.runPythonAsync(`
        import js
        import builtins
        def log(msg): js.log(str(msg))
        builtins.print = lambda *args, **kwargs: js.log(" ".join(map(str, args)))
        def clearLog(): js.clearLog()
        def control_motor(speed): js.control_motor(int(speed))
        globals()["control_motor"] = control_motor
    `);
    log("✅ Pyodide 載入完成！");
}