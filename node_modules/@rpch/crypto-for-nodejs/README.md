# rpch-crypto

This crate implements the RPCh Crypto protocol as defined by the specs in the parent repository.
The implementation is WASM compatible and also exposes a TypeScript API via `wasm-bindgen`.

## Distributions

| target  | usage                 | description                                                  |
| ------- | --------------------- | ------------------------------------------------------------ |
| bundler | bundler (ex: webpack) | (Recommended) Suitable for loading in bundlers like Webpack. |
| web     | Native in browser     | Directly loadable in a web browser.                          |
| nodejs  | nodeJS                | Loadable via `require` as a Node.js module.                  |

The recommended target is `bundler`. Assumes a model where the wasm module itself is natively an ES module. This model, however, is not natively implemented in any JS implementation at this time. As a result, to consume the default output of wasm-bindgen you will need a bundler of some form.
The choice of this default output was done to reflect the trends of the JS ecosystem. While tools other than bundlers don't support wasm files as native ES modules today they're all very much likely to in the future!

## Building

Rust >= 1.61 is required. Also `wasm-pack >=0.11.0` is required for building, which can be installed as `cargo install wasm-pack`.

To install & build, simply run:

`make`

When rebuilding, don't forget to run `make clean` first before running `make`.

# Maintainers

## Publishing a new release

1. Create branch based from `main` with a name like `release/<new-version>`
2. Update version with `<new-version>` in `Cargo.toml`
3. Create a PR on GitHub for the new version titled `Release <new-version>`
4. Wait for successful release
5. Merge to main
6. Create a new release on GitHub titled `<new-version>` and publish it
   - Also use `create new tag` option and set it to `<new-version>`
