
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  VirtualAccount,
  VirtualAccountCreateRequest,
  VirtualAccountUpdateRequest,
  AccountDetail,
  RoutingDetail,
} from '../../types'; // Adjust path as needed
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useInternalAccounts } from '../internal-accounts/hooks/useInternalAccounts';
import { useCounterparties } from '../counterparties/hooks/useCounterparties';

interface VirtualAccountFormProps {
  initialValues?: VirtualAccount;
  onSubmit: (
    data: VirtualAccountCreateRequest | VirtualAccountUpdateRequest,
  ) => void;
  isSubmitting: boolean;
  error?: string;
}

const VirtualAccountForm: React.FC<VirtualAccountFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<
    VirtualAccountCreateRequest & VirtualAccountUpdateRequest
  >({
    defaultValues: initialValues
      ? {
          name: initialValues.name,
          description: initialValues.description,
          counterparty_id: initialValues.counterparty_id,
          internal_account_id: initialValues.internal_account_id,
          debit_ledger_account_id: initialValues.debit_ledger_account_id,
          credit_ledger_account_id: initialValues.credit_ledger_account_id,
          metadata: initialValues.metadata,
          account_details: initialValues.account_details,
          routing_details: initialValues.routing_details,
        }
      : {
          name: '',
          description: '',
          counterparty_id: '',
          internal_account_id: '',
          debit_ledger_account_id: '',
          credit_ledger_account_id: '',
          metadata: {},
          account_details: [],
          routing_details: [],
        },
  });

  const { data: internalAccounts } = useInternalAccounts();
  const { data: counterparties } = useCounterparties();

  const [accountDetails, setAccountDetails] = useState<AccountDetail[]>(
    initialValues?.account_details || [],
  );
  const [routingDetails, setRoutingDetails] = useState<RoutingDetail[]>(
    initialValues?.routing_details || [],
  );

  const handleAddAccountDetail = () => {
    setAccountDetails([...accountDetails, { id: '', account_number: '', account_number_type: 'other' }]);
  };

  const handleAddRoutingDetail = () => {
    setRoutingDetails([...routingDetails, { id: '', routing_number: '', routing_number_type: 'aba', payment_type: 'ach' }]);
  };

  React.useEffect(() => {
    reset(
      initialValues
        ? {
            name: initialValues.name,
            description: initialValues.description,
            counterparty_id: initialValues.counterparty_id,
            internal_account_id: initialValues.internal_account_id,
            debit_ledger_account_id: initialValues.debit_ledger_account_id,
            credit_ledger_account_id: initialValues.credit_ledger_account_id,
            metadata: initialValues.metadata,
            account_details: initialValues.account_details,
            routing_details: initialValues.routing_details,
          }
        : {
            name: '',
            description: '',
            counterparty_id: '',
            internal_account_id: '',
            debit_ledger_account_id: '',
            credit_ledger_account_id: '',
            metadata: {},
            account_details: [],
            routing_details: [],
          },
    );
    setAccountDetails(initialValues?.account_details || []);
    setRoutingDetails(initialValues?.routing_details || []);
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <div className="error-message">{error}</div>}

      <Input
        label="Name"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />

      <Input
        label="Description"
        {...register('description')}
      />

       {/* Counterparty Select - Assuming you have a Select component */}
       {counterparties && (
          <div className="form-group">
            <label htmlFor="counterparty_id">Counterparty</label>
            <select
              {...register('counterparty_id')}
              id="counterparty_id"
              className="form-control"
            >
              <option value="">Select a Counterparty</option>
              {counterparties.map((counterparty) => (
                <option key={counterparty.id} value={counterparty.id}>
                  {counterparty.name}
                </option>
              ))}
            </select>
          </div>
        )}


      {/* Internal Account Select */}
      {internalAccounts && (
        <div className="form-group">
          <label htmlFor="internal_account_id">Internal Account</label>
          <select
            {...register('internal_account_id', {
              required: 'Internal Account is required',
            })}
            id="internal_account_id"
            className="form-control"
          >
            <option value="">Select an Internal Account</option>
            {internalAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {errors.internal_account_id?.message && (
            <p className="error-message">{errors.internal_account_id.message}</p>
          )}
        </div>
      )}

      {/* Debit Ledger Account ID Input */}
      <Input
        label="Debit Ledger Account ID"
        {...register('debit_ledger_account_id')}
      />

      {/* Credit Ledger Account ID Input */}
      <Input
        label="Credit Ledger Account ID"
        {...register('credit_ledger_account_id')}
      />

      {/* Account Details */}
      {accountDetails.map((detail, index) => (
        <div key={index} className="account-detail-item">
          <Input
            label={`Account Number ${index + 1}`}
            {...register(`account_details.${index}.account_number` as 'account_details[].account_number')}
            // error={errors.account_details?.[index]?.account_number?.message}
          />
           <div className="form-group">
                <label htmlFor={`account_details.${index}.account_number_type`}>Account Number Type</label>
                <select
                  {...register(`account_details.${index}.account_number_type` as 'account_details[].account_number_type')}
                  id={`account_details.${index}.account_number_type`}
                  className="form-control"
                >
                  <option value="iban">IBAN</option>
                  <option value="clabe">CLABE</option>
                  <option value="wallet_address">Wallet Address</option>
                  <option value="pan">PAN</option>
                  <option value="other">Other</option>
                </select>
          </div>
        </div>
      ))}
      <Button type="button" onClick={handleAddAccountDetail}>
        Add Account Detail
      </Button>

      {/* Routing Details */}
      {routingDetails.map((detail, index) => (
        <div key={index} className="routing-detail-item">
          <Input
            label={`Routing Number ${index + 1}`}
            {...register(`routing_details.${index}.routing_number` as 'routing_details[].routing_number')}
          />
          <div className="form-group">
            <label htmlFor={`routing_details.${index}.routing_number_type`}>Routing Number Type</label>
            <select
              {...register(`routing_details.${index}.routing_number_type` as 'routing_details[].routing_number_type')}
              id={`routing_details.${index}.routing_number_type`}
              className="form-control"
            >
              <option value="aba">ABA</option>
              <option value="swift">SWIFT</option>
            </select>
          </div>
           <div className="form-group">
                <label htmlFor={`routing_details.${index}.payment_type`}>Payment Type</label>
                <select
                  {...register(`routing_details.${index}.payment_type` as 'routing_details[].payment_type')}
                  id={`routing_details.${index}.payment_type`}
                  className="form-control"
                >
                  <option value="ach">ACH</option>
                  <option value="wire">Wire</option>
                </select>
          </div>
        </div>
      ))}
      <Button type="button" onClick={handleAddRoutingDetail}>
        Add Routing Detail
      </Button>



      {/* Metadata - Assuming a simple key/value input */}
      {/* <Input
        label="Metadata (Key)"
        {...register('metadata.key')}
      />

      <Input
        label="Metadata (Value)"
        {...register('metadata.value')}
      /> */}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : initialValues ? 'Update' : 'Create'}
      </Button>
    </form>
  );
};

export default VirtualAccountForm;