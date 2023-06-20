import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import axios from 'axios';
import {
  Button,
  Box,
  Text,
  Input,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { injected } from "../config/wallets";
import abi from "./abi.json";

export default function ConnectButton() {
  const { account, active, activate, library, deactivate } = useWeb3React();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [connected, setConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("0");
  const [babyBalance, setBabyBalance] = useState<string>("0");
  const [mode, setMode] = useState<string>("BNB");
  const [recieverAdd, setRecieverAdd] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<number>(0);
  const [gasFee, setGasFee] = useState<string>('');
  const [gasLimit, setGasLimit] = useState<number>(0);
  const toast = useToast();

  function handleConnectWallet() {
    connected ? deactivate() : activate(injected);
    setConnected(!connected);
  }

  function handleMode() {
    setMode(mode === "BNB" ? "BabyDoge" : "BNB");
  }

  function handleChangeAddress(event: any) {
    setRecieverAdd(event.target.value);
  }

  function handleChangeAmount(event: any) {
    setSendAmount(event.target.value);
  }

  async function handleOpenModal() {
    if (!recieverAdd) {
      return toast({
        description: "Please input Receiver Address",
        status: "error",
      });
    }
    if (!sendAmount || sendAmount === 0) {
      return toast({
        description: "Please input send amount",
        status: "error",
      });
    }

    const provider = new ethers.providers.Web3Provider(library.provider);
    const block = await provider.getBlock("latest");
    setGasLimit(Number(block.gasLimit));

    const gasPrice = await provider.getGasPrice();
    setGasFee(toGWei(gasPrice.toString()));

    onOpen();
  }

  const sendBaby = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(library.provider);
    const signer = provider.getSigner();
    const ctx = new ethers.Contract(
      "0xc748673057861a797275CD8A068AbB95A902e8de",
      abi,
      signer
    );

    await ctx.approve(recieverAdd, sendAmount);
    const transaction = await ctx.transfer(recieverAdd, sendAmount);
    axios.post('http://localhost:8000/transaction', {
      tHash: transaction.hash,
      tokenname: mode,
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [library, recieverAdd, sendAmount]);

  const sendAction = useCallback(async () => {
    
    const provider = new ethers.providers.Web3Provider(library.provider);
    const signer = provider.getSigner();
    const txParams = {
      to: recieverAdd,
      value: ethers.utils.parseEther(sendAmount.toString()),
    };
    const transaction = await signer.sendTransaction(txParams);
    axios.post('http://localhost:8000/transaction', {
      tHash: transaction.hash,
      tokenname: mode,
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
    console.log(`Transaction hash: ${transaction.hash}`);
    console.log(`Transaction data: ${transaction.data}`);
    onClose();
    valueload();
  }, [library, recieverAdd, sendAmount]);

  function fromWei(val: ethers.BigNumber) {
    if (val) {
      return ethers.utils.formatEther(val);
    } else {
      return "0";
    }
  }

  function toGWei(val: string) {
    if (val) {
      return ethers.utils.formatUnits(val, "gwei");
    } else {
      return "0";
    }
  }

  const valueload = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(library.provider);
    const signer = provider.getSigner();
    console.log(signer)
    //BSC Main 0xc748673057861a797275CD8A068AbB95A902e8de
    //BSC Test 0xe37462536cf19568f1a6ebd832e9616322bd4a04
    const ctx = new ethers.Contract(
      "0xc748673057861a797275CD8A068AbB95A902e8de",
      abi,
      signer
    );

    console.log(ctx)
    console.log(account)

    if (account) {
      const balance = await provider.getBalance(account);
      setBalance(fromWei(balance));

      const gasPrice = await provider.getGasPrice();
      setGasFee(String(gasPrice));

      const babyBalance = await ctx.balanceOf(account);
      // console.log(babyBalance)
      setBabyBalance(ethers.utils.formatEther(babyBalance.toString()));
    }
  }, [account, library]);

  useEffect(() => {
    active && valueload();
  }, [account, active, valueload]);

  return account ? (
    <Box
      display="block"
      alignItems="center"
      background="white"
      borderRadius="xl"
      p="4"
      width="300px"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="2"
      >
        <Text color="#158DE8" fontWeight="medium">
          Account:
        </Text>
        <Text color="#6A6A6A" fontWeight="medium">
          {`${account.slice(0, 6)}...${account.slice(
            account.length - 4,
            account.length
          )}`}
        </Text>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="2"
      >
        <Text color="#158DE8" fontWeight="medium">
          BabyDoge Balance :
        </Text>
        <Text color="#6A6A6A" fontWeight="medium">
          {babyBalance}
        </Text>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="2"
      >
        <Text color="#158DE8" fontWeight="medium">
          BNB Balance:
        </Text>
        <Text color="#6A6A6A" fontWeight="medium">
          {balance}
        </Text>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="2"
      >
        <Text color="#158DE8" fontWeight="medium">
          BNB / BabyDoge
        </Text>
        <Switch size="md" value={mode} onChange={handleMode} />
      </Box>
      <Box
        display="block"
        justifyContent="space-between"
        alignItems="center"
        mb="4"
      >
        <Text color="#158DE8" fontWeight="medium">
          Send {mode}:
        </Text>
        <Input
          bg="#EBEBEB"
          size="lg"
          value={recieverAdd}
          onChange={handleChangeAddress}
        />
      </Box>
      <Box display="flex" alignItems="center" mb="4">
        <Input
          bg="#EBEBEB"
          size="lg"
          value={sendAmount}
          onChange={handleChangeAmount}
        />
        <Button
          onClick={handleOpenModal}
          bg="#158DE8"
          color="white"
          fontWeight="medium"
          borderRadius="xl"
          ml="2"
          border="1px solid transparent"
          _hover={{
            borderColor: "blue.700",
            color: "gray.800",
          }}
          _active={{
            backgroundColor: "blue.800",
            borderColor: "blue.700",
          }}
        >
          Send
        </Button>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Button
          onClick={handleConnectWallet}
          bg="#158DE8"
          color="white"
          fontWeight="medium"
          borderRadius="xl"
          border="1px solid transparent"
          width="300px"
          _hover={{
            borderColor: "blue.700",
            color: "gray.800",
          }}
          _active={{
            backgroundColor: "blue.800",
            borderColor: "blue.700",
          }}
        >
          Disconnect Wallet
        </Button>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Are you Sure?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              Are you sure {sendAmount} {mode} to {recieverAdd} user?
            </div>
            <div>Gas Limit: {gasLimit}</div>
            <div>Gas Price: {gasFee}</div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            {mode === "BNB"?
            <Button variant="ghost" onClick={sendAction}>
            Send
          </Button> : <Button variant="ghost" onClick={sendBaby}>
              Send
            </Button>
            }
            
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  ) : (
    <Box bg="white" p="4" borderRadius="xl">
      <Button
        onClick={handleConnectWallet}
        bg="#158DE8"
        color="white"
        fontWeight="medium"
        borderRadius="xl"
        border="1px solid transparent"
        width="300px"
        _hover={{
          borderColor: "blue.700",
          color: "gray.800",
        }}
        _active={{
          backgroundColor: "blue.800",
          borderColor: "blue.700",
        }}
      >
        Connect Wallet
      </Button>
    </Box>
  );
}