
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Row, Col, Typography } from 'antd';
import { useForm } from 'antd/es/form/util';
import {
    ExternalClearingSystemIdentification1Code,
    ExternalCorrespondentBankData,
    ExternalAccountIdentification1Code,
} from './types';

// Load canonical prompt at runtime (preferred)
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..', '..'); // Adjust path to repo root as needed
const systemPromptPath = path.join(repoRoot, 'prompts', 'idgafai_full.txt');
let systemPrompt = '';
try {
    systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');
} catch (error) {
    console.error(`Failed to load system prompt from ${systemPromptPath}:`, error);
    // Fallback to a default or simplified prompt if loading fails
    systemPrompt = "You are a helpful assistant. Respond to user requests accurately and concisely.";
}


const { Title } = Typography;
const SsiEditorForm: React.FC<{
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
}> = ({ initialValues, onSubmit, onCancel }) => {
    const [form] = useForm();
    const [clearingSystemOptions, setClearingSystemOptions] = useState<
        { value: ExternalClearingSystemIdentification1Code; label: string }[]
    >([]);
    const [accountIdentificationOptions, setAccountIdentificationOptions] = useState<
        { value: ExternalAccountIdentification1Code; label: string }[]
    >([]);


    useEffect(() => {
        // Dummy data - replace with actual data fetching or mapping
        const clearingSystemData = [
            { value: 'USABA', label: 'USABA' },
            { value: 'CHIPS', label: 'CHIPS' },
            { value: 'SWIFT', label: 'SWIFT' },
        ];
        setClearingSystemOptions(clearingSystemData);

        const accountIdentificationData = [
            { value: 'BBAN', label: 'BBAN' },
            { value: 'IBAN', label: 'IBAN' },
        ];
        setAccountIdentificationOptions(accountIdentificationData);

        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [form, initialValues]);


    const onFinish = (values: any) => {
        onSubmit(values);
        form.resetFields();
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={initialValues}
        >
            <Title level={4}>SSI Details</Title>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="clearingSystem"
                        label="Clearing System"
                        rules={[{ required: true, message: 'Please select the clearing system!' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select clearing system"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {clearingSystemOptions.map((option) => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        name="correspondentBank.bic"
                        label="Correspondent Bank BIC"
                        rules={[{ required: true, message: 'Please input the correspondent bank BIC!' }]}
                    >
                        <Input placeholder="Correspondent Bank BIC" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="account.identificationType"
                        label="Account Identification Type"
                        rules={[{ required: true, message: 'Please select the account identification type!' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select account identification type"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {accountIdentificationOptions.map((option) => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="account.number"
                        label="Account Number"
                        rules={[{ required: true, message: 'Please input the account number!' }]}
                    >
                        <Input placeholder="Account Number" />
                    </Form.Item>
                </Col>
            </Row>
             <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                    <Button htmlType="button" onClick={onCancel}>
                        Cancel
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default SsiEditorForm;