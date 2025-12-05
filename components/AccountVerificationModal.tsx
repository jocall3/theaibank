```tsx
import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';

// Assuming a UI kit is used for components like Modal, Button, Input, etc.
// These would be replaced with actual library imports (e.g., from @chakra-ui/react or @mui/material)
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Text,
  VStack,
  HStack,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from '@uikit/components';

// Simplified types based on the OpenAPI schema for this component's needs
interface ExternalAccount {
  id: string;
  party_name: string;
  verification_status: 'unverified' | 'pending_verification' | 'verified';
}

interface InternalAccount {
    id: string;
    name: string;
    currency: string;
}

interface AccountVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  externalAccount: ExternalAccount | null;
}

type VerificationStep = 'initiate' | 'confirm' | 'success';

export const AccountVerificationModal: FC<AccountVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  externalAccount,
}) => {
  const [step, setStep] = useState<VerificationStep>('initiate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amounts, setAmounts] = useState(['', '']);
  const [internalAccounts, setInternalAccounts] = useState<InternalAccount[]>([]);
  const [selectedInternalAccountId, setSelectedInternalAccountId] = useState<string>('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen && externalAccount) {
      // Reset state on open
      setError(null);
      setIsLoading(false);
      setAmounts(['', '']);

      // Determine the initial step based on the account's current status
      if (externalAccount.verification_status === 'pending_verification') {
        setStep('confirm');
      } else {
        setStep('initiate');
        // Fetch internal accounts needed for starting the verification
        const fetchInternalAccounts = async () => {
          try {
            setIsLoading(true);
            const response = await axios.get('/api/internal_accounts');
            setInternalAccounts(response.data);
            if (response.data.length > 0) {
              setSelectedInternalAccountId(response.data[0].id);
            }
          } catch (e) {
            setError('Failed to load necessary data. Please try again.');
          } finally {
            setIsLoading(false);
          }
        };
        fetchInternalAccounts();
      }
    }
  }, [isOpen, externalAccount]);

  const handleStartVerification = async () => {
    if (!externalAccount || !selectedInternalAccountId) return;
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`/api/external_accounts/${externalAccount.id}/verify`, {
        originating_account_id: selectedInternalAccountId,
        payment_type: 'ach', // Assuming ACH for micro-deposits
      });
      setStep('confirm');
      toast({
        title: 'Verification Started',
        description: 'Micro-deposits are on their way to your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (e: any) {
      setError(e.response?.data?.errors?.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteVerification = async () => {
    if (!externalAccount) return;
    const parsedAmounts = amounts.map(a => Math.round(parseFloat(a) * 100)).filter(a => !isNaN(a));

    if (parsedAmounts.length !== 2 || parsedAmounts.some(a => a <= 0)) {
        setError('Please enter two valid, positive deposit amounts.');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`/api/external_accounts/${externalAccount.id}/complete_verification`, {
        amounts: parsedAmounts,
      });
      setStep('success');
      // Delay closing to show success message, then call success callback
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e: any) {
       setError(e.response?.data?.errors?.message || 'Verification failed. Please double-check the amounts and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (index: number, value: string) => {
    const newAmounts = [...amounts];
    // Allow only numbers and a single decimal point
    if (/^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
        newAmounts[index] = value;
        setAmounts(newAmounts);
    }
  };

  const renderContent = () => {
    if (!externalAccount) return <Spinner />;

    switch (step) {
      case 'initiate':
        return (
          <VStack spacing={4} align="stretch">
            <Text>
              To verify your account, we will send two small deposits (less than $1.00) to{' '}
              <strong>{externalAccount.party_name}</strong>.
            </Text>
            <Text>
              These should appear in your bank account in 1-2 business days. Once you see them, come back here to enter the amounts.
            </Text>
            <FormControl isInvalid={!selectedInternalAccountId && internalAccounts.length > 0}>
                <FormLabel>Originate Deposits From</FormLabel>
                 {internalAccounts.length > 0 ? (
                    <Select value={selectedInternalAccountId} onChange={(e) => setSelectedInternalAccountId(e.target.value)}>
                        {internalAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.name} ({acc.currency})
                            </option>
                        ))}
                    </Select>
                 ) : <Text fontSize="sm" color="gray.500">No internal accounts found.</Text>}
                <FormErrorMessage>An originating account must be selected.</FormErrorMessage>
            </FormControl>
          </VStack>
        );
      case 'confirm':
        return (
          <VStack spacing={4} align="stretch">
            <Text>
              Check your bank account for two small deposits from Modern Treasury. Enter the amounts below in USD to complete the verification.
            </Text>
            <HStack spacing={4}>
              <FormControl isInvalid={!!error}>
                <FormLabel>First Deposit Amount</FormLabel>
                <Input
                  type="text"
                  placeholder="0.21"
                  value={amounts[0]}
                  onChange={(e) => handleAmountChange(0, e.target.value)}
                />
              </FormControl>
              <FormControl isInvalid={!!error}>
                <FormLabel>Second Deposit Amount</FormLabel>
                <Input
                  type="text"
                  placeholder="0.45"
                  value={amounts[1]}
                  onChange={(e) => handleAmountChange(1, e.target.value)}
                />
              </FormControl>
            </HStack>
          </VStack>
        );
      case 'success':
          return (
            <VStack spacing={4} align="center" justify="center" p={8}>
                <AlertIcon boxSize="40px" mr={0} />
                <Text fontSize="lg" fontWeight="bold">Account Verified!</Text>
                <Text>Your account has been successfully verified and is ready for use.</Text>
            </VStack>
          )
      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (step) {
        case 'initiate':
            return (
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleStartVerification}
                        isLoading={isLoading}
                        isDisabled={!selectedInternalAccountId}
                    >
                        Send Micro-Deposits
                    </Button>
                </>
            );
        case 'confirm':
            return (
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" onClick={handleCompleteVerification} isLoading={isLoading}>
                        Verify Account
                    </Button>
                </>
            );
        case 'success':
            return null;
        default:
            return <Button onClick={onClose}>Close</Button>;
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Verify Bank Account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          {isLoading && step !== 'confirm' && <Spinner />}
          {!isLoading || step === 'confirm' ? renderContent() : null}
        </ModalBody>
        <ModalFooter>
          {renderFooter()}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
```