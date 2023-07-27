# ksuid-edge

A drop-in replacement for the excellent [`ksuid`](https://www.npmjs.com/ksuid) module for environments that don't have `Buffer` or `node:util`.

## Installation

```
$ pnpm add ksuid-edge
```

## Usage

The API should be 1:1 compatible with `ksuid`. Check out their usage instructions [here](https://github.com/novemberborn/ksuid#usage) for a more detailed run-through of the API.

```ts
import KSUID from 'ksuid';

const ksuidFromSync = KSUID.randomSync();
console.log(ksuidFromSync.toString()) // "KSUID { 2T9QkbWRq71cvp0KeN5YZJo9Kpu }"
```
