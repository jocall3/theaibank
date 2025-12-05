import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMoneyMovement } from '../../hooks/useMoneyMovement'; // Adjust path as needed
import {
  StandingInstructions,
  RetrievePaymentInitiationTransactionRepeatingPaymentsResponse,
  UpdatePaymentInitiationTransactionRepeatingPaymentsPreprocessRequest,
  UpdatePaymentInitiationTransactionRepeatingPaymentsPreprocessResponse,
  UpdatePaymentInitiationTransactionRepeatingPaymentsConfirmationRequest,
  UpdatePaymentInitiationTransactionRepeatingPaymentsConfirmationResponse,
  FutureDatedTransaction,
  StandingInstruction,
  ErrorResponse,
} from '../../sdk/citibank-money-movement'; // Interfaces are in the SDK file

interface CitibankStandingInstructionsViewProps {
  // Any props if needed, e.g., initial filters
}

const CitibankStandingInstructionsView: React.FC<CitibankStandingInstructionsViewProps> = () => {
  const { api, accessToken, uuid, generateNewUuid } = useMoneyMovement(); // Use the context hook

  const [instructions, setInstructions] = useState<StandingInstructions[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateEditModal, setShowCreateEditModal] = useState<boolean>(false);
  const [editingInstruction, setEditingInstruction] = useState<StandingInstructions | null>(null);

  // Initial state for the form, matching UpdatePaymentInitiationTransactionRepeatingPaymentsPreprocessRequest
  const initialFormState: UpdatePaymentInitiationTransactionRepeatingPaymentsPreprocessRequest = {
    accountId: '',
    paymentMethod: '',
    transactionReferenceId: '', // Will be generated for new, or from editingInstruction for update
    transactionAmount: 0,
    standingInstruction: {
      standingInstructionStartDate: '',
      paymentFrequency: '',
      perpetualFlag: false,
      standingInstructionEndDate: '',
    },
    remarks: '',
    // bankSortCode is optional, not included in form for simplicity unless explicitly needed
  };
  const [formState, setFormState] = useState<UpdatePaymentInitiationTransactionRepeatingPaymentsPreprocessRequest>(initialFormState);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [instructionToDelete, setInstructionToDelete] = useState<StandingInstructions | null>(null);

  // Memoized lists for dropdowns
  const paymentFrequencies = useMemo(() => ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALFYEARLY', 'YEARLY'], []);
  const paymentMethods = useMemo(() => ['INTERNAL_DOMESTIC', 'EXTERNAL_DOMESTIC', 'BILL_PAYMENT', 'SEPA', 'CROSS_BORDER_WIRE', 'CITI_GLOBAL'], []);

  const fetchInstructions = useCallback(async () => {
    if (!api || !accessToken || !uuid) {
      setError('API client not initialized or access token/UUID missing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response: RetrievePaymentInitiationTransactionRepeatingPaymentsResponse =
        await api.retrievePaymentInitiationTransactionRepeatingPayments(accessToken, uuid);
      setInstructions(response.standingInstructions || []);
    } catch (err: any) {
      console.error('Failed to fetch standing instructions:', err);
      // Attempt to parse error details if it's an Axios error with a response
      const errorMessage = err.response?.data?.errors?.[0]?.details || err.message || 'An unknown error occurred while fetching instructions.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, accessToken, uuid]);

  useEffect(() => {
    fetchInstructions();
  }, [fetchInstructions]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('standingInstruction.')) {
      const subFieldName = name.split('.')[1] as keyof StandingInstruction;
      setFormState(prevState => ({
        ...prevState,
        standingInstruction: {
          ...prevState.standingInstruction!,
          [subFieldName]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      }));
    } else {
      setFormState(prevState => ({
        ...prevState,
        [name]: type === 'number' ? parseFloat(value) : value,
      }));
    }
  };

  const openCreateModal = () => {
    setEditingInstruction(null);
    setFormState({
      ...initialFormState,
      transactionReferenceId: crypto.randomUUID(), // Generate new ID for creation
      standingInstruction: { // Ensure standingInstruction is initialized
        standingInstructionStartDate: '',
        paymentFrequency: '',
        perpetualFlag: false,
        standingInstructionEndDate: '',
      },
    });
    setShowCreateEditModal(true);
  };

  const openEditModal = (instruction: StandingInstructions) => {
    setEditingInstruction(instruction);
    setFormState({
      accountId: instruction.accountId,
      paymentMethod: instruction.paymentMethod,
      transactionReferenceId: instruction.transactionReferenceId,
      transactionAmount: instruction.transactionAmount,
      standingInstruction: {
        standingInstructionStartDate: instruction.standingInstruction?.standingInstructionStartDate || '',
        paymentFrequency: instruction.standingInstruction?.paymentFrequency || '',
        perpetualFlag: instruction.standingInstruction?.perpetualFlag || false,
        standingInstructionEndDate: instruction.standingInstruction?.standingInstructionEndDate || '',
      },
      remarks: instruction.remarks || '',
      // bankSortCode, if present in instruction, would need to be mapped here
    });
    setShowCreateEditModal(true);
  };

  const closeCreateEditModal = () => {
    setShowCreateEditModal(false);
    setEditingInstruction(null);
    setError(null); // Clear any modal-specific errors
    setFormState(initialFormState); // Reset form state
  };

  const handleCreateEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !accessToken || !uuid) {
      setError('API client not initialized or access token/UUID missing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare the request body, ensuring numeric types and handling perpetualFlag for endDate
      const requestBody: UpdatePaymentInitiationTransactionRepeatingPaymentsPreprocessRequest = {
        ...formState,
        transactionAmount: formState.transactionAmount || 0, // Ensure it's a number
        standingInstruction: {
          ...formState.standingInstruction!,
          // If perpetual, end date should not be sent. Otherwise, ensure it's a string.
          standingInstructionEndDate: formState.standingInstruction?.perpetualFlag
            ? undefined
            : formState.standingInstruction?.standingInstructionEndDate,
        },
      };

      // Step 1: Preprocess
      const preprocessResponse: UpdatePaymentInitiationTransactionRepeatingPaymentsPreprocessResponse =
        await api.updatePaymentInitiationTransactionRepeatingPaymentsPreprocess(accessToken, uuid, requestBody);

      if (!preprocessResponse.controlFlowId) {
        throw new Error('Preprocess failed: No controlFlowId received.');
      }

      // Step 2: Confirmation
      const confirmationResponse: UpdatePaymentInitiationTransactionRepeatingPaymentsConfirmationResponse =
        await api.updatePaymentInitiationTransactionRepeatingPaymentsConfirmation(accessToken, uuid, {
          controlFlowId: preprocessResponse.controlFlowId,
        });

      if (confirmationResponse.transactionReferenceId) {
        alert(`Standing instruction ${editingInstruction ? 'updated' : 'created'} successfully! Reference ID: ${confirmationResponse.transactionReferenceId}`);
        fetchInstructions(); // Refresh the list
        closeCreateEditModal();
      } else {
        throw new Error('Confirmation failed: No transactionReferenceId received.');
      }
    } catch (err: any) {
      console.error(`Failed to ${editingInstruction ? 'update' : 'create'} standing instruction:`, err);
      // Attempt to parse error details if it's an Axios error with a response
      const errorMessage = err.response?.data?.errors?.[0]?.details || err.message || `Failed to ${editingInstruction ? 'update' : 'create'} standing instruction.`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteConfirmModal = (instruction: StandingInstructions) => {
    setInstructionToDelete(instruction);
    setShowDeleteConfirmModal(true);
  };

  const closeDeleteConfirmModal = () => {
    setInstructionToDelete(null);
    setShowDeleteConfirmModal(false);
    setError(null); // Clear any modal-specific errors
  };

  const confirmDelete = async () => {
    if (!api || !accessToken || !uuid || !instructionToDelete) {
      setError('API client not initialized or instruction to delete missing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.terminatePaymentInitiationTransactionRepeatingPayments(
        accessToken,
        uuid,
        instructionToDelete.accountId,
        instructionToDelete.transactionReferenceId
      );
      alert('Standing instruction deleted successfully!');
      fetchInstructions(); // Refresh the list
      closeDeleteConfirmModal();
    } catch (err: any) {
      console.error('Failed to delete standing instruction:', err);
      const errorMessage = err.response?.data?.errors?.[0]?.details || err.message || 'Failed to delete standing instruction.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Standing Instructions</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <button
        onClick={openCreateModal}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add New Standing Instruction
      </button>

      {isLoading && <p>Loading instructions...</p>}

      {!isLoading && instructions.length === 0 && <p>No standing instructions found.</p>}

      {!isLoading && instructions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Reference ID</th>
                <th className="py-2 px-4 border-b text-left">Account ID</th>
                <th className="py-2 px-4 border-b text-left">Payee</th>
                <th className="py-2 px-4 border-b text-right">Amount</th>
                <th className="py-2 px-4 border-b text-left">Method</th>
                <th className="py-2 px-4 border-b text-left">Frequency</th>
                <th className="py-2 px-4 border-b text-left">Start Date</th>
                <th className="py-2 px-4 border-b text-left">End Date</th>
                <th className="py-2 px-4 border-b text-center">Perpetual</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructions.map((inst) => (
                <tr key={inst.transactionReferenceId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{inst.transactionReferenceId}</td>
                  <td className="py-2 px-4 border-b">{inst.accountId}</td>
                  <td className="py-2 px-4 border-b">{inst.payee || 'N/A'}</td>
                  <td className="py-2 px-4 border-b text-right">{inst.transactionAmount.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{inst.paymentMethod.replace(/_/g, ' ')}</td>
                  <td className="py-2 px-4 border-b">{inst.standingInstruction?.paymentFrequency || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{inst.standingInstruction?.standingInstructionStartDate || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{inst.standingInstruction?.standingInstructionEndDate || 'N/A'}</td>
                  <td className="py-2 px-4 border-b text-center">{inst.standingInstruction?.perpetualFlag ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => openEditModal(inst)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white text-sm py-1 px-2 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirmModal(inst)}
                      className="bg-red-500 hover:bg-red-700 text-white text-sm py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{editingInstruction ? 'Edit' : 'Add New'} Standing Instruction</h3>
            <form onSubmit={handleCreateEditSubmit}>
              <div className="mb-4">
                <label htmlFor="accountId" className="block text-gray-700 text-sm font-bold mb-2">
                  Account ID:
                </label>
                <input
                  type="text"
                  id="accountId"
                  name="accountId"
                  value={formState.accountId}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="paymentMethod" className="block text-gray-700 text-sm font-bold mb-2">
                  Payment Method:
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formState.paymentMethod}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="transactionAmount" className="block text-gray-700 text-sm font-bold mb-2">
                  Amount:
                </label>
                <input
                  type="number"
                  id="transactionAmount"
                  name="transactionAmount"
                  value={formState.transactionAmount}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="standingInstruction.standingInstructionStartDate" className="block text-gray-700 text-sm font-bold mb-2">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="standingInstruction.standingInstructionStartDate"
                  name="standingInstruction.standingInstructionStartDate"
                  value={formState.standingInstruction?.standingInstructionStartDate || ''}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="standingInstruction.paymentFrequency" className="block text-gray-700 text-sm font-bold mb-2">
                  Frequency:
                </label>
                <select
                  id="standingInstruction.paymentFrequency"
                  name="standingInstruction.paymentFrequency"
                  value={formState.standingInstruction?.paymentFrequency || ''}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Frequency</option>
                  {paymentFrequencies.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="standingInstruction.perpetualFlag"
                  name="standingInstruction.perpetualFlag"
                  checked={formState.standingInstruction?.perpetualFlag || false}
                  onChange={handleFormChange}
                  className="mr-2 leading-tight"
                />
                <label htmlFor="standingInstruction.perpetualFlag" className="text-gray-700 text-sm font-bold">
                  Perpetual Payment
                </label>
              </div>
              {!formState.standingInstruction?.perpetualFlag && (
                <div className="mb-4">
                  <label htmlFor="standingInstruction.standingInstructionEndDate" className="block text-gray-700 text-sm font-bold mb-2">
                    End Date:
                  </label>
                  <input
                    type="date"
                    id="standingInstruction.standingInstructionEndDate"
                    name="standingInstruction.standingInstructionEndDate"
                    value={formState.standingInstruction?.standingInstructionEndDate || ''}
                    onChange={handleFormChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required={!formState.standingInstruction?.perpetualFlag}
                  />
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="remarks" className="block text-gray-700 text-sm font-bold mb-2">
                  Remarks:
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formState.remarks || ''}
                  onChange={handleFormChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeCreateEditModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : (editingInstruction ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete the standing instruction with Reference ID:{' '}
              <strong>{instructionToDelete?.transactionReferenceId}</strong>?
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeDeleteConfirmModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitibankStandingInstructionsView;