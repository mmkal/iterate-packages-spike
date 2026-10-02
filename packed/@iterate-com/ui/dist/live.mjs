import { r as __toESM } from "./rolldown-runtime.mjs";
import { i as require_react } from "./vendor-react.mjs";
import { a as object, c as unknown, i as number, n as array, o as string, r as literal, s as union, t as _enum } from "./schemas.mjs";
//#region ../../node_modules/.pnpm/@iterate-com+capnweb@0.12.3/node_modules/@iterate-com/capnweb/dist/index.js
let WORKERS_MODULE_SYMBOL = Symbol("workers-module");
if (!Symbol.dispose) Symbol.dispose = Symbol.for("dispose");
if (!Symbol.asyncDispose) Symbol.asyncDispose = Symbol.for("asyncDispose");
if (!Promise.withResolvers) Promise.withResolvers = function() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
};
let workersModule = globalThis[WORKERS_MODULE_SYMBOL];
let RpcTarget$1 = workersModule ? workersModule.RpcTarget : class {};
const AsyncFunction = (async function() {}).constructor;
let BUFFER_PROTOTYPE = typeof Buffer !== "undefined" ? Buffer.prototype : void 0;
function typeForRpc(value) {
	switch (typeof value) {
		case "boolean":
		case "number":
		case "string": return "primitive";
		case "undefined": return "undefined";
		case "object":
		case "function": break;
		case "bigint": return "bigint";
		default: return "unsupported";
	}
	if (value === null) return "primitive";
	let prototype = Object.getPrototypeOf(value);
	switch (prototype) {
		case Object.prototype: return "object";
		case Function.prototype:
		case AsyncFunction.prototype: return "function";
		case Array.prototype: return "array";
		case Date.prototype: return "date";
		case Uint8Array.prototype:
		case BUFFER_PROTOTYPE:
		case ArrayBuffer.prototype:
		case DataView.prototype:
		case Int8Array.prototype:
		case Uint8ClampedArray.prototype:
		case Int16Array.prototype:
		case Uint16Array.prototype:
		case Int32Array.prototype:
		case Uint32Array.prototype:
		case BigInt64Array.prototype:
		case BigUint64Array.prototype:
		case Float32Array.prototype:
		case Float64Array.prototype: return "bytes";
		case WritableStream.prototype: return "writable";
		case ReadableStream.prototype: return "readable";
		case URL.prototype: return "url";
		case Headers.prototype: return "headers";
		case Request.prototype: return "request";
		case Response.prototype: return "response";
		case Blob.prototype: return "blob";
		case RpcStub$1.prototype: return "stub";
		case RpcPromise$1.prototype: return "rpc-promise";
		default:
			if (workersModule) {
				if (prototype == workersModule.RpcStub.prototype || value instanceof workersModule.ServiceStub) return "rpc-target";
				else if (prototype == workersModule.RpcPromise.prototype || prototype == workersModule.RpcProperty.prototype) return "rpc-thenable";
			}
			if (value instanceof RpcTarget$1) return "rpc-target";
			if (value instanceof Error) return "error";
			return "unsupported";
	}
}
function mapNotLoaded() {
	throw new Error("RPC map() implementation was not loaded.");
}
let mapImpl = {
	applyMap: mapNotLoaded,
	sendMap: mapNotLoaded
};
function streamNotLoaded() {
	throw new Error("Stream implementation was not loaded.");
}
let streamImpl = {
	createWritableStreamHook: streamNotLoaded,
	createWritableStreamFromHook: streamNotLoaded,
	createReadableStreamHook: streamNotLoaded
};
var StubHook = class {
	stream(path, args) {
		let hook = this.call(path, args);
		let pulled;
		try {
			pulled = hook.pull();
		} catch (err) {
			hook.dispose();
			throw err;
		}
		let promise;
		if (pulled instanceof Promise) promise = pulled.then((p) => {
			p.dispose();
		});
		else {
			pulled.dispose();
			promise = Promise.resolve();
		}
		return { promise };
	}
};
var ErrorStubHook = class extends StubHook {
	error;
	constructor(error) {
		super();
		this.error = error;
	}
	call(path, args) {
		args.dispose();
		return this;
	}
	map(path, captures, instructions) {
		for (let cap of captures) cap.dispose();
		return this;
	}
	get(path) {
		return this;
	}
	dup() {
		return this;
	}
	pull() {
		return Promise.reject(this.error);
	}
	ignoreUnhandledRejections() {}
	dispose() {}
	onBroken(callback) {
		try {
			callback(this.error);
		} catch (err) {
			Promise.resolve(err);
		}
	}
};
const DISPOSED_HOOK = new ErrorStubHook(/* @__PURE__ */ new Error("Attempted to use RPC stub after it has been disposed."));
let doCall = (hook, path, params) => {
	return hook.call(path, params);
};
function withCallInterceptor(interceptor, callback) {
	let oldValue = doCall;
	doCall = interceptor;
	try {
		return callback();
	} finally {
		doCall = oldValue;
	}
}
let RAW_STUB = Symbol("realStub");
const PROXY_HANDLERS = {
	apply(target, thisArg, argumentsList) {
		let stub = target.raw;
		return new RpcPromise$1(doCall(stub.hook, stub.pathIfPromise || [], RpcPayload.fromAppParams(argumentsList)), []);
	},
	get(target, prop, receiver) {
		let stub = target.raw;
		if (prop === RAW_STUB) return stub;
		else if (prop in RpcPromise$1.prototype) return stub[prop];
		else if (typeof prop === "string") return new RpcPromise$1(stub.hook, stub.pathIfPromise ? [...stub.pathIfPromise, prop] : [prop]);
		else if (prop === Symbol.dispose && (!stub.pathIfPromise || stub.pathIfPromise.length == 0)) return () => {
			stub.hook.dispose();
			stub.hook = DISPOSED_HOOK;
		};
		else return;
	},
	has(target, prop) {
		let stub = target.raw;
		if (prop === RAW_STUB) return true;
		else if (prop in RpcPromise$1.prototype) return prop in stub;
		else if (typeof prop === "string") return true;
		else if (prop === Symbol.dispose && (!stub.pathIfPromise || stub.pathIfPromise.length == 0)) return true;
		else return false;
	},
	construct(target, args) {
		throw new Error("An RPC stub cannot be used as a constructor.");
	},
	defineProperty(target, property, attributes) {
		throw new Error("Can't define properties on RPC stubs.");
	},
	deleteProperty(target, p) {
		throw new Error("Can't delete properties on RPC stubs.");
	},
	getOwnPropertyDescriptor(target, p) {},
	getPrototypeOf(target) {
		return Object.getPrototypeOf(target.raw);
	},
	isExtensible(target) {
		return false;
	},
	ownKeys(target) {
		return [];
	},
	preventExtensions(target) {
		return true;
	},
	set(target, p, newValue, receiver) {
		throw new Error("Can't assign properties on RPC stubs.");
	},
	setPrototypeOf(target, v) {
		throw new Error("Can't override prototype of RPC stubs.");
	}
};
var RpcStub$1 = class RpcStub$1 extends RpcTarget$1 {
	constructor(hook, pathIfPromise) {
		super();
		if (!(hook instanceof StubHook)) {
			let value = hook;
			if (value instanceof RpcTarget$1 || value instanceof Function) hook = TargetStubHook.create(value, void 0);
			else hook = new PayloadStubHook(RpcPayload.fromAppReturn(value));
			if (pathIfPromise) throw new TypeError("RpcStub constructor expected one argument, received two.");
		}
		this.hook = hook;
		this.pathIfPromise = pathIfPromise;
		let func = () => {};
		func.raw = this;
		return new Proxy(func, PROXY_HANDLERS);
	}
	hook;
	pathIfPromise;
	dup() {
		let target = this[RAW_STUB];
		if (target.pathIfPromise) return new RpcStub$1(target.hook.get(target.pathIfPromise));
		else return new RpcStub$1(target.hook.dup());
	}
	onRpcBroken(callback) {
		this[RAW_STUB].hook.onBroken(callback);
	}
	map(func) {
		let { hook, pathIfPromise } = this[RAW_STUB];
		return mapImpl.sendMap(hook, pathIfPromise || [], func);
	}
	toString() {
		return "[object RpcStub]";
	}
};
var RpcPromise$1 = class extends RpcStub$1 {
	constructor(hook, pathIfPromise) {
		if (hook instanceof StubHook) super(hook, pathIfPromise ?? []);
		else {
			if (pathIfPromise !== void 0) throw new TypeError("RpcPromise constructor expected one argument, received two.");
			let kind = typeForRpc(hook);
			if (kind === "rpc-promise") {
				let raw = unwrapStubAndPath(hook);
				if (raw.pathIfPromise.length > 0) super(raw.hook, raw.pathIfPromise);
				else {
					let adopted = raw.hook;
					raw.hook = DISPOSED_HOOK;
					super(adopted, []);
				}
			} else if (kind === "rpc-thenable") super(TargetStubHook.create(hook, void 0), []);
			else {
				let promiseHook = new PromiseStubHook(Promise.resolve(hook).then((value) => new PayloadStubHook(RpcPayload.fromAppReturn(value))));
				promiseHook.ignoreUnhandledRejections();
				super(promiseHook, []);
			}
		}
	}
	then(onfulfilled, onrejected) {
		return pullPromise(this).then(...arguments);
	}
	catch(onrejected) {
		return pullPromise(this).catch(...arguments);
	}
	finally(onfinally) {
		return pullPromise(this).finally(...arguments);
	}
	toString() {
		return "[object RpcPromise]";
	}
};
function unwrapStubTakingOwnership(stub) {
	let { hook, pathIfPromise } = stub[RAW_STUB];
	if (pathIfPromise && pathIfPromise.length > 0) return hook.get(pathIfPromise);
	else return hook;
}
function unwrapStubAndDup(stub) {
	let { hook, pathIfPromise } = stub[RAW_STUB];
	if (pathIfPromise) return hook.get(pathIfPromise);
	else return hook.dup();
}
function unwrapStubNoProperties(stub) {
	let { hook, pathIfPromise } = stub[RAW_STUB];
	if (pathIfPromise && pathIfPromise.length > 0) return;
	return hook;
}
function unwrapStubOrParent(stub) {
	return stub[RAW_STUB].hook;
}
function unwrapStubAndPath(stub) {
	return stub[RAW_STUB];
}
async function pullPromise(promise) {
	let { hook, pathIfPromise } = promise[RAW_STUB];
	if (pathIfPromise.length > 0) hook = hook.get(pathIfPromise);
	return (await hook.pull()).deliverResolve();
}
var RpcPayload = class RpcPayload {
	value;
	source;
	hooks;
	promises;
	callHandler;
	static fromAppParams(value) {
		return new RpcPayload(value, "params");
	}
	static fromAppReturn(value) {
		return new RpcPayload(value, "return");
	}
	static fromArray(array) {
		let hooks = [];
		let promises = [];
		let resultArray = [];
		for (let payload of array) {
			payload.ensureDeepCopied();
			for (let hook of payload.hooks) hooks.push(hook);
			for (let promise of payload.promises) {
				if (promise.parent === payload) promise = {
					parent: resultArray,
					property: resultArray.length,
					promise: promise.promise
				};
				promises.push(promise);
			}
			resultArray.push(payload.value);
		}
		return new RpcPayload(resultArray, "owned", hooks, promises);
	}
	static forEvaluate(hooks, promises, callHandler) {
		return new RpcPayload(null, "owned", hooks, promises, callHandler);
	}
	static deepCopyFrom(value, oldParent, owner) {
		let result = new RpcPayload(null, "owned", [], []);
		result.value = result.deepCopy(value, oldParent, "value", result, true, owner);
		return result;
	}
	constructor(value, source, hooks, promises, callHandler) {
		this.value = value;
		this.source = source;
		this.hooks = hooks;
		this.promises = promises;
		this.callHandler = callHandler;
	}
	rpcTargets;
	getHookForRpcTarget(target, parent, dupStubs = true) {
		if (this.source === "params") {
			if (dupStubs) {
				let dupable = target;
				if (typeof dupable.dup === "function") target = dupable.dup();
			}
			return TargetStubHook.create(target, parent);
		} else if (this.source === "return") {
			let hook = this.rpcTargets?.get(target);
			if (hook) if (dupStubs) return hook.dup();
			else {
				this.rpcTargets?.delete(target);
				return hook;
			}
			else {
				hook = TargetStubHook.create(target, parent);
				if (dupStubs) {
					if (!this.rpcTargets) this.rpcTargets = /* @__PURE__ */ new Map();
					this.rpcTargets.set(target, hook);
					return hook.dup();
				} else return hook;
			}
		} else throw new Error("owned payload shouldn't contain raw RpcTargets");
	}
	getHookForWritableStream(stream, parent, dupStubs = true) {
		if (this.source === "params") return streamImpl.createWritableStreamHook(stream);
		else if (this.source === "return") {
			let hook = this.rpcTargets?.get(stream);
			if (hook) if (dupStubs) return hook.dup();
			else {
				this.rpcTargets?.delete(stream);
				return hook;
			}
			else {
				hook = streamImpl.createWritableStreamHook(stream);
				if (dupStubs) {
					if (!this.rpcTargets) this.rpcTargets = /* @__PURE__ */ new Map();
					this.rpcTargets.set(stream, hook);
					return hook.dup();
				} else return hook;
			}
		} else throw new Error("owned payload shouldn't contain raw WritableStreams");
	}
	getHookForReadableStream(stream, parent, dupStubs = true) {
		if (this.source === "params") return streamImpl.createReadableStreamHook(stream);
		else if (this.source === "return") {
			let hook = this.rpcTargets?.get(stream);
			if (hook) if (dupStubs) return hook.dup();
			else {
				this.rpcTargets?.delete(stream);
				return hook;
			}
			else {
				hook = streamImpl.createReadableStreamHook(stream);
				if (dupStubs) {
					if (!this.rpcTargets) this.rpcTargets = /* @__PURE__ */ new Map();
					this.rpcTargets.set(stream, hook);
					return hook.dup();
				} else return hook;
			}
		} else throw new Error("owned payload shouldn't contain raw ReadableStreams");
	}
	getHookForWebSocket(webSocket, makeHook) {
		if (this.source === "params") return makeHook();
		else if (this.source === "return") {
			let hook = makeHook();
			if (!this.rpcTargets) this.rpcTargets = /* @__PURE__ */ new Map();
			this.rpcTargets.set(webSocket, hook);
			return hook.dup();
		} else throw new Error("owned payload shouldn't contain raw WebSockets");
	}
	getExistingHookForWebSocket(webSocket, dupStubs) {
		let hook = this.rpcTargets?.get(webSocket);
		if (hook && !dupStubs) {
			this.rpcTargets.delete(webSocket);
			return hook;
		}
		return hook?.dup();
	}
	deepCopy(value, oldParent, property, parent, dupStubs, owner) {
		switch (typeForRpc(value)) {
			case "unsupported": return value;
			case "primitive":
			case "bigint":
			case "date":
			case "bytes":
			case "blob":
			case "url":
			case "error":
			case "undefined": return value;
			case "array": {
				let array = value;
				let len = array.length;
				let result = new Array(len);
				for (let i = 0; i < len; i++) result[i] = this.deepCopy(array[i], array, i, result, dupStubs, owner);
				return result;
			}
			case "object": {
				let result = {};
				let object = value;
				for (let i in object) result[i] = this.deepCopy(object[i], object, i, result, dupStubs, owner);
				return result;
			}
			case "stub":
			case "rpc-promise": {
				let stub = value;
				let hook;
				if (dupStubs) hook = unwrapStubAndDup(stub);
				else hook = unwrapStubTakingOwnership(stub);
				if (stub instanceof RpcPromise$1) {
					let promise = new RpcPromise$1(hook, []);
					this.promises.push({
						parent,
						property,
						promise
					});
					return promise;
				} else {
					this.hooks.push(hook);
					return new RpcStub$1(hook);
				}
			}
			case "function":
			case "rpc-target": {
				let target = value;
				let hook;
				if (owner) hook = owner.getHookForRpcTarget(target, oldParent, dupStubs);
				else hook = TargetStubHook.create(target, oldParent);
				this.hooks.push(hook);
				return new RpcStub$1(hook);
			}
			case "rpc-thenable": {
				let target = value;
				let promise;
				if (owner) promise = new RpcPromise$1(owner.getHookForRpcTarget(target, oldParent, dupStubs), []);
				else promise = new RpcPromise$1(TargetStubHook.create(target, oldParent), []);
				this.promises.push({
					parent,
					property,
					promise
				});
				return promise;
			}
			case "writable": {
				let stream = value;
				let hook;
				if (owner) hook = owner.getHookForWritableStream(stream, oldParent, dupStubs);
				else hook = streamImpl.createWritableStreamHook(stream);
				this.hooks.push(hook);
				return stream;
			}
			case "readable": {
				let stream = value;
				let hook;
				if (owner) hook = owner.getHookForReadableStream(stream, oldParent, dupStubs);
				else hook = streamImpl.createReadableStreamHook(stream);
				this.hooks.push(hook);
				return stream;
			}
			case "headers": return new Headers(value);
			case "request": {
				let req = value;
				if (req.body) this.deepCopy(req.body, req, "body", req, dupStubs, owner);
				return new Request(req);
			}
			case "response": {
				let resp = value;
				if (resp.body) this.deepCopy(resp.body, resp, "body", resp, dupStubs, owner);
				let result = new Response(resp.body, resp);
				let webSocket = resp.webSocket;
				if (webSocket) {
					let hook = owner?.getExistingHookForWebSocket(webSocket, dupStubs);
					if (hook) this.hooks.push(hook);
					Object.defineProperty(result, "webSocket", {
						value: webSocket,
						configurable: true
					});
				}
				return result;
			}
			default: throw new Error("unreachable");
		}
	}
	ensureDeepCopied() {
		if (this.source !== "owned") {
			let dupStubs = this.source === "params";
			this.hooks = [];
			this.promises = [];
			try {
				this.value = this.deepCopy(this.value, void 0, "value", this, dupStubs, this);
			} catch (err) {
				this.hooks = void 0;
				this.promises = void 0;
				throw err;
			}
			this.source = "owned";
			if (this.rpcTargets && this.rpcTargets.size > 0) throw new Error("Not all rpcTargets were accounted for in deep-copy?");
			this.rpcTargets = void 0;
		}
	}
	deliverTo(parent, property, promises) {
		this.ensureDeepCopied();
		if (this.value instanceof RpcPromise$1) RpcPayload.deliverRpcPromiseTo(this.value, parent, property, promises);
		else {
			parent[property] = this.value;
			for (let record of this.promises) RpcPayload.deliverRpcPromiseTo(record.promise, record.parent, record.property, promises);
		}
	}
	static deliverRpcPromiseTo(promise, parent, property, promises) {
		let hook = unwrapStubNoProperties(promise);
		if (!hook) throw new Error("property promises should have been resolved earlier");
		let inner = hook.pull();
		if (inner instanceof RpcPayload) inner.deliverTo(parent, property, promises);
		else promises.push(inner.then((payload) => {
			let subPromises = [];
			payload.deliverTo(parent, property, subPromises);
			if (subPromises.length > 0) return Promise.all(subPromises);
		}));
	}
	async deliverCall(func, thisArg) {
		try {
			let promises = [];
			this.deliverTo(this, "value", promises);
			if (promises.length > 0) await Promise.all(promises);
			let result = Function.prototype.apply.call(func, thisArg, this.value);
			if (result instanceof RpcPromise$1) return RpcPayload.fromAppReturn(result);
			else return RpcPayload.fromAppReturn(await result);
		} finally {
			this.dispose();
		}
	}
	async deliverStreamWrite(writer) {
		try {
			let promises = [];
			this.deliverTo(this, "value", promises);
			if (promises.length > 0) await Promise.all(promises);
			let chunk = this.value[0];
			if ((this.hooks.length > 0 || this.promises.length > 0) && chunk instanceof Object) {
				if (!(Symbol.dispose in chunk)) Object.defineProperty(chunk, Symbol.dispose, {
					value: () => this.dispose(),
					writable: true,
					enumerable: false,
					configurable: true
				});
				await writer.write(chunk);
				return RpcPayload.fromAppReturn(void 0);
			}
			await writer.write(chunk);
			this.dispose();
			return RpcPayload.fromAppReturn(void 0);
		} catch (err) {
			this.dispose();
			throw err;
		}
	}
	async deliverResolve() {
		try {
			let promises = [];
			this.deliverTo(this, "value", promises);
			if (promises.length > 0) await Promise.all(promises);
			let result = this.value;
			if (result instanceof Object) {
				if (!(Symbol.dispose in result)) Object.defineProperty(result, Symbol.dispose, {
					value: () => this.dispose(),
					writable: true,
					enumerable: false,
					configurable: true
				});
			}
			return result;
		} catch (err) {
			this.dispose();
			throw err;
		}
	}
	dispose() {
		if (this.source === "owned") {
			this.hooks.forEach((hook) => hook.dispose());
			this.promises.forEach((promise) => promise.promise[Symbol.dispose]());
		} else if (this.source === "return") {
			this.disposeImpl(this.value, void 0);
			if (this.rpcTargets && this.rpcTargets.size > 0) throw new Error("Not all rpcTargets were accounted for in disposeImpl()?");
		}
		this.source = "owned";
		this.hooks = [];
		this.promises = [];
	}
	disposeImpl(value, parent) {
		switch (typeForRpc(value)) {
			case "unsupported":
			case "primitive":
			case "bigint":
			case "bytes":
			case "blob":
			case "date":
			case "url":
			case "error":
			case "undefined": return;
			case "array": {
				let array = value;
				let len = array.length;
				for (let i = 0; i < len; i++) this.disposeImpl(array[i], array);
				return;
			}
			case "object": {
				let object = value;
				for (let i in object) this.disposeImpl(object[i], object);
				return;
			}
			case "stub":
			case "rpc-promise": {
				let hook = unwrapStubNoProperties(value);
				if (hook) hook.dispose();
				return;
			}
			case "function":
			case "rpc-target": {
				let target = value;
				let hook = this.rpcTargets?.get(target);
				if (hook) {
					hook.dispose();
					this.rpcTargets.delete(target);
				} else disposeRpcTarget(target);
				return;
			}
			case "rpc-thenable": return;
			case "headers": return;
			case "request": {
				let req = value;
				if (req.body) this.disposeImpl(req.body, req);
				return;
			}
			case "response": {
				let resp = value;
				if (resp.body) this.disposeImpl(resp.body, resp);
				let webSocket = resp.webSocket;
				let hook = webSocket && this.rpcTargets?.get(webSocket);
				if (hook) {
					this.rpcTargets.delete(webSocket);
					hook.dispose();
				} else if (webSocket) {
					try {
						webSocket.accept?.();
					} catch {}
					try {
						webSocket.close();
					} catch {}
				}
				return;
			}
			case "writable": {
				let stream = value;
				let hook = this.rpcTargets?.get(stream);
				if (hook) this.rpcTargets.delete(stream);
				else hook = streamImpl.createWritableStreamHook(stream);
				hook.dispose();
				return;
			}
			case "readable": {
				let stream = value;
				let hook = this.rpcTargets?.get(stream);
				if (hook) this.rpcTargets.delete(stream);
				else hook = streamImpl.createReadableStreamHook(stream);
				hook.dispose();
				return;
			}
			default: return;
		}
	}
	ignoreUnhandledRejections() {
		if (this.hooks) {
			this.hooks.forEach((hook) => {
				hook.ignoreUnhandledRejections();
			});
			this.promises.forEach((promise) => unwrapStubOrParent(promise.promise).ignoreUnhandledRejections());
		} else this.ignoreUnhandledRejectionsImpl(this.value);
	}
	ignoreUnhandledRejectionsImpl(value) {
		switch (typeForRpc(value)) {
			case "unsupported":
			case "primitive":
			case "bigint":
			case "bytes":
			case "blob":
			case "date":
			case "error":
			case "undefined":
			case "function":
			case "rpc-target":
			case "writable":
			case "readable":
			case "url":
			case "headers":
			case "request":
			case "response": return;
			case "array": {
				let array = value;
				let len = array.length;
				for (let i = 0; i < len; i++) this.ignoreUnhandledRejectionsImpl(array[i]);
				return;
			}
			case "object": {
				let object = value;
				for (let i in object) this.ignoreUnhandledRejectionsImpl(object[i]);
				return;
			}
			case "stub":
			case "rpc-promise":
				unwrapStubOrParent(value).ignoreUnhandledRejections();
				return;
			case "rpc-thenable":
				value.then((_) => {}, (_) => {});
				return;
			default: return;
		}
	}
};
function followPath(value, parent, path, owner) {
	for (let i = 0; i < path.length; i++) {
		parent = value;
		let part = path[i];
		if (part in Object.prototype) {
			value = void 0;
			continue;
		}
		switch (typeForRpc(value)) {
			case "object":
			case "function":
				if (Object.hasOwn(value, part)) value = value[part];
				else value = void 0;
				break;
			case "array":
				if (Number.isInteger(part) && part >= 0) value = value[part];
				else value = void 0;
				break;
			case "rpc-target":
			case "rpc-thenable":
				if (Object.hasOwn(value, part)) throw new TypeError(`Attempted to access property '${part}', which is an instance property of the RpcTarget. To avoid leaking private internals, instance properties cannot be accessed over RPC. If you want to make this property available over RPC, define it as a method or getter on the class, instead of an instance property.`);
				else value = value[part];
				owner = null;
				break;
			case "stub":
			case "rpc-promise": {
				let { hook, pathIfPromise } = unwrapStubAndPath(value);
				return {
					hook,
					remainingPath: pathIfPromise ? pathIfPromise.concat(path.slice(i)) : path.slice(i)
				};
			}
			case "writable":
				value = void 0;
				break;
			case "readable":
				value = void 0;
				break;
			case "primitive":
			case "bigint":
			case "bytes":
			case "blob":
			case "date":
			case "error":
			case "url":
			case "headers":
			case "request":
			case "response":
				value = void 0;
				break;
			case "undefined":
				value = value[part];
				break;
			case "unsupported": if (i === 0) throw new TypeError(`RPC stub points at a non-serializable type.`);
			else {
				let prefix = path.slice(0, i).join(".");
				let remainder = path.slice(0, i).join(".");
				throw new TypeError(`'${prefix}' is not a serializable type, so property ${remainder} cannot be accessed.`);
			}
			default: throw new TypeError("unreachable");
		}
	}
	if (value instanceof RpcPromise$1) {
		let { hook, pathIfPromise } = unwrapStubAndPath(value);
		return {
			hook,
			remainingPath: pathIfPromise || []
		};
	}
	return {
		value,
		parent,
		owner
	};
}
function deliverCallWithHandler(args, path, func, thisArg) {
	let invocation;
	let inHandler = true;
	let wrapped;
	try {
		wrapped = Promise.resolve(args.callHandler({
			path: [...path],
			target: thisArg ?? func
		}, () => {
			if (!inHandler || invocation) throw new TypeError("onCall must invoke synchronously and only once.");
			invocation = args.deliverCall(func, thisArg);
			invocation.catch(() => {});
			return invocation;
		}));
	} catch (err) {
		wrapped = Promise.reject(err);
	}
	inHandler = false;
	if (!invocation) args.dispose();
	let result = wrapped.then(async (payload) => {
		if (!invocation || payload !== await invocation) throw new TypeError("onCall must return the result of invoke().");
		return payload;
	});
	result.catch(() => invocation?.then((payload) => payload.dispose(), () => {}));
	return result;
}
var ValueStubHook = class extends StubHook {
	call(path, args) {
		let followResult;
		try {
			let { value, owner } = this.getValue();
			followResult = followPath(value, void 0, path, owner);
		} catch (err) {
			args.dispose();
			return new ErrorStubHook(err);
		}
		if (followResult.hook) return followResult.hook.call(followResult.remainingPath, args);
		if (typeof followResult.value != "function") {
			args.dispose();
			return new ErrorStubHook(/* @__PURE__ */ new TypeError(`'${path.join(".")}' is not a function.`));
		}
		return new PromiseStubHook((args.callHandler ? deliverCallWithHandler(args, path, followResult.value, followResult.parent) : args.deliverCall(followResult.value, followResult.parent)).then((payload) => {
			return new PayloadStubHook(payload);
		}));
	}
	map(path, captures, instructions) {
		try {
			let followResult;
			try {
				let { value, owner } = this.getValue();
				followResult = followPath(value, void 0, path, owner);
			} catch (err) {
				for (let cap of captures) cap.dispose();
				throw err;
			}
			if (followResult.hook) return followResult.hook.map(followResult.remainingPath, captures, instructions);
			return mapImpl.applyMap(followResult.value, followResult.parent, followResult.owner, captures, instructions);
		} catch (err) {
			return new ErrorStubHook(err);
		}
	}
	get(path) {
		try {
			let { value, owner } = this.getValue();
			if (path.length === 0 && owner === null) {
				if (value instanceof Object && "then" in value) return this.dup();
				throw new Error("Can't dup an RpcTarget stub as a promise.");
			}
			let followResult = followPath(value, void 0, path, owner);
			if (followResult.hook) return followResult.hook.get(followResult.remainingPath);
			return new PayloadStubHook(RpcPayload.deepCopyFrom(followResult.value, followResult.parent, followResult.owner));
		} catch (err) {
			return new ErrorStubHook(err);
		}
	}
};
var PayloadStubHook = class PayloadStubHook extends ValueStubHook {
	constructor(payload) {
		super();
		this.payload = payload;
	}
	payload;
	getPayload() {
		if (this.payload) return this.payload;
		else throw new Error("Attempted to use an RPC StubHook after it was disposed.");
	}
	getValue() {
		let payload = this.getPayload();
		return {
			value: payload.value,
			owner: payload
		};
	}
	dup() {
		let thisPayload = this.getPayload();
		return new PayloadStubHook(RpcPayload.deepCopyFrom(thisPayload.value, void 0, thisPayload));
	}
	pull() {
		return this.getPayload();
	}
	ignoreUnhandledRejections() {
		if (this.payload) this.payload.ignoreUnhandledRejections();
	}
	dispose() {
		if (this.payload) {
			this.payload.dispose();
			this.payload = void 0;
		}
	}
	onBroken(callback) {
		if (this.payload) {
			if (this.payload.value instanceof RpcStub$1) this.payload.value.onRpcBroken(callback);
		}
	}
};
function disposeRpcTarget(target) {
	if (Symbol.dispose in target) try {
		target[Symbol.dispose]();
	} catch (err) {
		Promise.reject(err);
	}
}
var TargetStubHook = class TargetStubHook extends ValueStubHook {
	static create(value, parent) {
		if (typeof value !== "function") parent = void 0;
		return new TargetStubHook(value, parent);
	}
	constructor(target, parent, dupFrom) {
		super();
		this.target = target;
		this.parent = parent;
		if (dupFrom) {
			if (dupFrom.refcount) {
				this.refcount = dupFrom.refcount;
				++this.refcount.count;
			}
		} else if (Symbol.dispose in target) this.refcount = { count: 1 };
	}
	target;
	parent;
	refcount;
	getTarget() {
		if (this.target) return this.target;
		else throw new Error("Attempted to use an RPC StubHook after it was disposed.");
	}
	getValue() {
		return {
			value: this.getTarget(),
			owner: null
		};
	}
	dup() {
		return new TargetStubHook(this.getTarget(), this.parent, this);
	}
	pull() {
		let target = this.getTarget();
		if ("then" in target) return Promise.resolve(target).then((resolution) => {
			return RpcPayload.fromAppReturn(resolution);
		});
		else return Promise.reject(/* @__PURE__ */ new Error("Tried to resolve a non-promise stub."));
	}
	ignoreUnhandledRejections() {}
	dispose() {
		if (this.target) {
			if (this.refcount) {
				if (--this.refcount.count == 0) disposeRpcTarget(this.target);
			}
			this.target = void 0;
		}
	}
	onBroken(callback) {
		let target = this.target;
		if (target && "then" in target) Promise.resolve(target).then(() => {}, callback);
	}
};
var PromiseStubHook = class PromiseStubHook extends StubHook {
	promise;
	resolution;
	constructor(promise) {
		super();
		this.promise = promise.then((res) => {
			this.resolution = res;
			return res;
		});
	}
	call(path, args) {
		args.ensureDeepCopied();
		return new PromiseStubHook(this.promise.then((hook) => hook.call(path, args), (err) => {
			args.dispose();
			throw err;
		}));
	}
	stream(path, args) {
		args.ensureDeepCopied();
		return { promise: this.promise.then((hook) => hook.stream(path, args).promise, (err) => {
			args.dispose();
			throw err;
		}) };
	}
	map(path, captures, instructions) {
		return new PromiseStubHook(this.promise.then((hook) => hook.map(path, captures, instructions), (err) => {
			for (let cap of captures) cap.dispose();
			throw err;
		}));
	}
	get(path) {
		return new PromiseStubHook(this.promise.then((hook) => hook.get(path)));
	}
	dup() {
		if (this.resolution) return this.resolution.dup();
		else return new PromiseStubHook(this.promise.then((hook) => hook.dup()));
	}
	pull() {
		if (this.resolution) return this.resolution.pull();
		else return this.promise.then((hook) => hook.pull());
	}
	ignoreUnhandledRejections() {
		if (this.resolution) this.resolution.ignoreUnhandledRejections();
		else this.promise.then((res) => {
			res.ignoreUnhandledRejections();
		}, (err) => {});
	}
	dispose() {
		this.promise.then((hook) => hook.dispose(), () => {});
	}
	onBroken(callback) {
		if (this.resolution) this.resolution.onBroken(callback);
		else this.promise.then((hook) => {
			hook.onBroken(callback);
		}, callback);
	}
};
const nativeWebSocketPair = globalThis.WebSocketPair;
function isCloseRecord(chunk) {
	return typeof chunk === "object" && chunk !== null && "close" in chunk;
}
function toStringOrBytes(data) {
	if (typeof data === "string") return data;
	else if (data instanceof Uint8Array) return data;
	else if (data instanceof ArrayBuffer) return new Uint8Array(data);
	else if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	else throw new TypeError("Unsupported WebSocket message type.");
}
function copyMessage(data) {
	if (typeof data === "string") return data;
	else if (data instanceof ArrayBuffer) return data.slice(0);
	else if (ArrayBuffer.isView(data)) {
		let copy = new Uint8Array(data.byteLength);
		copy.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
		return copy.buffer;
	} else throw new TypeError("Unsupported WebSocket message type.");
}
function closeSocket(socket, code, reason) {
	if (code !== void 0 && code !== 1005 && code !== 1006 && code !== 1015) try {
		let bytes = new TextEncoder().encode(reason ?? "");
		let boundedReason = bytes.length <= 123 ? reason : new TextDecoder().decode(bytes.subarray(0, 123), { stream: true });
		socket.close(code, boundedReason);
		return;
	} catch {}
	try {
		socket.close();
	} catch {}
}
const sentWebSockets = /* @__PURE__ */ new WeakSet();
function webSocketToStreams(socket) {
	if (sentWebSockets.has(socket)) throw new Error("A WebSocket can only be sent over RPC once.");
	sentWebSockets.add(socket);
	socket.accept?.();
	try {
		socket.binaryType = "arraybuffer";
	} catch {}
	let closed = false;
	let readableController;
	return {
		readable: new ReadableStream({
			start(controller) {
				readableController = controller;
				socket.addEventListener("message", (event) => {
					if (closed) return;
					try {
						controller.enqueue(toStringOrBytes(event.data));
					} catch (err) {
						closed = true;
						try {
							controller.error(err);
						} catch {}
						closeSocket(socket);
					}
				});
				socket.addEventListener("close", (event) => {
					if (closed) return;
					closed = true;
					try {
						controller.enqueue({ close: {
							code: event.code ?? 1005,
							reason: event.reason ?? ""
						} });
						controller.close();
					} catch {}
				});
				socket.addEventListener("error", () => {
					if (closed) return;
					closed = true;
					try {
						controller.error(/* @__PURE__ */ new Error("WebSocket failed."));
					} catch {}
				});
			},
			cancel() {
				closed = true;
				closeSocket(socket);
			}
		}),
		writable: new WritableStream({
			write(chunk) {
				if (isCloseRecord(chunk)) {
					closeSocket(socket, chunk.close.code, chunk.close.reason);
					if (!closed) {
						closed = true;
						try {
							readableController.enqueue({ close: {
								code: chunk.close.code,
								reason: chunk.close.reason
							} });
							readableController.close();
						} catch {}
					}
				} else socket.send(toStringOrBytes(chunk));
			},
			close() {
				closeSocket(socket);
			},
			abort() {
				closeSocket(socket);
			}
		})
	};
}
var WebSocketEvents = class {
	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSING = 2;
	static CLOSED = 3;
	binaryType = "arraybuffer";
	#listeners = /* @__PURE__ */ new Map();
	#handlers = {
		message: null,
		close: null,
		error: null
	};
	get onmessage() {
		return this.#handlers.message;
	}
	set onmessage(listener) {
		this.#setHandler("message", listener);
	}
	get onclose() {
		return this.#handlers.close;
	}
	set onclose(listener) {
		this.#setHandler("close", listener);
	}
	get onerror() {
		return this.#handlers.error;
	}
	set onerror(listener) {
		this.#setHandler("error", listener);
	}
	addEventListener(type, listener, options) {
		let list = this.#listeners.get(type);
		if (!list) {
			list = [];
			this.#listeners.set(type, list);
		}
		list.push({
			listener,
			once: !!options?.once
		});
		this.listening();
	}
	removeEventListener(type, listener) {
		let list = this.#listeners.get(type);
		let index = list?.findIndex((entry) => entry.listener === listener) ?? -1;
		if (index >= 0) list.splice(index, 1);
	}
	listening() {}
	emit(type, event) {
		for (let entry of [...this.#listeners.get(type) ?? []]) {
			if (entry.once) this.removeEventListener(type, entry.listener);
			try {
				entry.listener.call(this, event);
			} catch (err) {
				console.error(err);
			}
		}
		let handler = this.#handlers[type];
		if (handler) try {
			handler.call(this, event);
		} catch (err) {
			console.error(err);
		}
	}
	#setHandler(type, listener) {
		this.#handlers[type] = listener;
		if (listener) this.listening();
	}
};
var TunneledWebSocket = class TunneledWebSocket extends WebSocketEvents {
	#readable;
	#writableHook;
	#claimed = false;
	#writer;
	#readyState = TunneledWebSocket.OPEN;
	constructor(readable, writableHook) {
		super();
		this.#readable = readable;
		this.#writableHook = writableHook;
	}
	get readyState() {
		return this.#readyState;
	}
	accept() {
		this.#claim();
	}
	send(data) {
		if (this.#readyState !== TunneledWebSocket.OPEN) throw new Error("Can't call send() on a WebSocket that is closing or closed.");
		this.#claim();
		this.#write(toStringOrBytes(copyMessage(data)));
	}
	close(code, reason) {
		if (this.#readyState >= TunneledWebSocket.CLOSING) return;
		this.#claim();
		this.#readyState = TunneledWebSocket.CLOSING;
		if (this.#writer) {
			this.#write({ close: {
				code: code ?? 1005,
				reason: reason ?? ""
			} });
			this.#writer.close().catch(() => {});
		}
	}
	[Symbol.dispose]() {
		this.close();
		this.#release();
	}
	listening() {
		this.#claim();
	}
	#claim() {
		if (this.#claimed) return;
		this.#claimed = true;
		if (!this.#writableHook || this.#readyState === TunneledWebSocket.CLOSED) return;
		let writableHook;
		try {
			writableHook = this.#writableHook.dup();
		} catch (err) {
			this.#writableHook = void 0;
			queueMicrotask(() => this.#fail(err));
			return;
		}
		this.#writableHook = writableHook;
		this.#writer = streamImpl.createWritableStreamFromHook(writableHook).getWriter();
		this.#readLoop(this.#readable.getReader()).catch((err) => this.#fail(err));
	}
	async #readLoop(reader) {
		while (true) {
			let { done, value } = await reader.read();
			if (this.#readyState === TunneledWebSocket.CLOSED) return;
			if (done) {
				this.#close(1005, "");
				return;
			} else if (isCloseRecord(value)) {
				this.#close(value.close.code, value.close.reason);
				return;
			} else this.emit("message", {
				type: "message",
				data: copyMessage(toStringOrBytes(value))
			});
		}
	}
	#close(code, reason) {
		this.#readyState = TunneledWebSocket.CLOSED;
		this.#release();
		this.emit("close", {
			type: "close",
			code,
			reason
		});
	}
	#fail(error) {
		if (this.#readyState === TunneledWebSocket.CLOSED) return;
		this.#readyState = TunneledWebSocket.CLOSED;
		this.#release();
		this.emit("error", {
			type: "error",
			error
		});
		this.emit("close", {
			type: "close",
			code: 1006,
			reason: "WebSocket tunnel failed."
		});
	}
	#write(chunk) {
		this.#writer?.write(chunk).catch(() => {});
	}
	#release() {
		if (this.#writer) this.#writer.close().catch(() => {});
		else if (this.#claimed) this.#writableHook?.dispose();
		this.#writableHook = void 0;
		this.#writer = void 0;
	}
};
function makeUpgradeResponse(readable, writableHook, init) {
	let socket = new TunneledWebSocket(readable, writableHook);
	if (nativeWebSocketPair !== void 0) {
		let pair = new nativeWebSocketPair();
		pumpNativeSocket(pair[1], socket);
		return new Response(null, {
			...init,
			status: 101,
			webSocket: pair[0]
		});
	} else {
		let response = new Response(null, init);
		Object.defineProperty(response, "webSocket", {
			value: socket,
			configurable: true
		});
		return response;
	}
}
function pumpNativeSocket(native, tunneled) {
	native.accept();
	native.addEventListener("message", (event) => {
		try {
			tunneled.send(toStringOrBytes(event.data));
		} catch {}
	});
	tunneled.addEventListener("message", (event) => {
		try {
			native.send(event.data);
		} catch {}
	});
	native.addEventListener("close", (event) => tunneled.close(event.code, event.reason));
	native.addEventListener("error", () => tunneled.close());
	tunneled.addEventListener("close", (event) => closeSocket(native, event.code, event.reason));
	tunneled.addEventListener("error", () => closeSocket(native));
}
const DEFAULT_LIMITS = {
	maxBigIntDigits: 16384,
	maxDepth: 256,
	maxMessageSize: 33554432
};
const NATIVE_LITTLE_ENDIAN = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
const BYTE_CONTAINER_TYPE_NAMES = [
	"ArrayBuffer",
	"DataView",
	"Int8Array",
	"Uint8Array",
	"Uint8ClampedArray",
	"Int16Array",
	"Uint16Array",
	"Int32Array",
	"Uint32Array",
	"BigInt64Array",
	"BigUint64Array",
	"Float32Array",
	"Float64Array"
];
function isValidByteContainerName(value) {
	return BYTE_CONTAINER_TYPE_NAMES.includes(value);
}
const TYPED_ARRAY_ELEMENT_SIZE = {
	ArrayBuffer: void 0,
	DataView: void 0,
	Int8Array: void 0,
	Uint8Array: void 0,
	Uint8ClampedArray: void 0,
	Int16Array: 2,
	Uint16Array: 2,
	Int32Array: 4,
	Uint32Array: 4,
	BigInt64Array: 8,
	BigUint64Array: 8,
	Float32Array: 4,
	Float64Array: 8
};
const BYTE_CONTAINER_PROTOTYPES = {
	ArrayBuffer: ArrayBuffer.prototype,
	DataView: DataView.prototype,
	Int8Array: Int8Array.prototype,
	Uint8ClampedArray: Uint8ClampedArray.prototype,
	Int16Array: Int16Array.prototype,
	Uint16Array: Uint16Array.prototype,
	Int32Array: Int32Array.prototype,
	Uint32Array: Uint32Array.prototype,
	BigInt64Array: BigInt64Array.prototype,
	BigUint64Array: BigUint64Array.prototype,
	Float32Array: Float32Array.prototype,
	Float64Array: Float64Array.prototype
};
const BYTE_CONTAINER_TYPE_BY_PROTOTYPE = /* @__PURE__ */ new Map();
for (let type of Object.keys(BYTE_CONTAINER_PROTOTYPES)) BYTE_CONTAINER_TYPE_BY_PROTOTYPE.set(BYTE_CONTAINER_PROTOTYPES[type], type);
function swapByteOrder(bytes, elementSize) {
	if (elementSize !== 2 && elementSize !== 4 && elementSize !== 8) throw new RangeError(`Unsupported element size: ${elementSize}`);
	let view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	for (let offset = 0; offset < bytes.byteLength; offset += elementSize) switch (elementSize) {
		case 2:
			view.setUint16(offset, view.getUint16(offset, false), true);
			break;
		case 4:
			view.setUint32(offset, view.getUint32(offset, false), true);
			break;
		case 8: view.setBigUint64(offset, view.getBigUint64(offset, false), true);
	}
}
var NullExporter = class {
	exportStub(stub) {
		throw new Error("Cannot serialize RPC stubs without an RPC session.");
	}
	exportPromise(stub) {
		throw new Error("Cannot serialize RPC stubs without an RPC session.");
	}
	getImport(hook) {}
	unexport(ids) {}
	createPipe(readable) {
		throw new Error("Cannot create pipes without an RPC session.");
	}
	onSendError(error) {}
};
const NULL_EXPORTER = new NullExporter();
async function streamToBlob(stream, type) {
	let b = await new Response(stream).blob();
	return b.type === type ? b : b.slice(0, b.size, type);
}
const ERROR_TYPES = {
	__proto__: null,
	Error,
	EvalError,
	RangeError,
	ReferenceError,
	SyntaxError,
	TypeError,
	URIError,
	AggregateError
};
var Devaluator = class Devaluator {
	exporter;
	source;
	encodingLevel;
	constructor(exporter, source, encodingLevel) {
		this.exporter = exporter;
		this.source = source;
		this.encodingLevel = encodingLevel;
	}
	static devaluate(value, parent, exporter = NULL_EXPORTER, source, encodingLevel = "string") {
		let devaluator = new Devaluator(exporter, source, encodingLevel);
		try {
			return devaluator.devaluateImpl(value, parent, 0);
		} catch (err) {
			if (devaluator.exports) try {
				exporter.unexport(devaluator.exports);
			} catch (err) {}
			throw err;
		}
	}
	exports;
	devaluateImpl(value, parent, depth) {
		if (depth >= 256) throw new Error("Serialization exceeded maximum allowed depth. (Does the message contain cycles?)");
		switch (typeForRpc(value)) {
			case "unsupported": {
				let msg;
				try {
					msg = `Cannot serialize value: ${value}`;
				} catch (err) {
					msg = "Cannot serialize value: (couldn't stringify value)";
				}
				throw new TypeError(msg);
			}
			case "primitive": if (typeof value === "number" && !isFinite(value)) {
				if (this.encodingLevel === "structuredClonable") return value;
				if (value === Infinity) return ["inf"];
				else if (value === -Infinity) return ["-inf"];
				else return ["nan"];
			} else return value;
			case "object": {
				let object = value;
				let result = {};
				for (let key in object) result[key] = this.devaluateImpl(object[key], object, depth + 1);
				return result;
			}
			case "array": {
				let array = value;
				let len = array.length;
				let result = new Array(len);
				for (let i = 0; i < len; i++) result[i] = this.devaluateImpl(array[i], array, depth + 1);
				return [result];
			}
			case "bigint":
				if (this.encodingLevel === "structuredClonable") return value;
				return ["bigint", value.toString()];
			case "date": {
				if (this.encodingLevel === "structuredClonable") return value;
				const time = value.getTime();
				return ["date", Number.isNaN(time) ? null : time];
			}
			case "bytes": {
				let alternateTypeName = BYTE_CONTAINER_TYPE_BY_PROTOTYPE.get(Object.getPrototypeOf(value));
				let bytes;
				if (alternateTypeName === "ArrayBuffer") bytes = new Uint8Array(value);
				else if (alternateTypeName === void 0) bytes = value;
				else {
					let view = value;
					bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
					let elementSize = TYPED_ARRAY_ELEMENT_SIZE[alternateTypeName];
					if (!NATIVE_LITTLE_ENDIAN && elementSize) {
						bytes = bytes.slice();
						swapByteOrder(bytes, elementSize);
					}
				}
				if (this.encodingLevel === "structuredClonable" || this.encodingLevel === "jsonCompatibleWithBytes") return alternateTypeName === void 0 ? ["bytes", bytes] : [
					"bytes",
					bytes,
					alternateTypeName
				];
				let b64;
				if (bytes.toBase64) b64 = bytes.toBase64({ omitPadding: true });
				else if (typeof Buffer !== "undefined") b64 = (bytes instanceof Buffer ? bytes : Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)).toString("base64");
				else {
					let binary = "";
					for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
					b64 = btoa(binary);
				}
				b64 = b64.replace(/=+$/, "");
				return alternateTypeName === void 0 ? ["bytes", b64] : [
					"bytes",
					b64,
					alternateTypeName
				];
			}
			case "url": return ["url", value.href];
			case "headers": return ["headers", [...value]];
			case "request": {
				let req = value;
				let init = {};
				if (req.method !== "GET") init.method = req.method;
				let headers = [...req.headers];
				if (headers.length > 0) init.headers = headers;
				if (req.body) {
					init.body = this.devaluateImpl(req.body, req, depth + 1);
					init.duplex = req.duplex || "half";
				} else if (req.body === void 0 && ![
					"GET",
					"HEAD",
					"OPTIONS",
					"TRACE",
					"DELETE"
				].includes(req.method)) {
					let bodyPromise = req.arrayBuffer();
					let readable = new ReadableStream({ async start(controller) {
						try {
							controller.enqueue(new Uint8Array(await bodyPromise));
							controller.close();
						} catch (err) {
							controller.error(err);
						}
					} });
					let hook = streamImpl.createReadableStreamHook(readable);
					init.body = ["readable", this.exporter.createPipe(readable, hook)];
					init.duplex = req.duplex || "half";
				}
				if (req.cache && req.cache !== "default") init.cache = req.cache;
				if (req.redirect !== "follow") init.redirect = req.redirect;
				if (req.integrity) init.integrity = req.integrity;
				if (req.mode && req.mode !== "cors") init.mode = req.mode;
				if (req.credentials && req.credentials !== "same-origin") init.credentials = req.credentials;
				if (req.referrer && req.referrer !== "about:client") init.referrer = req.referrer;
				if (req.referrerPolicy) init.referrerPolicy = req.referrerPolicy;
				if (req.keepalive) init.keepalive = req.keepalive;
				let cfReq = req;
				if (cfReq.cf) init.cf = cfReq.cf;
				if (cfReq.encodeResponseBody && cfReq.encodeResponseBody !== "automatic") init.encodeResponseBody = cfReq.encodeResponseBody;
				return [
					"request",
					req.url,
					init
				];
			}
			case "response": {
				let resp = value;
				if (resp.webSocket && resp.body) throw new TypeError("A WebSocket upgrade Response can't have a body.");
				let body = this.devaluateImpl(resp.body, resp, depth + 1);
				let init = {};
				if (resp.status !== 200) init.status = resp.status;
				if (resp.statusText) init.statusText = resp.statusText;
				let headers = [...resp.headers];
				if (headers.length > 0) init.headers = headers;
				let cfResp = resp;
				if (cfResp.cf) init.cf = cfResp.cf;
				if (cfResp.encodeBody && cfResp.encodeBody !== "automatic") init.encodeBody = cfResp.encodeBody;
				if (cfResp.webSocket) {
					if (!this.source) throw new Error("Can't serialize a WebSocket upgrade in this context.");
					delete init.status;
					delete init.statusText;
					let readableId;
					let hook = this.source.getHookForWebSocket(cfResp.webSocket, () => {
						let streams = webSocketToStreams(cfResp.webSocket);
						readableId = this.exporter.createPipe(streams.readable, streamImpl.createReadableStreamHook(streams.readable));
						return streamImpl.createWritableStreamHook(streams.writable);
					});
					init.webSocket = {
						readable: ["readable", readableId],
						writable: this.devaluateHook("writable", hook)
					};
				}
				return [
					"response",
					body,
					init
				];
			}
			case "blob": {
				let blob = value;
				let readable = blob.stream();
				let hook = streamImpl.createReadableStreamHook(readable);
				let importId = this.exporter.createPipe(readable, hook);
				return [
					"blob",
					blob.type,
					["readable", importId]
				];
			}
			case "error": {
				let e = value;
				let rewritten = this.exporter.onSendError(e);
				if (rewritten) e = rewritten;
				let anyE = e;
				let props;
				let captureProp = (key, val) => {
					let exportsBefore = this.exports?.length ?? 0;
					try {
						let encoded = this.devaluateImpl(val, e, depth + 1);
						if (!props) props = {};
						props[key] = encoded;
					} catch (err) {
						if (this.exports && this.exports.length > exportsBefore) {
							let tail = this.exports.splice(exportsBefore);
							try {
								this.exporter.unexport(tail);
							} catch (err2) {}
						}
					}
				};
				for (let key of Object.keys(e)) {
					if (key === "name" || key === "message" || key === "stack") continue;
					captureProp(key, anyE[key]);
				}
				if ("cause" in e) captureProp("cause", anyE.cause);
				if (e instanceof AggregateError) captureProp("errors", e.errors);
				let result = [
					"error",
					e.name,
					e.message
				];
				if (props) {
					result.push(rewritten && rewritten.stack ? rewritten.stack : null);
					result.push(props);
				} else if (rewritten && rewritten.stack) result.push(rewritten.stack);
				return result;
			}
			case "undefined":
				if (this.encodingLevel === "structuredClonable") return;
				return ["undefined"];
			case "stub":
			case "rpc-promise": {
				if (!this.source) throw new Error("Can't serialize RPC stubs in this context.");
				let { hook, pathIfPromise } = unwrapStubAndPath(value);
				let importId = this.exporter.getImport(hook);
				if (importId !== void 0) if (pathIfPromise) if (pathIfPromise.length > 0) return [
					"pipeline",
					importId,
					pathIfPromise
				];
				else return ["pipeline", importId];
				else return ["import", importId];
				if (pathIfPromise) hook = hook.get(pathIfPromise);
				else hook = hook.dup();
				return this.devaluateHook(pathIfPromise ? "promise" : "export", hook);
			}
			case "function":
			case "rpc-target": {
				if (!this.source) throw new Error("Can't serialize RPC stubs in this context.");
				let hook = this.source.getHookForRpcTarget(value, parent);
				return this.devaluateHook("export", hook);
			}
			case "rpc-thenable": {
				if (!this.source) throw new Error("Can't serialize RPC stubs in this context.");
				let hook = this.source.getHookForRpcTarget(value, parent);
				return this.devaluateHook("promise", hook);
			}
			case "writable": {
				if (!this.source) throw new Error("Can't serialize WritableStream in this context.");
				let hook = this.source.getHookForWritableStream(value, parent);
				return this.devaluateHook("writable", hook);
			}
			case "readable": {
				if (!this.source) throw new Error("Can't serialize ReadableStream in this context.");
				let ws = value;
				let hook = this.source.getHookForReadableStream(ws, parent);
				return ["readable", this.exporter.createPipe(ws, hook)];
			}
			default: throw new Error("unreachable");
		}
	}
	devaluateHook(type, hook) {
		if (!this.exports) this.exports = [];
		let exportId = type === "promise" ? this.exporter.exportPromise(hook) : this.exporter.exportStub(hook);
		this.exports.push(exportId);
		return [type, exportId];
	}
};
var NullImporter = class {
	importStub(idx) {
		throw new Error("Cannot deserialize RPC stubs without an RPC session.");
	}
	importPromise(idx) {
		throw new Error("Cannot deserialize RPC stubs without an RPC session.");
	}
	getExport(idx) {}
	getPipeReadable(exportId) {
		throw new Error("Cannot retrieve pipe readable without an RPC session.");
	}
	getLimits() {
		return DEFAULT_LIMITS;
	}
};
new NullImporter();
function fixBrokenRequestBody(request, body) {
	return new RpcPromise$1(new PromiseStubHook(new Response(body).arrayBuffer().then((arrayBuffer) => {
		let bytes = new Uint8Array(arrayBuffer);
		let result = new Request(request, { body: bytes });
		return new PayloadStubHook(RpcPayload.fromAppReturn(result));
	})), []);
}
function streamToBlobPromise(stream, type) {
	return new RpcPromise$1(new PromiseStubHook(streamToBlob(stream, type).then((blob) => {
		return new PayloadStubHook(RpcPayload.fromAppReturn(blob));
	})), []);
}
var Evaluator = class Evaluator {
	importer;
	encodingLevel;
	callHandler;
	limits;
	constructor(importer, encodingLevel = "string", callHandler) {
		this.importer = importer;
		this.encodingLevel = encodingLevel;
		this.callHandler = callHandler;
		this.limits = importer.getLimits();
	}
	hooks = [];
	promises = [];
	evaluate(value) {
		return this.evaluateWithDepth(value, 0);
	}
	evaluateWithDepth(value, depth) {
		let payload = RpcPayload.forEvaluate(this.hooks, this.promises, this.callHandler);
		try {
			payload.value = this.evaluateImpl(value, payload, "value", depth);
			return payload;
		} catch (err) {
			payload.dispose();
			throw err;
		}
	}
	evaluateCopy(value) {
		return this.evaluate(structuredClone(value));
	}
	evaluateImpl(value, parent, property, depth) {
		let maxDepth = this.limits.maxDepth;
		if (depth >= maxDepth) throw new TypeError(`Deserialization exceeded maximum allowed message depth of ${maxDepth}.`);
		if (this.encodingLevel === "structuredClonable") {
			if (value instanceof Date || typeof value === "bigint") return value;
		}
		if (value instanceof Array) {
			if (value.length == 1 && value[0] instanceof Array) {
				let result = value[0];
				for (let i = 0; i < result.length; i++) result[i] = this.evaluateImpl(result[i], result, i, depth + 1);
				return result;
			} else switch (value[0]) {
				case "bigint":
					if (typeof value[1] == "string") {
						let digits = value[1];
						let maxBigIntDigits = this.limits.maxBigIntDigits;
						if (digits.length > maxBigIntDigits) throw new TypeError(`Deserialized bigint exceeds maximum length of ${maxBigIntDigits} digits.`);
						return BigInt(digits);
					}
					break;
				case "date":
					if (value[1] === null) return /* @__PURE__ */ new Date(NaN);
					if (typeof value[1] == "number") return new Date(value[1]);
					break;
				case "bytes": {
					let bytes;
					if (value[1] instanceof Uint8Array) bytes = value[1];
					else if (typeof value[1] == "string") if (typeof Buffer !== "undefined") bytes = Buffer.from(value[1], "base64");
					else if (Uint8Array.fromBase64) bytes = Uint8Array.fromBase64(value[1]);
					else {
						let bs = atob(value[1]);
						let len = bs.length;
						bytes = new Uint8Array(len);
						for (let i = 0; i < len; i++) bytes[i] = bs.charCodeAt(i);
					}
					else break;
					if (value.length === 2) return bytes;
					if (typeof value[2] !== "string") throw new TypeError(`Unknown bytes type marker type: ${typeof value[2]}`);
					if (!isValidByteContainerName(value[2])) {
						let marker = value[2].slice(0, 64);
						throw new TypeError(`Unknown bytes type marker: ${marker}`);
					}
					let marker = value[2];
					let elementSize = TYPED_ARRAY_ELEMENT_SIZE[marker];
					if (elementSize !== void 0 && bytes.byteLength % elementSize !== 0) throw new TypeError(`Invalid byte length ${bytes.byteLength} for ${marker}; expected a multiple of ${elementSize}`);
					let buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
					if (!NATIVE_LITTLE_ENDIAN && elementSize !== void 0) swapByteOrder(new Uint8Array(buffer), elementSize);
					switch (marker) {
						case "ArrayBuffer": return buffer;
						case "DataView": return new DataView(buffer);
						case "Int8Array": return new Int8Array(buffer);
						case "Uint8Array": return new Uint8Array(buffer);
						case "Uint8ClampedArray": return new Uint8ClampedArray(buffer);
						case "Int16Array": return new Int16Array(buffer);
						case "Uint16Array": return new Uint16Array(buffer);
						case "Int32Array": return new Int32Array(buffer);
						case "Uint32Array": return new Uint32Array(buffer);
						case "BigInt64Array": return new BigInt64Array(buffer);
						case "BigUint64Array": return new BigUint64Array(buffer);
						case "Float32Array": return new Float32Array(buffer);
						case "Float64Array": return new Float64Array(buffer);
					}
				}
				case "error":
					if (value.length >= 3 && typeof value[1] === "string" && typeof value[2] === "string") {
						let cls = ERROR_TYPES[value[1]] || Error;
						let result = cls === AggregateError ? new cls([], value[2]) : new cls(value[2]);
						if (typeof value[3] === "string") result.stack = value[3];
						if (value.length >= 5) {
							let props = value[4];
							if (!props || typeof props !== "object" || Array.isArray(props)) break;
							let anyResult = result;
							let propsObj = props;
							for (let key of Object.keys(propsObj)) {
								if (key === "name" || key === "message" || key === "stack") continue;
								if (key in Object.prototype || key === "toJSON") {
									this.evaluateImpl(propsObj[key], result, key, depth + 1);
									continue;
								}
								anyResult[key] = this.evaluateImpl(propsObj[key], result, key, depth + 1);
							}
						}
						return result;
					}
					break;
				case "undefined":
					if (value.length === 1) return;
					break;
				case "inf": return Infinity;
				case "-inf": return -Infinity;
				case "nan": return NaN;
				case "url":
					if (value.length === 2 && typeof value[1] === "string") return new URL(value[1]);
					break;
				case "headers":
					if (value.length === 2 && value[1] instanceof Array) return new Headers(value[1]);
					break;
				case "request": {
					if (value.length !== 3 || typeof value[1] !== "string") break;
					let url = value[1];
					let init = value[2];
					if (typeof init !== "object" || init === null) break;
					if (init.body) {
						init.body = this.evaluateImpl(init.body, init, "body", depth + 1);
						if (init.body === null || typeof init.body === "string" || init.body instanceof Uint8Array || init.body instanceof ReadableStream) {} else throw new TypeError("Request body must be of type ReadableStream.");
					}
					if (init.signal) {
						init.signal = this.evaluateImpl(init.signal, init, "signal", depth + 1);
						if (!(init.signal instanceof AbortSignal)) throw new TypeError("Request siganl must be of type AbortSignal.");
					}
					if (init.headers && !(init.headers instanceof Array)) throw new TypeError("Request headers must be serialized as an array of pairs.");
					let result = new Request(url, init);
					if (init.body instanceof ReadableStream && result.body === void 0) {
						let promise = fixBrokenRequestBody(result, init.body);
						this.promises.push({
							promise,
							parent,
							property
						});
						return promise;
					} else return result;
				}
				case "response": {
					if (value.length !== 3) break;
					let body = this.evaluateImpl(value[1], parent, property, depth + 1);
					if (body === null || typeof body === "string" || body instanceof Uint8Array || body instanceof ReadableStream) {} else throw new TypeError("Response body must be of type ReadableStream.");
					let init = value[2];
					if (typeof init !== "object" || init === null) break;
					if (init.headers && !(init.headers instanceof Array)) throw new TypeError("Request headers must be serialized as an array of pairs.");
					if (init.webSocket) {
						let ws = init.webSocket;
						let writable = ws.writable;
						if (body !== null || typeof ws !== "object" || !(writable instanceof Array) || writable.length !== 2 || writable[0] !== "writable" || typeof writable[1] !== "number") throw new TypeError("Invalid WebSocket upgrade Response.");
						let readable = this.evaluateImpl(ws.readable, ws, "readable", depth + 1);
						if (!(readable instanceof ReadableStream)) throw new TypeError("Invalid WebSocket upgrade Response.");
						let writableHook = this.importer.importStub(writable[1]);
						this.hooks.push(writableHook);
						delete init.webSocket;
						return makeUpgradeResponse(readable, writableHook, init);
					}
					return new Response(body, init);
				}
				case "blob": {
					if (value.length !== 3 || typeof value[1] !== "string") break;
					let contentType = value[1];
					let content = this.evaluateImpl(value[2], parent, property, depth + 1);
					if (!(content instanceof ReadableStream)) throw new TypeError("Blob content must be serialized as a ReadableStream.");
					let promise = streamToBlobPromise(content, contentType);
					this.promises.push({
						promise,
						parent,
						property
					});
					return promise;
				}
				case "import":
				case "pipeline": {
					if (value.length < 2 || value.length > 4) break;
					if (typeof value[1] != "number") break;
					let hook = this.importer.getExport(value[1]);
					if (!hook) throw new Error(`no such entry on exports table: ${value[1]}`);
					let isPromise = value[0] == "pipeline";
					let addStub = (hook) => {
						if (isPromise) {
							let promise = new RpcPromise$1(hook, []);
							this.promises.push({
								promise,
								parent,
								property
							});
							return promise;
						} else {
							this.hooks.push(hook);
							return new RpcPromise$1(hook, []);
						}
					};
					if (value.length == 2) if (isPromise) return addStub(hook.get([]));
					else return addStub(hook.dup());
					let path = value[2];
					if (!(path instanceof Array)) break;
					if (!path.every((part) => {
						return typeof part == "string" || typeof part == "number";
					})) break;
					if (value.length == 3) return addStub(hook.get(path));
					let args = value[3];
					if (!(args instanceof Array)) break;
					args = new Evaluator(this.importer, void 0, this.callHandler).evaluateWithDepth([args], depth);
					return addStub(hook.call(path, args));
				}
				case "remap": {
					if (value.length !== 5 || typeof value[1] !== "number" || !(value[2] instanceof Array) || !(value[3] instanceof Array) || !(value[4] instanceof Array)) break;
					let hook = this.importer.getExport(value[1]);
					if (!hook) throw new Error(`no such entry on exports table: ${value[1]}`);
					let path = value[2];
					if (!path.every((part) => {
						return typeof part == "string" || typeof part == "number";
					})) break;
					let captures = value[3].map((cap) => {
						if (!(cap instanceof Array) || cap.length !== 2 || cap[0] !== "import" && cap[0] !== "export" || typeof cap[1] !== "number") throw new TypeError(`unknown map capture: ${JSON.stringify(cap)}`);
						if (cap[0] === "export") return this.importer.importStub(cap[1]);
						else {
							let exp = this.importer.getExport(cap[1]);
							if (!exp) throw new Error(`no such entry on exports table: ${cap[1]}`);
							return exp.dup();
						}
					});
					let instructions = value[4];
					let promise = new RpcPromise$1(hook.map(path, captures, instructions), []);
					this.promises.push({
						promise,
						parent,
						property
					});
					return promise;
				}
				case "export":
				case "promise":
					if (typeof value[1] == "number") if (value[0] == "promise") {
						let promise = new RpcPromise$1(this.importer.importPromise(value[1]), []);
						this.promises.push({
							parent,
							property,
							promise
						});
						return promise;
					} else {
						let hook = this.importer.importStub(value[1]);
						this.hooks.push(hook);
						return new RpcStub$1(hook);
					}
					break;
				case "writable":
					if (typeof value[1] == "number") {
						let hook = this.importer.importStub(value[1]);
						let stream = streamImpl.createWritableStreamFromHook(hook);
						this.hooks.push(hook);
						return stream;
					}
					break;
				case "readable": if (typeof value[1] == "number") {
					let stream = this.importer.getPipeReadable(value[1]);
					let hook = streamImpl.createReadableStreamHook(stream);
					this.hooks.push(hook);
					return stream;
				}
			}
			throw new TypeError(`unknown special value: ${JSON.stringify(value)}`);
		} else if (value instanceof Object) {
			let result = value;
			for (let key in result) if (key in Object.prototype || key === "toJSON") {
				this.evaluateImpl(result[key], result, key, depth + 1);
				delete result[key];
			} else result[key] = this.evaluateImpl(result[key], result, key, depth + 1);
			return result;
		} else return value;
	}
};
const ESTIMATED_OBJECT_OVERHEAD = 16;
const ESTIMATED_ENTRY_OVERHEAD = 8;
const ESTIMATED_BINARY_OVERHEAD = 16;
const MAX_ESTIMATE_DEPTH = 64;
function estimateStringSize(value) {
	return 2 + value.length * 3;
}
function estimateEncodedSize(value, seen, depth = 0) {
	if (depth >= MAX_ESTIMATE_DEPTH) return ESTIMATED_ENTRY_OVERHEAD;
	switch (typeof value) {
		case "string": return estimateStringSize(value);
		case "number": return 16;
		case "bigint": return 16;
		case "boolean": return 8;
		case "undefined": return 16;
		case "object": {
			if (value === null) return 8;
			if (ArrayBuffer.isView(value)) return ESTIMATED_BINARY_OVERHEAD + value.byteLength;
			if (value instanceof ArrayBuffer) return ESTIMATED_BINARY_OVERHEAD + value.byteLength;
			if (typeof Blob !== "undefined" && value instanceof Blob) return ESTIMATED_BINARY_OVERHEAD + value.size;
			if (value instanceof Date) return 16;
			seen ??= /* @__PURE__ */ new WeakSet();
			if (seen.has(value)) return ESTIMATED_ENTRY_OVERHEAD;
			seen.add(value);
			if (value instanceof Array) {
				let size = ESTIMATED_OBJECT_OVERHEAD;
				for (let item of value) size += ESTIMATED_ENTRY_OVERHEAD + estimateEncodedSize(item, seen, depth + 1);
				return size;
			}
			if (value instanceof Error) {
				let size = ESTIMATED_OBJECT_OVERHEAD + estimateStringSize(value.name) + estimateStringSize(value.message) + estimateStringSize(value.stack ?? "");
				for (let key of Object.keys(value)) size += ESTIMATED_ENTRY_OVERHEAD + estimateStringSize(key) + estimateEncodedSize(value[key], seen, depth + 1);
				return size;
			}
			let size = ESTIMATED_OBJECT_OVERHEAD;
			for (let key of Object.keys(value)) size += ESTIMATED_ENTRY_OVERHEAD + estimateStringSize(key) + estimateEncodedSize(value[key], seen, depth + 1);
			return size;
		}
		default: return 16;
	}
}
var ImportTableEntry = class {
	session;
	importId;
	constructor(session, importId, pulling) {
		this.session = session;
		this.importId = importId;
		if (pulling) this.activePull = Promise.withResolvers();
	}
	localRefcount = 0;
	remoteRefcount = 1;
	activePull;
	resolution;
	onBrokenRegistrations;
	resolve(resolution) {
		if (this.localRefcount == 0) {
			resolution.dispose();
			return;
		}
		this.resolution = resolution;
		this.sendRelease();
		if (this.onBrokenRegistrations) {
			for (let i of this.onBrokenRegistrations) {
				let callback = this.session.onBrokenCallbacks[i];
				let endIndex = this.session.onBrokenCallbacks.length;
				resolution.onBroken(callback);
				if (this.session.onBrokenCallbacks[endIndex] === callback) delete this.session.onBrokenCallbacks[endIndex];
				else delete this.session.onBrokenCallbacks[i];
			}
			this.onBrokenRegistrations = void 0;
		}
		if (this.activePull) {
			this.activePull.resolve();
			this.activePull = void 0;
		}
	}
	async awaitResolution() {
		if (!this.activePull) {
			this.session.sendPull(this.importId);
			this.activePull = Promise.withResolvers();
		}
		await this.activePull.promise;
		return this.resolution.pull();
	}
	dispose() {
		if (this.resolution) this.resolution.dispose();
		else {
			this.abort(/* @__PURE__ */ new Error("RPC was canceled because the RpcPromise was disposed."));
			this.sendRelease();
		}
	}
	abort(error) {
		if (!this.resolution) {
			this.resolution = new ErrorStubHook(error);
			if (this.activePull) {
				this.activePull.reject(error);
				this.activePull = void 0;
			}
			this.onBrokenRegistrations = void 0;
		}
	}
	onBroken(callback) {
		if (this.resolution) this.resolution.onBroken(callback);
		else {
			let index = this.session.onBrokenCallbacks.length;
			this.session.onBrokenCallbacks.push(callback);
			if (!this.onBrokenRegistrations) this.onBrokenRegistrations = [];
			this.onBrokenRegistrations.push(index);
		}
	}
	sendRelease() {
		if (this.remoteRefcount > 0) {
			this.session.sendRelease(this.importId, this.remoteRefcount);
			this.remoteRefcount = 0;
		}
	}
};
var RpcImportHook = class RpcImportHook extends StubHook {
	isPromise;
	entry;
	constructor(isPromise, entry) {
		super();
		this.isPromise = isPromise;
		++entry.localRefcount;
		this.entry = entry;
	}
	collectPath(path) {
		return this;
	}
	getEntry() {
		if (this.entry) return this.entry;
		else throw new Error("This RpcImportHook was already disposed.");
	}
	getEntryTakingOwnership(disposeOwned) {
		try {
			return this.getEntry();
		} catch (err) {
			disposeOwned();
			throw err;
		}
	}
	call(path, args) {
		let entry = this.getEntryTakingOwnership(() => args.dispose());
		if (entry.resolution) return entry.resolution.call(path, args);
		else return entry.session.sendCall(entry.importId, path, args);
	}
	stream(path, args) {
		let entry = this.getEntryTakingOwnership(() => args.dispose());
		if (entry.resolution) return entry.resolution.stream(path, args);
		else return entry.session.sendStream(entry.importId, path, args);
	}
	map(path, captures, instructions) {
		let entry = this.getEntryTakingOwnership(() => {
			for (let cap of captures) cap.dispose();
		});
		if (entry.resolution) return entry.resolution.map(path, captures, instructions);
		else return entry.session.sendMap(entry.importId, path, captures, instructions);
	}
	get(path) {
		let entry = this.getEntry();
		if (entry.resolution) return entry.resolution.get(path);
		else return entry.session.sendCall(entry.importId, path);
	}
	dup() {
		return new RpcImportHook(false, this.getEntry());
	}
	pull() {
		let entry = this.getEntry();
		if (!this.isPromise) throw new Error("Can't pull this hook because it's not a promise hook.");
		if (entry.resolution) return entry.resolution.pull();
		return entry.awaitResolution();
	}
	ignoreUnhandledRejections() {}
	dispose() {
		let entry = this.entry;
		this.entry = void 0;
		if (entry) {
			if (--entry.localRefcount === 0) entry.dispose();
		}
	}
	onBroken(callback) {
		if (this.entry) this.entry.onBroken(callback);
	}
};
var RpcMainHook = class extends RpcImportHook {
	session;
	constructor(entry) {
		super(false, entry);
		this.session = entry.session;
	}
	dispose() {
		if (this.session) {
			let session = this.session;
			this.session = void 0;
			session.shutdown();
		}
	}
};
var RpcSessionImpl = class {
	transport;
	options;
	exports = [];
	reverseExports = /* @__PURE__ */ new Map();
	imports = [];
	abortReason;
	cancelReadLoop;
	nextExportId = -1;
	onBatchDone;
	pullCount = 0;
	onBrokenCallbacks = [];
	encodingLevel;
	limits;
	constructor(transport, mainHook, options) {
		this.transport = transport;
		this.options = options;
		let level = "string";
		if ("encodingLevel" in transport) {
			let raw = transport.encodingLevel;
			if (raw !== void 0) {
				if (raw !== "string" && raw !== "jsonCompatible" && raw !== "jsonCompatibleWithBytes" && raw !== "structuredClonable") throw new TypeError(`Unknown transport encodingLevel: ${String(raw)}`);
				level = raw;
			}
		}
		this.encodingLevel = level;
		this.limits = {
			...DEFAULT_LIMITS,
			...options.limits
		};
		this.exports.push({
			hook: mainHook,
			refcount: 1
		});
		this.imports.push(new ImportTableEntry(this, 0, false));
		this.readLoop().catch((err) => this.abort(err));
	}
	getMainImport() {
		return new RpcMainHook(this.imports[0]);
	}
	shutdown() {
		this.abort(/* @__PURE__ */ new Error("RPC session was shut down by disposing the main stub"), false);
	}
	exportStub(hook) {
		if (this.abortReason) throw this.abortReason;
		let existingExportId = this.reverseExports.get(hook);
		if (existingExportId !== void 0) {
			++this.exports[existingExportId].refcount;
			return existingExportId;
		} else {
			let exportId = this.nextExportId--;
			this.exports[exportId] = {
				hook,
				refcount: 1
			};
			this.reverseExports.set(hook, exportId);
			return exportId;
		}
	}
	exportPromise(hook) {
		if (this.abortReason) throw this.abortReason;
		let exportId = this.nextExportId--;
		this.exports[exportId] = {
			hook,
			refcount: 1
		};
		this.reverseExports.set(hook, exportId);
		this.ensureResolvingExport(exportId);
		return exportId;
	}
	unexport(ids) {
		for (let id of ids) this.releaseExport(id, 1);
	}
	releaseExport(exportId, refcount) {
		let entry = this.exports[exportId];
		if (!entry) throw new Error(`no such export ID: ${exportId}`);
		if (entry.refcount < refcount) throw new Error(`refcount would go negative: ${entry.refcount} < ${refcount}`);
		entry.refcount -= refcount;
		if (entry.refcount === 0) {
			delete this.exports[exportId];
			this.reverseExports.delete(entry.hook);
			entry.hook.dispose();
		}
	}
	onSendError(error) {
		if (this.options.onSendError) return this.options.onSendError(error);
	}
	ensureResolvingExport(exportId) {
		let exp = this.exports[exportId];
		if (!exp) throw new Error(`no such export ID: ${exportId}`);
		if (!exp.pull) {
			let resolve = async () => {
				let hook = exp.hook;
				for (;;) {
					let payload = await hook.pull();
					if (payload.value instanceof RpcStub$1) {
						let { hook: inner, pathIfPromise } = unwrapStubAndPath(payload.value);
						if (pathIfPromise && pathIfPromise.length == 0) {
							if (this.getImport(hook) === void 0) {
								hook = inner;
								continue;
							}
						}
					}
					return payload;
				}
			};
			let autoRelease = exp.autoRelease;
			++this.pullCount;
			exp.pull = resolve().then((payload) => {
				let value = Devaluator.devaluate(payload.value, void 0, this, payload, this.encodingLevel);
				this.send([
					"resolve",
					exportId,
					value
				]);
				if (autoRelease) this.releaseExport(exportId, 1);
			}, (error) => {
				this.send([
					"reject",
					exportId,
					Devaluator.devaluate(error, void 0, this, void 0, this.encodingLevel)
				]);
				if (autoRelease) this.releaseExport(exportId, 1);
			}).catch((error) => {
				try {
					this.send([
						"reject",
						exportId,
						Devaluator.devaluate(error, void 0, this, void 0, this.encodingLevel)
					]);
					if (autoRelease) this.releaseExport(exportId, 1);
				} catch (error2) {
					this.abort(error2);
				}
			}).finally(() => {
				if (--this.pullCount === 0) {
					if (this.onBatchDone) this.onBatchDone.resolve();
				}
			});
		}
	}
	getImport(hook) {
		if (hook instanceof RpcImportHook && hook.entry && hook.entry.session === this) return hook.entry.importId;
		else return;
	}
	importStub(idx) {
		if (this.abortReason) throw this.abortReason;
		let entry = this.imports[idx];
		if (!entry) {
			entry = new ImportTableEntry(this, idx, false);
			this.imports[idx] = entry;
		}
		return new RpcImportHook(false, entry);
	}
	importPromise(idx) {
		if (this.abortReason) throw this.abortReason;
		if (this.imports[idx]) return new ErrorStubHook(/* @__PURE__ */ new Error("Bug in RPC system: The peer sent a promise reusing an existing export ID."));
		let entry = new ImportTableEntry(this, idx, true);
		this.imports[idx] = entry;
		return new RpcImportHook(true, entry);
	}
	getExport(idx) {
		return this.exports[idx]?.hook;
	}
	getPipeReadable(exportId) {
		let entry = this.exports[exportId];
		if (!entry || !entry.pipeReadable) throw new Error(`Export ${exportId} is not a pipe or its readable end was already consumed.`);
		let readable = entry.pipeReadable;
		entry.pipeReadable = void 0;
		return readable;
	}
	getLimits() {
		return this.limits;
	}
	createPipe(readable, readableHook) {
		if (this.abortReason) throw this.abortReason;
		this.send(["pipe"]);
		let importId = this.imports.length;
		let entry = new ImportTableEntry(this, importId, false);
		this.imports.push(entry);
		let hook = new RpcImportHook(false, entry);
		let writable = streamImpl.createWritableStreamFromHook(hook);
		readable.pipeTo(writable).catch(() => {}).finally(() => readableHook.dispose());
		return importId;
	}
	send(msg) {
		if (this.abortReason !== void 0) return 0;
		if (this.encodingLevel === "string") {
			let msgText;
			try {
				msgText = JSON.stringify(msg);
			} catch (err) {
				try {
					this.abort(err);
				} catch (err2) {}
				throw err;
			}
			try {
				let sent = this.transport.send(msgText);
				if (sent !== void 0 && typeof sent.catch === "function") sent.catch((err) => this.abort(err, false));
			} catch (err) {
				queueMicrotask(() => this.abort(err, false));
			}
			return msgText.length;
		} else try {
			let size = this.transport.send(msg);
			if (typeof size === "number") return size;
			let thenable = size;
			if (thenable && typeof thenable.then === "function") Promise.resolve(thenable).catch((err) => this.abort(err, false));
			return;
		} catch (err) {
			queueMicrotask(() => this.abort(err, false));
			return;
		}
	}
	sendCall(id, path, args) {
		if (this.abortReason) {
			args?.dispose();
			throw this.abortReason;
		}
		let value = [
			"pipeline",
			id,
			path
		];
		if (args) {
			let devalue;
			try {
				devalue = Devaluator.devaluate(args.value, void 0, this, args, this.encodingLevel);
			} catch (err) {
				args.dispose();
				throw err;
			}
			value.push(devalue[0]);
		}
		this.send(["push", value]);
		let entry = new ImportTableEntry(this, this.imports.length, false);
		this.imports.push(entry);
		return new RpcImportHook(true, entry);
	}
	sendStream(id, path, args) {
		if (this.abortReason) {
			args.dispose();
			throw this.abortReason;
		}
		let value = [
			"pipeline",
			id,
			path
		];
		let devalue;
		try {
			devalue = Devaluator.devaluate(args.value, void 0, this, args, this.encodingLevel);
		} catch (err) {
			args.dispose();
			throw err;
		}
		value.push(devalue[0]);
		let msg = ["stream", value];
		let size = this.send(msg);
		if (size === void 0) size = estimateEncodedSize(msg);
		let importId = this.imports.length;
		let entry = new ImportTableEntry(this, importId, true);
		entry.remoteRefcount = 0;
		entry.localRefcount = 1;
		this.imports.push(entry);
		return {
			promise: entry.awaitResolution().then((p) => {
				p.dispose();
				delete this.imports[importId];
			}, (err) => {
				delete this.imports[importId];
				throw err;
			}),
			size
		};
	}
	sendMap(id, path, captures, instructions) {
		if (this.abortReason) {
			for (let cap of captures) cap.dispose();
			throw this.abortReason;
		}
		let value = [
			"remap",
			id,
			path,
			captures.map((hook) => {
				let importId = this.getImport(hook);
				if (importId !== void 0) return ["import", importId];
				else return ["export", this.exportStub(hook)];
			}),
			instructions
		];
		this.send(["push", value]);
		let entry = new ImportTableEntry(this, this.imports.length, false);
		this.imports.push(entry);
		return new RpcImportHook(true, entry);
	}
	sendPull(id) {
		if (this.abortReason) throw this.abortReason;
		this.send(["pull", id]);
	}
	sendRelease(id, remoteRefcount) {
		if (this.abortReason) return;
		this.send([
			"release",
			id,
			remoteRefcount
		]);
		delete this.imports[id];
	}
	abort(error, trySendAbortMessage = true) {
		if (this.abortReason !== void 0) return;
		this.cancelReadLoop?.(error);
		this.cancelReadLoop = void 0;
		if (trySendAbortMessage) try {
			let abortMsg = ["abort", Devaluator.devaluate(error, void 0, this, void 0, this.encodingLevel)];
			if (this.encodingLevel === "string") {
				let sent = this.transport.send(JSON.stringify(abortMsg));
				if (sent !== void 0 && typeof sent.catch === "function") sent.catch((err) => {});
			} else {
				let result = this.transport.send(abortMsg);
				if (result && typeof result.then === "function") Promise.resolve(result).catch((err) => {});
			}
		} catch (err) {}
		if (error === void 0) error = "undefined";
		this.abortReason = error;
		if (this.onBatchDone) this.onBatchDone.reject(error);
		if (this.transport.abort) try {
			this.transport.abort(error);
		} catch (err) {
			Promise.resolve(err);
		}
		for (let i in this.onBrokenCallbacks) try {
			this.onBrokenCallbacks[i](error);
		} catch (err) {
			Promise.resolve(err);
		}
		for (let i in this.imports) this.imports[i].abort(error);
		for (let i in this.exports) this.exports[i].hook.dispose();
	}
	async readLoop() {
		while (!this.abortReason) {
			let readCanceled = Promise.withResolvers();
			this.cancelReadLoop = readCanceled.reject;
			let raw;
			try {
				raw = await Promise.race([this.transport.receive(), readCanceled.promise]);
			} finally {
				if (this.cancelReadLoop === readCanceled.reject) this.cancelReadLoop = void 0;
			}
			if (this.encodingLevel === "string" && raw.length > this.limits.maxMessageSize) throw new TypeError(`Incoming message exceeds maximum size of ${this.limits.maxMessageSize} UTF-16 code units.`);
			if (this.abortReason) break;
			let msg = this.encodingLevel === "string" ? JSON.parse(raw) : raw;
			if (msg instanceof Array) switch (msg[0]) {
				case "push":
					if (msg.length > 1) {
						let hook = new PayloadStubHook(new Evaluator(this, this.encodingLevel, this.options.onCall).evaluate(msg[1]));
						hook.ignoreUnhandledRejections();
						this.exports.push({
							hook,
							refcount: 1
						});
						continue;
					}
					break;
				case "stream":
					if (msg.length > 1) {
						let hook = new PayloadStubHook(new Evaluator(this, this.encodingLevel, this.options.onCall).evaluate(msg[1]));
						hook.ignoreUnhandledRejections();
						let exportId = this.exports.length;
						this.exports.push({
							hook,
							refcount: 1,
							autoRelease: true
						});
						this.ensureResolvingExport(exportId);
						continue;
					}
					break;
				case "pipe": {
					let { readable, writable } = new TransformStream();
					let hook = streamImpl.createWritableStreamHook(writable);
					this.exports.push({
						hook,
						refcount: 1,
						pipeReadable: readable
					});
					continue;
				}
				case "pull": {
					let exportId = msg[1];
					if (typeof exportId == "number") {
						this.ensureResolvingExport(exportId);
						continue;
					}
					break;
				}
				case "resolve":
				case "reject": {
					let importId = msg[1];
					if (typeof importId == "number" && msg.length > 2) {
						let imp = this.imports[importId];
						if (imp) if (msg[0] == "resolve") imp.resolve(new PayloadStubHook(new Evaluator(this, this.encodingLevel).evaluate(msg[2])));
						else {
							let payload = new Evaluator(this, this.encodingLevel).evaluate(msg[2]);
							payload.dispose();
							imp.resolve(new ErrorStubHook(payload.value));
						}
						else if (msg[0] == "resolve") new Evaluator(this, this.encodingLevel).evaluate(msg[2]).dispose();
						continue;
					}
					break;
				}
				case "release": {
					let exportId = msg[1];
					let refcount = msg[2];
					if (typeof exportId == "number" && typeof refcount == "number") {
						this.releaseExport(exportId, refcount);
						continue;
					}
					break;
				}
				case "abort": {
					let payload = new Evaluator(this, this.encodingLevel).evaluate(msg[1]);
					payload.dispose();
					this.abort(payload.value, false);
					break;
				}
			}
			throw new Error(`bad RPC message: ${JSON.stringify(msg)}`);
		}
	}
	async drain() {
		if (this.abortReason) throw this.abortReason;
		if (this.pullCount > 0) {
			let { promise, resolve, reject } = Promise.withResolvers();
			this.onBatchDone = {
				resolve,
				reject
			};
			await promise;
		}
	}
	getStats() {
		let result = {
			imports: 0,
			exports: 0
		};
		for (let i in this.imports) ++result.imports;
		for (let i in this.exports) ++result.exports;
		return result;
	}
};
var RpcSession$1 = class {
	#session;
	#mainStub;
	constructor(transport, localMain, options = {}) {
		let mainHook;
		if (localMain) mainHook = new PayloadStubHook(RpcPayload.fromAppReturn(localMain));
		else mainHook = new ErrorStubHook(/* @__PURE__ */ new Error("This connection has no main object."));
		this.#session = new RpcSessionImpl(transport, mainHook, options);
		this.#mainStub = new RpcStub$1(this.#session.getMainImport());
	}
	getRemoteMain() {
		return this.#mainStub;
	}
	getStats() {
		return this.#session.getStats();
	}
	drain() {
		return this.#session.drain();
	}
};
function newWebSocketRpcSession$1(webSocket, localMain, options) {
	if (typeof webSocket === "string") webSocket = new WebSocket(webSocket);
	return new RpcSession$1(new WebSocketTransport(webSocket), localMain, options).getRemoteMain();
}
/**
* Generic WebSocket transport. Default `T = string` is backward-compatible and satisfies
* `RpcTransport`. Use `T = ArrayBuffer` as a building block for binary transports.
*/
var WebSocketTransport = class {
	constructor(webSocket) {
		this.#webSocket = webSocket;
		webSocket.binaryType = "arraybuffer";
		if (webSocket.readyState === WebSocket.CONNECTING) {
			this.#sendQueue = [];
			webSocket.addEventListener("open", (event) => {
				try {
					for (let message of this.#sendQueue) webSocket.send(message);
				} catch (err) {
					this.#receivedError(err);
				}
				this.#sendQueue = void 0;
			});
		}
		webSocket.addEventListener("message", (event) => {
			if (this.#error) {} else if (typeof event.data === "string" || event.data instanceof ArrayBuffer) if (this.#receiveResolver) {
				this.#receiveResolver(event.data);
				this.#receiveResolver = void 0;
				this.#receiveRejecter = void 0;
			} else this.#receiveQueue.push(event.data);
			else this.#receivedError(/* @__PURE__ */ new TypeError("Received unexpected message type from WebSocket."));
		});
		webSocket.addEventListener("close", (event) => {
			this.#receivedError(/* @__PURE__ */ new Error(`Peer closed WebSocket: ${event.code} ${event.reason}`));
		});
		webSocket.addEventListener("error", (event) => {
			this.#receivedError(/* @__PURE__ */ new Error(`WebSocket connection failed.`));
		});
	}
	#webSocket;
	#sendQueue;
	#receiveResolver;
	#receiveRejecter;
	#receiveQueue = [];
	#error;
	send(message) {
		if (this.#sendQueue === void 0) this.#webSocket.send(message);
		else this.#sendQueue.push(message);
	}
	receive() {
		if (this.#receiveQueue.length > 0) return Promise.resolve(this.#receiveQueue.shift());
		else if (this.#error) return Promise.reject(this.#error);
		else return new Promise((resolve, reject) => {
			this.#receiveResolver = resolve;
			this.#receiveRejecter = reject;
		});
	}
	abort(reason) {
		let message;
		if (reason instanceof Error) message = reason.message;
		else message = `${reason}`;
		let reasonBytes = new TextEncoder().encode(message);
		if (reasonBytes.length > 123) message = new TextDecoder().decode(reasonBytes.subarray(0, 123), { stream: true });
		this.#webSocket.close(3e3, message);
		if (!this.#error) this.#error = reason;
	}
	#receivedError(reason) {
		if (!this.#error) {
			this.#error = reason;
			if (this.#receiveRejecter) {
				this.#receiveRejecter(reason);
				this.#receiveResolver = void 0;
				this.#receiveRejecter = void 0;
			}
		}
	}
};
let currentMapBuilder;
var MapBuilder = class {
	context;
	captureMap = /* @__PURE__ */ new Map();
	instructions = [];
	constructor(subject, path) {
		if (currentMapBuilder) this.context = {
			parent: currentMapBuilder,
			captures: [],
			subject: currentMapBuilder.capture(subject),
			path
		};
		else this.context = {
			parent: void 0,
			captures: [],
			subject,
			path
		};
		currentMapBuilder = this;
	}
	unregister() {
		currentMapBuilder = this.context.parent;
	}
	makeInput() {
		return new MapVariableHook(this, 0);
	}
	makeOutput(result) {
		let devalued;
		try {
			devalued = Devaluator.devaluate(result.value, void 0, this, result);
		} finally {
			result.dispose();
		}
		this.instructions.push(devalued);
		if (this.context.parent) {
			this.context.parent.instructions.push([
				"remap",
				this.context.subject,
				this.context.path,
				this.context.captures.map((cap) => ["import", cap]),
				this.instructions
			]);
			return new MapVariableHook(this.context.parent, this.context.parent.instructions.length);
		} else return this.context.subject.map(this.context.path, this.context.captures, this.instructions);
	}
	pushCall(hook, path, params) {
		let devalued = Devaluator.devaluate(params.value, void 0, this, params);
		devalued = devalued[0];
		let subject = this.capture(hook.dup());
		this.instructions.push([
			"pipeline",
			subject,
			path,
			devalued
		]);
		return new MapVariableHook(this, this.instructions.length);
	}
	pushGet(hook, path) {
		let subject = this.capture(hook.dup());
		this.instructions.push([
			"pipeline",
			subject,
			path
		]);
		return new MapVariableHook(this, this.instructions.length);
	}
	capture(hook) {
		if (hook instanceof MapVariableHook && hook.mapper === this) return hook.idx;
		let result = this.captureMap.get(hook);
		if (result === void 0) {
			if (this.context.parent) {
				let parentIdx = this.context.parent.capture(hook);
				this.context.captures.push(parentIdx);
			} else this.context.captures.push(hook);
			result = -this.context.captures.length;
			this.captureMap.set(hook, result);
		}
		return result;
	}
	exportStub(hook) {
		throw new Error("Can't construct an RpcTarget or RPC callback inside a mapper function. Try creating a new RpcStub outside the callback first, then using it inside the callback.");
	}
	exportPromise(hook) {
		return this.exportStub(hook);
	}
	getImport(hook) {
		return this.capture(hook);
	}
	unexport(ids) {}
	createPipe(readable) {
		throw new Error("Cannot send ReadableStream inside a mapper function.");
	}
	onSendError(error) {}
};
mapImpl.sendMap = (hook, path, func) => {
	let builder = new MapBuilder(hook, path);
	let result;
	try {
		result = RpcPayload.fromAppReturn(withCallInterceptor(builder.pushCall.bind(builder), () => {
			return func(new RpcPromise$1(builder.makeInput(), []));
		}));
	} finally {
		builder.unregister();
	}
	if (result instanceof Promise) {
		result.catch((err) => {});
		throw new Error("RPC map() callbacks cannot be async.");
	}
	return new RpcPromise$1(builder.makeOutput(result), []);
};
function throwMapperBuilderUseError() {
	throw new Error("Attempted to use an abstract placeholder from a mapper function. Please make sure your map function has no side effects.");
}
var MapVariableHook = class extends StubHook {
	mapper;
	idx;
	constructor(mapper, idx) {
		super();
		this.mapper = mapper;
		this.idx = idx;
	}
	dup() {
		return this;
	}
	dispose() {}
	get(path) {
		if (path.length == 0) return this;
		else if (currentMapBuilder) return currentMapBuilder.pushGet(this, path);
		else throwMapperBuilderUseError();
	}
	call(path, args) {
		args.dispose();
		throwMapperBuilderUseError();
	}
	map(path, captures, instructions) {
		for (let cap of captures) cap.dispose();
		throwMapperBuilderUseError();
	}
	pull() {
		throwMapperBuilderUseError();
	}
	ignoreUnhandledRejections() {}
	onBroken(callback) {
		throwMapperBuilderUseError();
	}
};
var MapApplicator = class {
	captures;
	variables;
	constructor(captures, input) {
		this.captures = captures;
		this.variables = [input];
	}
	dispose() {
		for (let variable of this.variables) variable.dispose();
	}
	apply(instructions) {
		try {
			if (instructions.length < 1) throw new Error("Invalid empty mapper function.");
			for (let instruction of instructions.slice(0, -1)) {
				let payload = new Evaluator(this).evaluateCopy(instruction);
				if (payload.value instanceof RpcStub$1) {
					let hook = unwrapStubNoProperties(payload.value);
					if (hook) {
						this.variables.push(hook);
						continue;
					}
				}
				this.variables.push(new PayloadStubHook(payload));
			}
			return new Evaluator(this).evaluateCopy(instructions[instructions.length - 1]);
		} finally {
			for (let variable of this.variables) variable.dispose();
		}
	}
	importStub(idx) {
		throw new Error("A mapper function cannot refer to exports.");
	}
	importPromise(idx) {
		return this.importStub(idx);
	}
	getExport(idx) {
		if (idx < 0) return this.captures[-idx - 1];
		else return this.variables[idx];
	}
	getPipeReadable(exportId) {
		throw new Error("A mapper function cannot use pipe readables.");
	}
	getLimits() {
		return DEFAULT_LIMITS;
	}
};
function applyMapToElement(input, parent, owner, captures, instructions) {
	let mapper = new MapApplicator(captures, new PayloadStubHook(RpcPayload.deepCopyFrom(input, parent, owner)));
	try {
		return mapper.apply(instructions);
	} finally {
		mapper.dispose();
	}
}
mapImpl.applyMap = (input, parent, owner, captures, instructions) => {
	try {
		let result;
		if (input instanceof RpcPromise$1) throw new Error("applyMap() can't be called on RpcPromise");
		else if (input instanceof Array) {
			let payloads = [];
			try {
				for (let elem of input) payloads.push(applyMapToElement(elem, input, owner, captures, instructions));
			} catch (err) {
				for (let payload of payloads) payload.dispose();
				throw err;
			}
			result = RpcPayload.fromArray(payloads);
		} else if (input === null || input === void 0) result = RpcPayload.fromAppReturn(input);
		else result = applyMapToElement(input, parent, owner, captures, instructions);
		return new PayloadStubHook(result);
	} finally {
		for (let cap of captures) cap.dispose();
	}
};
var WritableStreamStubHook = class WritableStreamStubHook extends StubHook {
	state;
	static create(stream) {
		return new WritableStreamStubHook({
			refcount: 1,
			writer: stream.getWriter(),
			closed: false
		});
	}
	constructor(state, dupFrom) {
		super();
		this.state = state;
		if (dupFrom) ++state.refcount;
	}
	getState() {
		if (this.state) return this.state;
		else throw new Error("Attempted to use a WritableStreamStubHook after it was disposed.");
	}
	call(path, args) {
		try {
			let state = this.getState();
			if (path.length !== 1 || typeof path[0] !== "string") throw new Error("WritableStream stub only supports direct method calls");
			const method = path[0];
			if (method !== "write" && method !== "close" && method !== "abort") throw new Error(`Unknown WritableStream method: ${method}`);
			if (method === "close" || method === "abort") state.closed = true;
			return new PromiseStubHook((method === "write" ? args.deliverStreamWrite(state.writer) : args.deliverCall(state.writer[method], state.writer)).then((payload) => new PayloadStubHook(payload)));
		} catch (err) {
			args.dispose();
			return new ErrorStubHook(err);
		}
	}
	map(path, captures, instructions) {
		for (let cap of captures) cap.dispose();
		return new ErrorStubHook(/* @__PURE__ */ new Error("Cannot use map() on a WritableStream"));
	}
	get(path) {
		return new ErrorStubHook(/* @__PURE__ */ new Error("Cannot access properties on a WritableStream stub"));
	}
	dup() {
		return new WritableStreamStubHook(this.getState(), this);
	}
	pull() {
		return Promise.reject(/* @__PURE__ */ new Error("Cannot pull a WritableStream stub"));
	}
	ignoreUnhandledRejections() {}
	dispose() {
		let state = this.state;
		this.state = void 0;
		if (state) {
			if (--state.refcount === 0) {
				if (!state.closed) state.writer.abort(/* @__PURE__ */ new Error("WritableStream RPC stub was disposed without calling close()")).catch(() => {});
				state.writer.releaseLock();
			}
		}
	}
	onBroken(callback) {}
};
const INITIAL_WINDOW = 262144;
const MAX_WINDOW = 1073741824;
const MIN_WINDOW = 65536;
const STARTUP_GROWTH_FACTOR = 2;
const STEADY_GROWTH_FACTOR = 1.25;
const DECAY_FACTOR = .9;
const STARTUP_EXIT_ROUNDS = 3;
var FlowController = class {
	now;
	window = INITIAL_WINDOW;
	bytesInFlight = 0;
	inStartupPhase = true;
	delivered = 0;
	deliveredTime = 0;
	firstAckTime = 0;
	firstAckDelivered = 0;
	minRtt = Infinity;
	roundsWithoutIncrease = 0;
	lastRoundWindow = 0;
	roundStartTime = 0;
	constructor(now) {
		this.now = now;
	}
	onSend(size) {
		this.bytesInFlight += size;
		let token = {
			sentTime: this.now(),
			size,
			deliveredAtSend: this.delivered,
			deliveredTimeAtSend: this.deliveredTime,
			windowAtSend: this.window,
			windowFullAtSend: this.bytesInFlight >= this.window
		};
		return {
			token,
			shouldBlock: token.windowFullAtSend
		};
	}
	onError(token) {
		this.bytesInFlight -= token.size;
	}
	onAck(token) {
		let ackTime = this.now();
		this.delivered += token.size;
		this.deliveredTime = ackTime;
		this.bytesInFlight -= token.size;
		let rtt = ackTime - token.sentTime;
		if (rtt <= 0) return this.bytesInFlight < this.window;
		this.minRtt = Math.min(this.minRtt, rtt);
		if (this.firstAckTime === 0) {
			this.firstAckTime = ackTime;
			this.firstAckDelivered = this.delivered;
		} else {
			let baseTime;
			let baseDelivered;
			if (token.deliveredTimeAtSend === 0) {
				baseTime = this.firstAckTime;
				baseDelivered = this.firstAckDelivered;
			} else {
				baseTime = token.deliveredTimeAtSend;
				baseDelivered = token.deliveredAtSend;
			}
			let interval = ackTime - baseTime;
			let bandwidth = (this.delivered - baseDelivered) / interval;
			let growthFactor = this.inStartupPhase ? STARTUP_GROWTH_FACTOR : STEADY_GROWTH_FACTOR;
			let newWindow = bandwidth * this.minRtt * growthFactor;
			newWindow = Math.min(newWindow, token.windowAtSend * growthFactor);
			if (token.windowFullAtSend) newWindow = Math.max(newWindow, token.windowAtSend * DECAY_FACTOR);
			else newWindow = Math.max(newWindow, this.window);
			this.window = Math.max(Math.min(newWindow, MAX_WINDOW), MIN_WINDOW);
			if (this.inStartupPhase && token.sentTime >= this.roundStartTime) {
				if (this.window > this.lastRoundWindow * STEADY_GROWTH_FACTOR) this.roundsWithoutIncrease = 0;
				else if (++this.roundsWithoutIncrease >= STARTUP_EXIT_ROUNDS) this.inStartupPhase = false;
				this.roundStartTime = ackTime;
				this.lastRoundWindow = this.window;
			}
		}
		return this.bytesInFlight < this.window;
	}
};
function createWritableStreamFromHook(hook) {
	let pendingError = void 0;
	let hookDisposed = false;
	let fc = new FlowController(() => performance.now());
	let windowResolve;
	let windowReject;
	const disposeHook = () => {
		if (!hookDisposed) {
			hookDisposed = true;
			hook.dispose();
		}
	};
	return new WritableStream({
		write(chunk, controller) {
			if (pendingError !== void 0) throw pendingError;
			const payload = RpcPayload.fromAppParams([chunk]);
			const { promise, size } = hook.stream(["write"], payload);
			if (size === void 0) return promise.catch((err) => {
				if (pendingError === void 0) pendingError = err;
				throw err;
			});
			else {
				let { token, shouldBlock } = fc.onSend(size);
				promise.then(() => {
					if (fc.onAck(token) && windowResolve) {
						windowResolve();
						windowResolve = void 0;
						windowReject = void 0;
					}
				}, (err) => {
					fc.onError(token);
					if (pendingError === void 0) {
						pendingError = err;
						controller.error(err);
						disposeHook();
					}
					if (windowReject) {
						windowReject(err);
						windowResolve = void 0;
						windowReject = void 0;
					}
				});
				if (shouldBlock) return new Promise((resolve, reject) => {
					windowResolve = resolve;
					windowReject = reject;
				});
			}
		},
		async close() {
			if (pendingError !== void 0) {
				disposeHook();
				throw pendingError;
			}
			const { promise } = hook.stream(["close"], RpcPayload.fromAppParams([]));
			try {
				await promise;
			} catch (err) {
				throw pendingError ?? err;
			} finally {
				disposeHook();
			}
		},
		abort(reason) {
			if (pendingError !== void 0) return;
			pendingError = reason ?? /* @__PURE__ */ new Error("WritableStream was aborted");
			if (windowReject) {
				windowReject(pendingError);
				windowResolve = void 0;
				windowReject = void 0;
			}
			const { promise } = hook.stream(["abort"], RpcPayload.fromAppParams([reason]));
			promise.then(() => disposeHook(), () => disposeHook());
		}
	});
}
var ReadableStreamStubHook = class ReadableStreamStubHook extends StubHook {
	state;
	static create(stream) {
		return new ReadableStreamStubHook({
			refcount: 1,
			stream,
			canceled: false
		});
	}
	constructor(state, dupFrom) {
		super();
		this.state = state;
		if (dupFrom) ++state.refcount;
	}
	call(path, args) {
		args.dispose();
		return new ErrorStubHook(/* @__PURE__ */ new Error("Cannot call methods on a ReadableStream stub"));
	}
	map(path, captures, instructions) {
		for (let cap of captures) cap.dispose();
		return new ErrorStubHook(/* @__PURE__ */ new Error("Cannot use map() on a ReadableStream"));
	}
	get(path) {
		return new ErrorStubHook(/* @__PURE__ */ new Error("Cannot access properties on a ReadableStream stub"));
	}
	dup() {
		let state = this.state;
		if (!state) throw new Error("Attempted to dup a ReadableStreamStubHook after it was disposed.");
		return new ReadableStreamStubHook(state, this);
	}
	pull() {
		return Promise.reject(/* @__PURE__ */ new Error("Cannot pull a ReadableStream stub"));
	}
	ignoreUnhandledRejections() {}
	dispose() {
		let state = this.state;
		this.state = void 0;
		if (state) {
			if (--state.refcount === 0) {
				if (!state.canceled) {
					state.canceled = true;
					if (!state.stream.locked) state.stream.cancel(/* @__PURE__ */ new Error("ReadableStream RPC stub was disposed without being consumed")).catch(() => {});
				}
			}
		}
	}
	onBroken(callback) {}
};
streamImpl.createWritableStreamHook = WritableStreamStubHook.create;
streamImpl.createWritableStreamFromHook = createWritableStreamFromHook;
streamImpl.createReadableStreamHook = ReadableStreamStubHook.create;
/**
* Start a WebSocket session given either an already-open WebSocket or a URL.
*
* @param webSocket Either the `wss://` URL to connect to, or an already-open WebSocket object to
* use.
* @param localMain The main RPC interface to expose to the peer. Returns a stub for the main
* interface exposed from the peer.
*/
let newWebSocketRpcSession = newWebSocketRpcSession$1;
//#endregion
//#region ../../core/lib/src/client/socket.ts
/** Open a WebSocket, trying again for a while when the connection fails: a phone waking up, a
*  tunnel flapping, a cold edge — the things a first attempt trips over. Resolves with the socket
*  once it is OPEN; rejects with the last failure after the last attempt. The delays are the
*  waits BETWEEN attempts (the first is immediate).
*
*  Every failed attempt is explained, never swallowed (docs/engineering-invariants.md): the error
*  names the close code and reason the socket closed with before it opened, and each attempt that
*  is tried again logs a `client.platform-failure-socket-open` warn first. The upgrade's HTTP status
*  is not among them: the WebSocket API never exposes the handshake's response (a refused upgrade
*  is a close 1006, by design — https://websockets.spec.whatwg.org/#feedback-from-the-protocol),
*  so a non-standard `ErrorEvent.error` (Node's undici names "non-101 status code" there) is added
*  when the runtime gives one. */
const RETRY_DELAYS_MS = [
	250,
	500,
	1e3,
	2e3,
	4e3,
	8e3
];
/** How long one attempt may take to open. A handshake that neither opens nor closes is a failed
*  attempt too, closed and tried again like any other: without a bound the page waits on it for as
*  long as the browser does, behind a spinner that never ends (a Dash spec sat 30 s after its
*  sign-in's `POST /api` answered, with no `/api` upgrade ever reaching the Worker, 2026-09-24).
*  A healthy upgrade opens in well under a second. */
const HANDSHAKE_TIMEOUT_MS = 1e4;
function openSocketWithRetry(url, options = {}) {
	const delays = options.delaysMs || RETRY_DELAYS_MS;
	const handshakeTimeoutMs = options.handshakeTimeoutMs ?? HANDSHAKE_TIMEOUT_MS;
	const Socket = options.WebSocket || WebSocket;
	const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
	const once = () => new Promise((resolve, reject) => {
		const socket = new Socket(url);
		let cause = "";
		const timeout = setTimeout(() => {
			settle();
			socket.close();
			reject(/* @__PURE__ */ new Error(`WebSocket did not open in ${handshakeTimeoutMs} ms`));
		}, handshakeTimeoutMs);
		function settle() {
			clearTimeout(timeout);
			socket.removeEventListener("open", opened);
			socket.removeEventListener("close", failed);
			socket.removeEventListener("error", errored);
		}
		function errored(event) {
			const error = event.error;
			if (error instanceof Error) cause = ` (${error.message})`;
		}
		function opened() {
			settle();
			resolve(socket);
		}
		function failed(event) {
			settle();
			reject(/* @__PURE__ */ new Error(`WebSocket connection failed: closed ${event.code}${event.reason ? ` "${event.reason}"` : ""} before it opened${cause}`));
		}
		socket.addEventListener("open", opened, { once: true });
		socket.addEventListener("error", errored);
		socket.addEventListener("close", failed, { once: true });
	});
	return (async () => {
		for (let attempt = 1;; attempt++) try {
			return await once();
		} catch (error) {
			const delay = delays[attempt - 1];
			if (delay === void 0) throw error;
			console.warn({
				event: "client.platform-failure-socket-open",
				url: String(url),
				attempt,
				attempts: delays.length + 1,
				retryInMs: delay,
				message: error.message
			});
			await sleep(delay);
		}
	})();
}
//#endregion
//#region ../../core/lib/src/oauth-scopes.ts
/** The platform's OAuth scopes — what an app may ask for and what a consent grants:
*   - `iterate`             — reach the projects the person grants (every app; implied, always granted)
*   - `account`             — manage the person's sessions and personal access tokens
*   - `organizations:write` — the person's organizations: list every one they belong to, create new ones
*   - `admin`               — operate the platform: every project and person. Granted only to an
*                             email the deployment's `admins` lists (core/os consent.ts), and only
*                             while it lists it (oauth.ts). Signing a client in as someone else is
*                             no scope: the issuer offers it to a listed admin at consent
*  Consent is task-based (the shape Cloudflare's own OAuth consent took in August 2026: a client
*  requests a set, the person may deselect the optional ones, the token carries what was granted):
*  `iterate` is required, every other requested scope is optional on the consent page, and an app
*  reads the granted set from `session.info().scopes` rather than assuming its request. */
const OAuthScope = _enum([
	"iterate",
	"account",
	"organizations:write",
	"admin"
]);
const OAuthScopes = array(OAuthScope).transform((scopes) => [.../* @__PURE__ */ new Set(["iterate", ...scopes])]);
//#endregion
//#region ../../core/lib/src/app.ts
/** The browser leaves for the issuer's login (a document navigation) and this never settles — no
*  framework in the loop: a TanStack `beforeLoad` awaiting it ends the way a thrown
*  `redirect({ reloadDocument: true })` did, a plain page simply navigates. */
function leaveForLogin(login) {
	window.location.assign(login);
	return new Promise(() => {});
}
function connectionOn(socket) {
	const iterate = newWebSocketRpcSession(socket);
	return {
		api: iterate.authenticate({ type: "from-server-cookie" }),
		socket,
		dispose: () => iterate[Symbol.dispose]()
	};
}
/** Create once per app — a TanStack route's client-only `beforeLoad`, or a plain page's entry.
*  Every loader and action of the page shares the returned public RPC session.
*
*  Connecting tries for a while (client/socket.ts: ≈16 s of attempts) before an error reaches the
*  page — a phone waking up or a flapping tunnel is not a reason to show "connection failed". And
*  the `api` the page holds is a proxy to the CURRENT connection: when the socket closes, the next
*  call opens a fresh one and pipelines onto it, so a dropped connection costs a reconnect, not the
*  page. A reconnect the platform refuses (the session ended elsewhere) rejects that call; the
*  page's retry runs `authenticate` again — a fresh one, the socket's close forgot the last — whose
*  probe sends the browser to log in. */
function createIterateClient(options = {}) {
	const scopes = OAuthScopes.parse(options.scopes || []);
	let live = null;
	let connecting;
	const socketUrl = () => {
		const url = new URL("/api", window.location.href);
		url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
		return url;
	};
	/** Adopt a connection as the live one until its socket closes. A close also forgets the settled
	*  `authenticate` — the next one probes `/api` again, so a session that ended elsewhere sends the
	*  browser to log in instead of a retry that can only fail. */
	function adopt(socket) {
		const connection = connectionOn(socket);
		live = connection;
		const forget = () => {
			if (live !== connection) return;
			live = null;
			connecting = void 0;
		};
		const dispose = () => {
			forget();
			connection.dispose();
		};
		socket.addEventListener("close", () => {
			forget();
			window.removeEventListener("pagehide", dispose);
		}, { once: true });
		window.addEventListener("pagehide", dispose, { once: true });
		return connection;
	}
	const api = new Proxy({}, { get(_target, property) {
		const connection = live || adopt(new WebSocket(socketUrl()));
		return Reflect.get(connection.api, property);
	} });
	const loginUrl = (params) => `/.auth/login?${new URLSearchParams({
		scope: scopes.join(" "),
		...params
	})}`;
	async function connect(next) {
		const login = loginUrl({ next });
		const probe = await fetch("/api", {
			method: "POST",
			body: "",
			signal: AbortSignal.timeout(1e4)
		});
		await probe.body?.cancel();
		if (probe.status === 401) return leaveForLogin(login);
		if (!probe.ok) throw new Error(`iterate is unavailable (${probe.status}). Please retry.`);
		if (!live) adopt(await openSocketWithRetry(socketUrl()));
		const info = await api.info();
		return {
			api,
			info,
			signInFor: (project) => leaveForLogin(loginUrl({
				next: window.location.href,
				project
			}))
		};
	}
	return { authenticate(next = "/") {
		connecting ||= connect(next).catch((error) => {
			connecting = void 0;
			throw error;
		});
		return connecting;
	} };
}
//#endregion
//#region ../../core/lib/src/client/event-log.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
const EMPTY_EVENT_LOG = {
	events: [],
	caughtUp: false,
	head: 0,
	older: {
		loading: false,
		exhausted: false
	},
	actors: [],
	tableVersion: 0
};
/** Offsets per read: the platform's page cap (core/os `stream.ts` READ_PAGE_MAX_EVENTS). */
const PAGE = 1e3;
/** Subscribe to a context's log and read it — the newest page (`"tail"`) or all of it (`"all"`). */
function connectEventLog(itx, opts) {
	let disposed = false;
	let subscription;
	const listeners = /* @__PURE__ */ new Set();
	let snapshot = EMPTY_EVENT_LOG;
	const seen = /* @__PURE__ */ new Set();
	let events = [];
	let pending = [];
	let caughtUp = false;
	let error;
	let head = 0;
	/** Every durable event after this offset is held (or pending); 0 = the log from its first. */
	let floor = 0;
	let loadingOlder = false;
	let tableVersion = 0;
	const byActor = /* @__PURE__ */ new Map();
	let actors = [];
	let scheduled = false;
	const schedule = () => {
		if (scheduled || disposed) return;
		scheduled = true;
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(flush);
		else setTimeout(flush, 16);
	};
	const flush = () => {
		scheduled = false;
		if (disposed) return;
		const fresh = [];
		let actorsChanged = false;
		for (const event of pending) {
			if (seen.has(event.offset)) continue;
			seen.add(event.offset);
			fresh.push(event);
			if (event.offset > head) head = event.offset;
			if (event.type.startsWith("events.iterate.com/itx/subscription-")) tableVersion = Math.max(tableVersion, event.offset);
			const principal = event.source?.principal;
			const held = principal && byActor.get(principal.actor);
			if (principal && (!held || held.offset < event.offset)) {
				byActor.set(principal.actor, {
					actor: principal.actor,
					email: principal.email,
					grant: event.source?.grant,
					lastSeenAt: event.createdAt,
					offset: event.offset
				});
				actorsChanged = true;
			}
		}
		pending = [];
		if (fresh.length > 0) {
			fresh.sort((a, b) => a.offset - b.offset);
			if (events.length === 0 || fresh[0].offset > events.at(-1).offset) events = events.concat(fresh);
			else if (fresh.at(-1).offset < events[0].offset) events = fresh.concat(events);
			else events = events.concat(fresh).sort((a, b) => a.offset - b.offset);
		}
		if (actorsChanged) actors = [...byActor.values()].map(({ offset: _, ...presence }) => presence).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
		snapshot = {
			events,
			caughtUp,
			error,
			head,
			older: {
				loading: loadingOlder || !caughtUp && !error,
				exhausted: caughtUp && floor === 0
			},
			actors,
			tableVersion
		};
		for (const listener of listeners) listener();
	};
	const take = (events) => {
		for (const event of events) pending.push(event);
		schedule();
	};
	const fail = (caught) => {
		if (disposed) return;
		error = caught instanceof Error ? caught.message : String(caught);
		schedule();
	};
	/** Read every durable event in (after, through] — pages are cut by count AND bytes, and a log's
	*  offsets have gaps (ephemerals take offsets the log never stores), so read on until the scan
	*  reaches `through` (or the head). A page holds `limit` EVENTS, so under a gap it runs past
	*  `through`: what it holds above is already held. Returns how many events were in the window. */
	const readThrough = async (after, through) => {
		let taken = 0;
		for (;;) {
			const page = await itx.readEvents(after, Math.min(PAGE, through - after));
			if (disposed) return taken;
			const inWindow = toStreamEvents(page.events).filter((event) => event.offset <= through);
			take(inWindow);
			taken += inWindow.length;
			if (page.atHead || page.scannedThroughOffset >= through || page.scannedThroughOffset <= after) return taken;
			after = page.scannedThroughOffset;
		}
	};
	(async () => {
		const handle = await itx.subscribe({
			consumes: opts.consumes,
			target: (batch) => !disposed && take(toStreamEvents(batch))
		});
		if (disposed) {
			handle[Symbol.dispose]();
			return;
		}
		subscription = handle;
		if (opts.history === "tail") {
			const probe = await itx.readEvents(Number.MAX_SAFE_INTEGER, 1);
			if (disposed) return;
			head = Math.max(head, probe.scannedThroughOffset);
			floor = Math.max(0, probe.scannedThroughOffset - PAGE);
		}
		await readThrough(floor, Infinity);
		caughtUp = true;
		schedule();
	})().catch(fail);
	return {
		get: () => snapshot,
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		loadOlder() {
			if (disposed || !caughtUp || loadingOlder || floor === 0) return;
			loadingOlder = true;
			schedule();
			(async () => {
				let window = PAGE;
				let taken = 0;
				while (floor > 0 && taken < PAGE / 4) {
					const from = Math.max(0, floor - window);
					taken += await readThrough(from, floor);
					if (disposed) return;
					floor = from;
					window = Math.min(window * 2, 16 * PAGE);
				}
			})().catch(fail).finally(() => {
				loadingOlder = false;
				schedule();
			});
		},
		dispose() {
			disposed = true;
			listeners.clear();
			subscription?.[Symbol.dispose]();
		}
	};
}
/** A wire batch (capnweb proxy values or plain objects) as `StreamEvent`s — one clone per batch,
*  not per event — without the rows the view cannot place (no offset, type or time). Structural,
*  not a schema: the transport validated them; the three fields checked are all the log indexes by. */
function toStreamEvents(batch) {
	return JSON.parse(JSON.stringify(batch)).filter((value) => value && typeof value.offset === "number" && typeof value.type === "string" && typeof value.createdAt === "string");
}
//#endregion
//#region ../../core/lib/src/lib.ts
const isRecord = (v) => typeof v === "object" && !!v && !Array.isArray(v);
/** Apply a patch non-mutatingly (clone-then-mutate). The client half of `diff` — exported
*  through the SDK so subscribers need no third-party json-patch dependency. */
function applyPatch(doc, ops) {
	let root = structuredClone(doc);
	for (const op of ops) {
		if (op.path === "") {
			if (op.op === "remove") throw new Error("applyPatch: cannot remove the document root");
			root = op.value;
			continue;
		}
		const segs = op.path.slice(1).split("/").map((s) => s.replaceAll("~1", "/").replaceAll("~0", "~"));
		for (const s of segs) if (s === "__proto__") throw new Error(`applyPatch: refusing __proto__ in path ${op.path}`);
		const last = segs.pop();
		let parent = root;
		for (const s of segs) {
			parent = Array.isArray(parent) ? parent[Number(s)] : isRecord(parent) && Object.hasOwn(parent, s) ? parent[s] : void 0;
			if (parent === void 0) throw new Error(`applyPatch: missing path ${op.path}`);
		}
		if (Array.isArray(parent)) {
			if (op.op === "add") {
				if (last === "-") parent.push(op.value);
				else parent.splice(Number(last), 0, op.value);
			} else if (op.op === "replace") parent[Number(last)] = op.value;
			else parent.splice(Number(last), 1);
		} else if (isRecord(parent)) {
			if (op.op === "remove") delete parent[last];
			else parent[last] = op.value;
		} else throw new Error(`applyPatch: path ${op.path} traverses a non-container`);
	}
	return root;
}
//#endregion
//#region ../../core/lib/src/client/live-state.ts
/** The delta as it arrives over the wire — PARSED, never cast: `from`/`to` MUST be real numbers (a
*  non-numeric rev would poison the held revision and silently wedge every later frame), and each
*  patch op is a known RFC-6902-subset shape. A frame that fails this heals by re-reading the seed
*  rather than being applied — the same recovery the store already runs on a revision gap. */
const LiveStateDeltaMessage = object({
	key: string(),
	from: number(),
	to: number(),
	patch: array(union([
		object({
			op: literal("add"),
			path: string(),
			value: unknown()
		}),
		object({
			op: literal("replace"),
			path: string(),
			value: unknown()
		}),
		object({
			op: literal("remove"),
			path: string()
		})
	])).nullable()
});
function createLiveStateStore() {
	let held = {
		rev: null,
		state: void 0
	};
	const listeners = /* @__PURE__ */ new Set();
	const notify = () => listeners.forEach((l) => l());
	return {
		get: () => held.state,
		rev: () => held.rev,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => void listeners.delete(listener);
		},
		seed: (seed) => {
			if (held.rev !== null && seed.rev < held.rev) return;
			held = {
				rev: seed.rev,
				state: seed.state
			};
			notify();
		},
		apply: (delta, resync) => {
			if (held.rev !== null && delta.to <= held.rev) return;
			if (delta.from !== held.rev || !delta.patch) {
				resync();
				return;
			}
			held = {
				rev: delta.to,
				state: applyPatch(held.state, delta.patch)
			};
			notify();
		}
	};
}
/** Subscribe to a producer's live state and reduce it into a store. `readSeed` reads the seed
*  (`itx.invoke("itx.facets.get('slug').liveSnapshot()")` for a processor, or a mini-app's
*  own `state()` method). Subscribe happens BEFORE the first seed, so a delta racing the seed just
*  triggers one seed re-read — never a lost update. Gap heals are SINGLE-FLIGHT (a burst of gapped
*  frames triggers one seed read, not one per frame); a failed heal is reported through `onResync`
*  and retried by the next delivered delta (its `from` still mismatches, so it re-triggers). */
async function connectLiveState(itx, opts) {
	const store = createLiveStateStore();
	let healing = false;
	let healWantedAgain = false;
	let disposed = false;
	const reseed = () => {
		if (disposed) return;
		if (healing) {
			healWantedAgain = true;
			return;
		}
		healing = true;
		const settled = () => {
			healing = false;
			if (disposed || !healWantedAgain) return;
			healWantedAgain = false;
			reseed();
		};
		opts.readSeed().then((s) => {
			if (!disposed) {
				store.seed(s);
				opts.onResync?.("healed");
			}
			settled();
		}, (e) => {
			if (!disposed) opts.onResync?.(e instanceof Error ? e : new Error(String(e)));
			settled();
		});
	};
	const subscription = await itx.subscribe({
		name: opts.name,
		consumes: ["events.iterate.com/itx/live-state-changed"],
		target: (events) => {
			if (disposed) return;
			for (const e of events) {
				let parsed;
				try {
					parsed = LiveStateDeltaMessage.safeParse(JSON.parse(JSON.stringify(e.payload)));
				} catch {
					parsed = void 0;
				}
				if (!parsed?.success) {
					reseed();
					continue;
				}
				if (parsed.data.key !== opts.key) continue;
				try {
					store.apply(parsed.data, reseed);
				} catch {
					reseed();
				}
			}
		}
	});
	try {
		const seed = opts.readSeed();
		const { signal } = opts;
		const aborted = signal && new Promise((_, reject) => {
			const abort = () => reject(signal.reason ?? /* @__PURE__ */ new Error("connectLiveState: aborted while the first seed was pending"));
			if (signal.aborted) abort();
			else signal.addEventListener("abort", abort, { once: true });
		});
		if (aborted) seed.catch(() => void 0);
		store.seed(await (aborted ? Promise.race([seed, aborted]) : seed));
	} catch (error) {
		disposed = true;
		try {
			subscription[Symbol.dispose]();
		} catch {}
		throw error;
	}
	return {
		store,
		async dispose() {
			if (disposed) return;
			disposed = true;
			try {
				subscription[Symbol.dispose]();
			} catch {}
		}
	};
}
object({
	rev: number(),
	state: unknown()
});
/** Hold a capnweb context stub for as long as the component wants it: `open()` —
*  `() => api.projects.get(id)`, `() => root.cd(path)` — runs when `deps` change, and the stub is
*  disposed on unmount, on every re-open, and when it arrives after the component moved on (every
*  open stub is a subscription row and a pinned Durable Object on the platform). `open` null opens
*  nothing; `pending` while an open is in flight; `error` the refusal. */
function useContextStub(open, deps) {
	const [state, setState] = (0, import_react.useState)(() => ({ pending: Boolean(open) }));
	(0, import_react.useEffect)(() => {
		if (!open) {
			setState({ pending: false });
			return;
		}
		setState((previous) => previous.pending && !previous.stub ? previous : { pending: true });
		let disposed = false;
		let held;
		open().then((stub) => {
			if (disposed) return stub[Symbol.dispose]();
			held = stub;
			setState({
				stub,
				pending: false
			});
		}, (caught) => !disposed && setState({
			error: caught instanceof Error ? caught.message : String(caught),
			pending: false
		}));
		return () => {
			disposed = true;
			held?.[Symbol.dispose]();
		};
	}, deps);
	return state;
}
/** A named live state before its first seed lands — and before the effect that opens it has run. */
const LIVE_STATE_CONNECTING = {
	value: void 0,
	rev: null,
	status: "connecting"
};
/** THE ITERATE CONTEXT, live — one hook, one stream subscription. THE LOG (client/event-log.ts):
*  subscribe to every committed event (or `consumes`) BEFORE the catch-up read, so nothing lands
*  between the two; pushes and pages both dedupe by offset into one sorted array, published at most
*  once a frame; `caughtUp` once the read reached the head; `error` when the connect failed.
*  `history: "tail"` (the default) reads the newest page only — a context of 100,000 events opens
*  as fast as one of 10 — and `older.loadOlder()` reads the page below what is held; `"all"` reads
*  every page from the first, for a consumer that folds the whole log (the agents chat). `head` is
*  the newest offset known, so a view can say how much of the log it holds. Off that same log, THE SUBSCRIPTIONS TABLE (`itx.subscriptions.list()`:
*  every subscriber — a row that hosts a facet is a processor — with its delivery cursor), re-read
*  whenever the log grows a row-changing event (a subscription configured, halted or resumed — the
*  table is core state, one call away, no push of its own) and as the head moves (at most once a
*  second, so a cursor's confirmed offset follows its deliveries), and WHO IS HERE: the rpc stubs lent right now
*  (`itx.rpcStubs.list()` — physical, re-read at every new head, since presence changes are
*  ephemeral facts) and, from the log, every principal that acted, newest first. And named facets'
*  LIVE STATE, each seeded through `itx.facets.get('<name>').liveSnapshot()` — one entry per name,
*  always; `core`, the core reduce, has no live state and is its `snapshot()` re-read at each new
*  head (its `rev` the snapshot's offset). `liveState` OMITTED opens `core` plus every
*  hosted facet in the processors table the hook holds, following the table as it loads and changes;
*  `liveState` GIVEN is exactly the names to open, no implicit `core`. Re-connects when `itx`
*  changes; unmount disposes every server-side subscription. */
function useIterateContext(itx, opts = {}) {
	const [log, setLog] = (0, import_react.useState)();
	const consumesKey = JSON.stringify(opts.consumes || ["*"]);
	const history = opts.history || "tail";
	(0, import_react.useEffect)(() => {
		setLog(void 0);
		if (!itx) return;
		const connection = connectEventLog(itx, {
			consumes: JSON.parse(consumesKey),
			history
		});
		setLog({
			itx,
			connection
		});
		return () => connection.dispose();
	}, [
		itx,
		consumesKey,
		history
	]);
	const connection = itx && log?.itx === itx ? log.connection : void 0;
	const subscribeLog = (0, import_react.useCallback)((listener) => connection ? connection.subscribe(listener) : () => {}, [connection]);
	const held = (0, import_react.useSyncExternalStore)(subscribeLog, () => connection?.get() ?? EMPTY_EVENT_LOG, () => EMPTY_EVENT_LOG);
	const { events: sorted, caughtUp, head, tableVersion } = held;
	const loadOlder = (0, import_react.useCallback)(() => connection?.loadOlder(), [connection]);
	const older = (0, import_react.useMemo)(() => ({
		loadOlder,
		loading: held.older.loading,
		exhausted: held.older.exhausted
	}), [loadOlder, held.older]);
	const headForReads = useThrottled(head, 1e3);
	const [table, setTable] = (0, import_react.useState)();
	const [failure, setFailure] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (!itx) return;
		let disposed = false;
		Promise.resolve(itx.subscriptions.list()).then((list) => {
			if (disposed) return;
			setTable({
				itx,
				rows: list
			});
			setFailure(void 0);
		}, (e) => !disposed && setFailure({
			itx,
			message: e instanceof Error ? e.message : String(e)
		}));
		return () => {
			disposed = true;
		};
	}, [
		itx,
		tableVersion,
		headForReads
	]);
	const currentTable = itx && table?.itx === itx ? table : void 0;
	const [census, setCensus] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (!itx) return;
		let disposed = false;
		Promise.resolve(itx.rpcStubs.list()).then((list) => !disposed && setCensus({
			itx,
			rpcStubs: list
		}), () => void 0);
		return () => {
			disposed = true;
		};
	}, [itx, headForReads]);
	const rpcStubs = itx && census?.itx === itx ? census.rpcStubs : [];
	const liveStateKey = JSON.stringify(opts.liveState || ["core", ...(currentTable?.rows || []).flatMap((row) => row.hostedFacet ? [row.hostedFacet.name] : [])]);
	const [liveStates, setLiveStates] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (!itx) return;
		const names = JSON.parse(liveStateKey);
		if (names.length === 0) return;
		let disposed = false;
		const unmounted = new AbortController();
		const disposers = [];
		const patch = (name, change) => setLiveStates((held) => held && held.itx === itx && held.key === liveStateKey ? {
			...held,
			entries: {
				...held.entries,
				[name]: {
					...held.entries[name],
					...change
				}
			}
		} : held);
		setLiveStates({
			itx,
			key: liveStateKey,
			entries: Object.fromEntries(names.map((name) => [name, LIVE_STATE_CONNECTING]))
		});
		for (const name of names) {
			if (name === "core") continue;
			connectLiveState(itx, {
				key: name,
				readSeed: async () => await itx.invoke(`itx.facets.get('${name}').liveSnapshot()`),
				signal: unmounted.signal,
				onResync: (result) => {
					if (disposed) return;
					if (result === "healed") patch(name, {
						status: "live",
						error: void 0
					});
					else patch(name, {
						status: "error",
						error: result.message
					});
				}
			}).then((connection) => {
				if (disposed) {
					connection.dispose();
					return;
				}
				disposers.push(connection.dispose);
				disposers.push(connection.store.subscribe(() => patch(name, {
					value: connection.store.get(),
					rev: connection.store.rev()
				})));
				patch(name, {
					value: connection.store.get(),
					rev: connection.store.rev(),
					status: "live"
				});
			}, (e) => {
				if (disposed) return;
				patch(name, {
					status: "error",
					error: e instanceof Error ? e.message : String(e)
				});
			});
		}
		return () => {
			disposed = true;
			unmounted.abort();
			for (const dispose of disposers) dispose();
		};
	}, [itx, liveStateKey]);
	const wantsCore = JSON.parse(liveStateKey).includes("core");
	const [core, setCore] = (0, import_react.useState)();
	const coreReads = (0, import_react.useRef)({
		inFlight: false,
		again: false
	});
	(0, import_react.useEffect)(() => {
		if (!itx || !wantsCore || !caughtUp) return;
		const reads = coreReads.current;
		if (reads.itx !== itx) Object.assign(reads, {
			itx,
			inFlight: false,
			again: false
		});
		if (reads.inFlight) {
			reads.again = true;
			return;
		}
		const read = () => {
			reads.inFlight = true;
			reads.again = false;
			itx.invoke("itx.facets.get('core').snapshot()").then((answer) => {
				const snapshot = answer;
				if (reads.itx !== itx) return;
				setCore({
					itx,
					result: {
						value: snapshot.state,
						rev: snapshot.offset,
						status: "live"
					}
				});
			}, (e) => reads.itx === itx && setCore({
				itx,
				result: {
					value: void 0,
					rev: null,
					status: "error",
					error: e instanceof Error ? e.message : String(e)
				}
			})).finally(() => {
				if (reads.itx !== itx) return;
				reads.inFlight = false;
				if (reads.again) read();
			});
		};
		read();
	}, [
		itx,
		wantsCore,
		caughtUp,
		headForReads
	]);
	(0, import_react.useEffect)(() => () => {
		coreReads.current.itx = void 0;
	}, []);
	const liveState = (0, import_react.useMemo)(() => {
		const names = JSON.parse(liveStateKey);
		const held = { ...itx && liveStates?.itx === itx && liveStates.key === liveStateKey && liveStates.entries };
		if (itx && core?.itx === itx) held.core = core.result;
		else delete held.core;
		return Object.fromEntries(names.map((name) => [name, held[name] || LIVE_STATE_CONNECTING]));
	}, [
		itx,
		liveStateKey,
		liveStates,
		core
	]);
	return {
		events: sorted,
		caughtUp,
		error: held.error,
		head,
		older,
		processors: {
			rows: currentTable?.rows || [],
			loaded: Boolean(currentTable),
			error: itx && failure?.itx === itx ? failure.message : void 0
		},
		presence: {
			actors: held.actors,
			rpcStubs
		},
		liveState
	};
}
/** `value`, changing at most once per `ms`: the latest value lands `ms` after the last change let
*  through (at once when that is past), so a value that moves every frame is read once a period and
*  its last move is never lost. */
function useThrottled(value, ms) {
	const [held, setHeld] = (0, import_react.useState)(value);
	const lastLetThrough = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (Object.is(value, held)) return;
		const timer = setTimeout(() => {
			lastLetThrough.current = Date.now();
			setHeld(value);
		}, Math.max(0, lastLetThrough.current + ms - Date.now()));
		return () => clearTimeout(timer);
	}, [
		value,
		held,
		ms
	]);
	return held;
}
//#endregion
export { createIterateClient, useContextStub, useIterateContext };
