```tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

// Type definitions based on the OpenAPI specification
interface Address {
    line1: string | null;
    line2: string | null;
    locality: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
}

interface AccountDetail {
    account_number: string;
    account_number_type: 'iban' | 'clabe' | 'wallet_address' | 'pan' | 'other';
}

interface RoutingDetail {
    routing_number: string;
    routing_number_type: 'aba' | 'swift' | 'au_bsb' | 'ca_cpa' | 'cnaps' | 'gb_sort_code' | 'in_ifsc' | 'my_branch_code' | 'br_codigo';
    payment_type?: 'ach' | 'au_becs' | 'bacs' | 'book' | 'card' | 'check' | 'eft' | 'cross_border' | 'interac' | 'masav' | 'neft' | 'provxchange' | 'rtp' | 'sen' | 'sepa' | 'signet' | 'wire';
}

interface ExternalAccount {
    name: string | null;
    party_name: string;
    party_type: 'business' | 'individual' | null;
    party_address?: Address;
    account_type: 'cash' | 'checking' | 'loan' | 'non_resident' | 'other' | 'overdraft' | 'savings';
    account_details: AccountDetail[];
    routing_details: RoutingDetail[];
    metadata?: { [key: string]: string };
}

export interface CounterpartyFormData {
    name: string | null;
    email: string | null;
    send_remittance_advice: boolean;
    taxpayer_identifier?: string;
    accounts: ExternalAccount[];
    metadata?: { [key: string]: string };
}

interface CounterpartyFormProps {
    initialData?: Partial<CounterpartyFormData>;
    onSubmit: (data: CounterpartyFormData) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    mode?: 'create' | 'edit';
}

const defaultAccount: ExternalAccount = {
    name: '',
    party_name: '',
    party_type: 'business',
    party_address: {
        line1: '',
        line2: '',
        locality: '',
        region: '',
        postal_code: '',
        country: '',
    },
    account_type: 'checking',
    account_details: [{ account_number: '', account_number_type: 'other' }],
    routing_details: [{ routing_number: '', routing_number_type: 'aba' }],
    metadata: {},
};

const defaultFormData: CounterpartyFormData = {
    name: '',
    email: '',
    send_remittance_advice: false,
    taxpayer_identifier: '',
    accounts: [],
    metadata: {},
};

const CounterpartyForm: React.FC<CounterpartyFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false,
    mode = 'create'
}) => {
    const [formData, setFormData] = useState<CounterpartyFormData>(defaultFormData);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...defaultFormData,
                ...initialData,
                accounts: initialData.accounts || [],
                send_remittance_advice: initialData.send_remittance_advice ?? false,
            });
        }
    }, [initialData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // --- Account Handlers ---

    const addAccount = () => {
        setFormData(prev => ({
            ...prev,
            accounts: [...prev.accounts, { ...defaultAccount, party_name: prev.name || '' }],
        }));
    };

    const removeAccount = (index: number) => {
        setFormData(prev => ({
            ...prev,
            accounts: prev.accounts.filter((_, i) => i !== index),
        }));
    };

    const handleAccountChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedAccounts = formData.accounts.map((account, i) => 
            i === index ? { ...account, [name]: value } : account
        );
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };

    const handleAddressChange = (accIndex: number, e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedAccounts = formData.accounts.map((account, i) => {
            if (i !== accIndex) return account;
            const newAddress = { ...(account.party_address || {}), [name]: value };
            return { ...account, party_address: newAddress as Address };
        });
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };

    // --- Account Detail Handlers ---

    const addAccountDetail = (accIndex: number) => {
        const updatedAccounts = formData.accounts.map((account, i) => {
            if (i !== accIndex) return account;
            return { ...account, account_details: [...account.account_details, { account_number: '', account_number_type: 'other' }] };
        });
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };

    const removeAccountDetail = (accIndex: number, detailIndex: number) => {
        const updatedAccounts = formData.accounts.map((account, i) => {
            if (i !== accIndex) return account;
            return { ...account, account_details: account.account_details.filter((_, j) => j !== detailIndex) };
        });
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };

    const handleAccountDetailChange = (accIndex: number, detailIndex: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedAccounts = formData.accounts.map((account, i) => {
            if (i !== accIndex) return account;
            const newDetails = account.account_details.map((detail, j) => 
                j === detailIndex ? { ...detail, [name]: value } : detail
            );
            return { ...account, account_details: newDetails };
        });
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };

    // --- Routing Detail Handlers ---

    const addRoutingDetail = (accIndex: number) => {
        const updatedAccounts = formData.accounts.map((account, i) => {
            if (i !== accIndex) return account;
            return { ...account, routing_details: [...account.routing_details, { routing_number: '', routing_number_type: 'aba' }] };
        });
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };

    const removeRoutingDetail = (accIndex: number, routingIndex: number) => {
        const updatedAccounts = formData.accounts.map((account, i) => {
            if (i !== accIndex) return account;
            return { ...account, routing_details: account.routing_details.filter((_, j) => j !== routingIndex) };
        });
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };

    const handleRoutingDetailChange = (accIndex: number, routingIndex: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedAccounts = formData.accounts.map((account, i) => {
            if (i !== accIndex) return account;
            const newRouting = account.routing_details.map((detail, j) => 
                j === routingIndex ? { ...detail, [name]: value } : detail
            );
            return { ...account, routing_details: newRouting };
        });
        setFormData(prev => ({ ...prev, accounts: updatedAccounts }));
    };


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const styles = {
        form: { fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '800px', margin: 'auto' },
        section: { border: '1px solid #eee', padding: '15px', borderRadius: '5px', marginBottom: '20px' },
        sectionHeader: { marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' },
        inputGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' as const },
        label: { marginBottom: '5px', fontWeight: 'bold' },
        input: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' },
        button: { padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', fontSize: '1rem' },
        primaryButton: { backgroundColor: '#007bff', color: 'white' },
        secondaryButton: { backgroundColor: '#6c757d', color: 'white' },
        dangerButton: { backgroundColor: '#dc3545', color: 'white' },
        buttonGroup: { marginTop: '20px' },
        flexRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h2>{mode === 'create' ? 'Create Counterparty' : 'Edit Counterparty'}</h2>

            <div style={styles.section}>
                <h3 style={styles.sectionHeader}>Counterparty Details</h3>
                <div style={styles.inputGroup}>
                    <label htmlFor="name" style={styles.label}>Name</label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>Email</label>
                    <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="taxpayer_identifier" style={styles.label}>Taxpayer Identifier (SSN/EIN)</label>
                    <input type="text" id="taxpayer_identifier" name="taxpayer_identifier" value={formData.taxpayer_identifier || ''} onChange={handleChange} style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                    <div style={styles.flexRow}>
                        <input type="checkbox" id="send_remittance_advice" name="send_remittance_advice" checked={formData.send_remittance_advice} onChange={handleChange} />
                        <label htmlFor="send_remittance_advice" style={{...styles.label, marginBottom: 0 }}>Send Remittance Advice</label>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionHeader}>Accounts</h3>
                {formData.accounts.map((account, accIndex) => (
                    <div key={accIndex} style={{...styles.section, borderStyle: 'dashed'}}>
                        <div style={styles.flexRow}>
                            <h4 style={{flexGrow: 1}}>Account {accIndex + 1}</h4>
                            <button type="button" onClick={() => removeAccount(accIndex)} style={{...styles.button, ...styles.dangerButton}}>Remove Account</button>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Account Nickname</label>
                            <input type="text" name="name" value={account.name || ''} onChange={(e) => handleAccountChange(accIndex, e)} style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Legal Name on Account</label>
                            <input type="text" name="party_name" value={account.party_name} onChange={(e) => handleAccountChange(accIndex, e)} required style={styles.input} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Party Type</label>
                            <select name="party_type" value={account.party_type || ''} onChange={(e) => handleAccountChange(accIndex, e)} style={styles.input}>
                                <option value="business">Business</option>
                                <option value="individual">Individual</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Account Type</label>
                             <select name="account_type" value={account.account_type} onChange={(e) => handleAccountChange(accIndex, e)} style={styles.input}>
                                <option value="checking">Checking</option>
                                <option value="savings">Savings</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <h5>Party Address</h5>
                        <input name="line1" placeholder="Line 1" value={account.party_address?.line1 || ''} onChange={e => handleAddressChange(accIndex, e)} style={{...styles.input, marginBottom: '10px'}} />
                        <input name="line2" placeholder="Line 2 (optional)" value={account.party_address?.line2 || ''} onChange={e => handleAddressChange(accIndex, e)} style={{...styles.input, marginBottom: '10px'}} />
                        <div style={{...styles.flexRow, gap: '10px', marginBottom: '10px'}}>
                            <input name="locality" placeholder="City" value={account.party_address?.locality || ''} onChange={e => handleAddressChange(accIndex, e)} style={styles.input} />
                            <input name="region" placeholder="State/Region" value={account.party_address?.region || ''} onChange={e => handleAddressChange(accIndex, e)} style={styles.input} />
                        </div>
                        <div style={{...styles.flexRow, gap: '10px', marginBottom: '10px'}}>
                            <input name="postal_code" placeholder="Postal Code" value={account.party_address?.postal_code || ''} onChange={e => handleAddressChange(accIndex, e)} style={styles.input} />
                            <input name="country" placeholder="Country (2-letter)" value={account.party_address?.country || ''} onChange={e => handleAddressChange(accIndex, e)} style={styles.input} />
                        </div>
                        
                        <h5>Account Numbers</h5>
                        {account.account_details.map((detail, detailIndex) => (
                             <div key={detailIndex} style={{ ...styles.flexRow, marginBottom: '10px' }}>
                                <input name="account_number" value={detail.account_number} onChange={e => handleAccountDetailChange(accIndex, detailIndex, e)} placeholder="Account Number" required style={{...styles.input, flex: 2}} />
                                <select name="account_number_type" value={detail.account_number_type} onChange={e => handleAccountDetailChange(accIndex, detailIndex, e)} style={{...styles.input, flex: 1}}>
                                    <option value="other">Other</option>
                                    <option value="iban">IBAN</option>
                                    <option value="clabe">CLABE</option>
                                </select>
                                <button type="button" onClick={() => removeAccountDetail(accIndex, detailIndex)} style={{...styles.button, ...styles.dangerButton, padding: '5px 10px'}}>X</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addAccountDetail(accIndex)} style={{...styles.button, ...styles.secondaryButton}}>+ Add Account Number</button>

                        <h5 style={{marginTop: '20px'}}>Routing Numbers</h5>
                        {account.routing_details.map((detail, routingIndex) => (
                             <div key={routingIndex} style={{ ...styles.flexRow, marginBottom: '10px' }}>
                                <input name="routing_number" value={detail.routing_number} onChange={e => handleRoutingDetailChange(accIndex, routingIndex, e)} placeholder="Routing Number" required style={{...styles.input, flex: 2}} />
                                <select name="routing_number_type" value={detail.routing_number_type} onChange={e => handleRoutingDetailChange(accIndex, routingIndex, e)} style={{...styles.input, flex: 1}}>
                                    <option value="aba">ABA</option>
                                    <option value="swift">SWIFT</option>
                                    <option value="ca_cpa">CA CPA</option>
                                </select>
                                <button type="button" onClick={() => removeRoutingDetail(accIndex, routingIndex)} style={{...styles.button, ...styles.dangerButton, padding: '5px 10px'}}>X</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addRoutingDetail(accIndex)} style={{...styles.button, ...styles.secondaryButton}}>+ Add Routing Number</button>
                    </div>
                ))}
                <button type="button" onClick={addAccount} style={{...styles.button, ...styles.secondaryButton}}>+ Add Account</button>
            </div>

            <div style={styles.buttonGroup}>
                <button type="submit" disabled={isSubmitting} style={{...styles.button, ...styles.primaryButton}}>
                    {isSubmitting ? 'Saving...' : 'Save Counterparty'}
                </button>
                <button type="button" onClick={onCancel} style={{...styles.button, ...styles.secondaryButton}}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default CounterpartyForm;
```