import { useContext, useState } from 'react';
import styled from 'styled-components';
import { ethers, Interface } from 'ethers';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  call,
  callSC,
  callSDK,
  connectSnap,
  getSnap,
  sendXDai,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Card,
  SendXDaiButton,
  CallSCButton,
} from '../components';
import { InteractiveCard } from '../components/InteractiveCard';
import { CustomInput } from '../components/CustomInput';
import { CustomSelect } from '../components/CustomSelect';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 80%;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState();

  const [scAddress, setScAddress] = useState('');
  const [scAmount, setScAmount] = useState();
  const [scData, setScData] = useState();
  const [scAbi, setScAbi] = useState();
  const [iface, setIFace] = useState();
  const [options, setOptions] = useState([]);
  const [fragments, setFragments] = useState([]);
  const [scInputs, setScInputs] = useState({});

  const [functions, setFunctions] = useState();

  const handleSCAddressChange = (e) => {
    setScAddress(e.target.value);
    if (e.target.value.length < 42) {
      return;
    }
    // fetch abi from gnosisscan
    fetch(`https://api.gnosisscan.io/api?module=contract&action=getabi&address=${e.target.value}&apikey=YourApiKeyToken`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status !== '1') {
          return;
        }
        const abi = res.result;
        const iface = new Interface(abi);
        const fragments = iface.fragments.filter((f) => f.type === 'function' && f.stateMutability !== 'view');
        const options = fragments.map((f) => {
            return {
              value: f.name,
              label: f.name,
            };
        })
        setFragments(fragments);
        setOptions(options);
        setIFace(iface);
      });
  };

  const handleFunctionChange = (e) => {
    const fragment = fragments.find((f) => f.name === e.target.value);
    if (!fragment) {
      return;
    }
    const inputs = fragment.inputs.map((i) => {
      return {
        name: i.name,
        type: i.type,
      };
    });


    let isPayable = false;
    // payable
    if (fragment.stateMutability === 'payable') {
      isPayable = true;
      inputs.push({
        name: 'value',
        type: 'uint256',
      });
    }

    setFunctions({
      fragment: fragment,
      name: fragment.name,
      inputs,
      isPayable,
    });
  };

  const handleSCAmountChange = (e) => {
    setScAmount(e.target.value);
  };

  const handleSCDataChange = (e) => {
    setScData(e.target.value);
  };

  const handleAddressChange = (e) => {
    // TODO: check if e.target.value is a valid address
    setAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      await callSDK();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendXDaiClick = async () => {
    try {
      const amountWei = Number(amount);
      await call(address, amountWei);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleCallSCClick = async () => {
    try {
      const amountWei = Number(scAmount || 0);
      const data = iface.encodeFunctionData(functions.fragment, Object.values(scInputs));
      await call(scAddress, amountWei, data);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  }

  return (
    <Container>
      <Heading>
        Welcome to <Span>RPCh on Snap</Span>
      </Heading>
      <Subtitle>
        Enjoy private RPC on Gnosis Chain thanks to <Span>HOPR / RPCh</Span>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <InteractiveCard
          content={{
            title: 'Send xDAI',
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        >
          <CustomInput
            placeholder={'Address'}
            value={address}
            onChange={handleAddressChange}
          />
          <CustomInput
            placeholder={'Amount'}
            value={amount}
            onChange={handleAmountChange}
          />
          <SendXDaiButton
            onClick={handleSendXDaiClick}
            disabled={!state.installedSnap}
          />
        </InteractiveCard>
        <InteractiveCard
          content={{
            title: 'Call Smart Contract',
          }}
          disabled={!state.installedSnap}
          fullWidth={
            state.isFlask &&
            Boolean(state.installedSnap) &&
            !shouldDisplayReconnectButton(state.installedSnap)
          }
        >
          <CustomInput
            placeholder={'Address'}
            value={scAddress}
            onChange={handleSCAddressChange}
          />
          <CustomSelect onChange={handleFunctionChange} options={options} />
          {functions?.inputs?.map((input) => {
            return (
              <CustomInput
                placeholder={input.name + ' (' + input.type + ')'}
                value={scData}
                onChange={e => {
                  setScInputs({
                    ...scInputs,
                    [input.name]: e.target.value,
                  });
                }}
              />
            );
          })}
          {functions?.isPayable && (
            <CustomInput
              placeholder={'Amount'}
              value={scAmount}
              onChange={handleSCAmountChange}
            />
          )}
          <CallSCButton
            onClick={handleCallSCClick}
            disabled={!state.installedSnap}
          />
        </InteractiveCard>
        <Notice>
          <p>
            RPCh on Snap is a proof of concept.
            <br />
            Built by Chainway for ETHPrivacy Hackathon.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
