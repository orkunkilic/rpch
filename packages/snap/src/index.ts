/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
/* import * as RPChCrypto from '@rpch/crypto-for-web'; */
import { ethErrors } from 'eth-rpc-errors';
import { Buffer } from 'buffer';
const {init, get_wasm} = require('../build/index.js');
import * as RPChCrypto from '../build';
/* import * as RPChCrypto from '../build'; */
import SDK, { EntryNode } from '@rpch/sdk';
import common from '@rpch/common';
import { RPChProvider } from '@rpch/ethers';
/* const SDK = require('@rpch/sdk'); */
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
const fs = require('fs');
window.Buffer = Buffer;

const PROVIDER_URL = 'https://primary.gnosis-chain.rpc.hoprtech.net';
const TIMEOUT = 60000;

let wasm: any = null;
let sdk: any = null;
let provider: any = null;
let deriver: any = null;
const map = new Map();

const initializeWasm = async () => {
  try {
    // instantiate wasm from buffer
    /* wasm = await init(undefined); */
    /* const bytes = fs.readFileSync(`${__dirname}/../build/index_bg.wasm`);

    const wasmModule = await WebAssembly.compile(bytes); */
    /* const wasmModule = new WebAssembly.Module(bytes); */
    /* const wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
    wasm = wasmInstance.exports; */
    await init();
    /* set_wasm_module(wasm); */
  } catch (error) {
    console.error('Failed to initialize WebAssembly module.', error);
    throw error;
  }
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  /* console.log(_ethers); */

  if (!deriver) {
    const node = await snap.request({
      method: 'snap_getBip44Entropy',
      params: {
        coinType: 60,
      },
    });

    deriver = await getBIP44AddressKeyDeriver(node);
    console.log('deriver done');
  }

  if (!wasm) {
    console.log('initialize wasm');
    await initializeWasm();
    const _wasm = get_wasm();
    wasm = _wasm;
  }

  if (!provider) {
    provider = new RPChProvider(
      PROVIDER_URL,
      100,
      {
        crypto: RPChCrypto,
        client: 'trial',
        timeout: TIMEOUT,
        discoveryPlatformApiEndpoint: 'https://a.sandbox.rpch.tech/',
      },
      async (key: any, value: any) => {
        map.set(key, value);
        return Promise.resolve(value);
      },
      async (key: any) => {
        return Promise.resolve(map.get(key));
      },
    );
    console.log('provider', provider);
    provider.sdk.debug.enable("rpch:*");
  }

  switch (request.method) {
    case 'start_sdk':
      if (!provider.sdk.isReady) {
        console.log('starting sdk from snap');
        await provider.sdk.start();
        console.log('sdk started:', provider.sdk.isReady);
        return true;
      }
      return true;
    case 'call':
      let content;
      if (!request.params) {
        throw ethErrors.rpc.invalidParams({
          message: 'Expected params.',
          data: request.params,
        });
      }
      if (request.params[2] === '0x') {
        content = panel([
          text(`Sending **${request.params[1]}** xDAI to **${request.params[0]}**`),
          text('Confirm this transaction in your wallet.'),
        ]);
      } else {
        content = panel([
          text(`Sending **${request.params[1]}** xDAI to **${request.params[0]}**`),
          text(`Transaction Data: ${request.params[2]}`),
          text(`This transaction will call a smart contract.`),
          text('Confirm this transaction in your wallet.'),
        ]);
      }
      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content,
        },
      });
      if (!result) {
        throw ethErrors.rpc.internal({
          message: 'User rejected the transaction.',
        });
      }

      const keypair = await deriver(0);
      const privateKey = keypair.privateKey;

      /* const nonceRes = await provider.send('eth_getTransactionCount', [keypair.address, 'latest']);

      if (!nonceRes.result) {
        throw ethErrors.rpc.internal({
          message: 'Failed to get nonce.',
        });
      }

      const nonce = nonceRes.result && parseInt(nonceRes.result, 16)

      console.log(nonce);
 */
      const rawTxObject = {
        from: keypair.address,
        to: request.params[0],
        value: _ethers.BigNumber.from('1'),
        data: /* request.params[2] */ '0x',
        nonce: _ethers.BigNumber.from('2'),
        gasLimit: _ethers.BigNumber.from('21000'),
        // gas Price 10 gwei
        gasPrice: _ethers.BigNumber.from('10000000000'),
        type: 0x0,
        chainId: 100,
      }

      const signer = new _ethers.Wallet(privateKey, provider)

      console.log(signer);

      console.log(rawTxObject);

      signer
        .signTransaction(rawTxObject)
        .then((tx) => {
          console.log("Signed transaction: " + tx)
          provider.send('eth_sendRawTransaction', [tx])
            .then((res) => {
              console.log(res);
            });
        }).catch((err) => {
          console.log(err);
        })

      // serialize object
      // sign
      // send
      // await provider.send('eth_sendRawTransaction', [signedTx])
      // return tx hash

      return result;
    default:
      throw new Error('Method not found.');
  }
};
