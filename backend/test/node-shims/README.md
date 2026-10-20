# `node:` protocol shims for Jest 26

Jest 26 checks `isCoreModule()` against the *unprefixed* name and does so **before**
applying `moduleNameMapper`, so a dependency importing `node:buffer` fails to resolve.
Resolver support for the `node:` protocol arrived in Jest 28.

`jest.config.ts` maps `node:<name>` to the file of the same name here; each simply
re-requires the real core module, which Jest then resolves normally.

If a new dependency imports a `node:` module not listed here, resolution fails with
`ENOENT: ... open '<name>'` - add a one-line file for it.
