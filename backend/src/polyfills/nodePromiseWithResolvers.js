/**
 * tedious@20 (mssql@12) expects Promise.withResolvers (Node.js 22+).
 * Polyfill for Node 20 LTS so local MSSQL connections work without downgrading drivers.
 */
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function withResolversPolyfill() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
