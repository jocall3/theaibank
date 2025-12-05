```typescript
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Define types for the mock Stripe data
interface StripeResource {
  account?: any;
  account_link?: any;
  apple_pay_domain?: any;
  application_fee?: any;
  appsSecret?: any;
  balance?: any;
  balance_transaction?: any;
  bank_account?: any;
  billingPortalConfiguration?: any;
  billingPortalSession?: any;
  capability?: any;
  card?: any;
  cash_balance?: any;
  charge?: any;
  checkoutSession?: any;
  countrySpec?: any;
  coupon?: any;
  creditNote?: any;
  creditNoteLineItem?: any;
  customer?: any;
  customerBalanceTransaction?: any;
  customerCashBalanceTransaction?: any;
  deletedAccount?: any;
  deletedApplePayDomain?: any;
  deletedCoupon?: any;
  deletedCustomer?: any;
  deletedDiscount?: any;
  deletedExternalAccount?: any;
  deletedInvoice?: any;
  deletedInvoiceitem?: any;
  deletedPaymentSource?: any;
  deletedPerson?: any;
  deletedPlan?: any;
  deletedProduct?: any;
  deletedRadarValueList?: any;
  deletedRadarValueListItem?: any;
  deletedSubscriptionItem?: any;
  deletedTaxId?: any;
  deletedTerminalConfiguration?: any;
  deletedTerminalLocation?: any;
  deletedTerminalReader?: any;
  deletedTestHelpersTestClock?: any;
  deletedWebhookEndpoint?: any;
  discount?: any;
  dispute?: any;
  ephemeralKey?: any;
  event?: any;
  exchangeRate?: any;
  externalAccount?: any;
  feeRefund?: any;
  file?: any;
  fileLink?: any;
  financialConnectionsAccount?: any;
  financialConnectionsAccountOwner?: any;
  financialConnectionsSession?: any;
  fundingInstructions?: any;
  identityVerificationReport?: any;
  identityVerificationSession?: any;
  invoice?: any;
  invoiceitem?: any;
  issuingAuthorization?: any;
  issuingCard?: any;
  issuingCardholder?: any;
  issuingDispute?: any;
  issuingSettlement?: any;
  issuingTransaction?: any;
  item?: any;
  lineItem?: any;
  loginLink?: any;
  mandate?: any;
  paymentIntent?: any;
  paymentLink?: any;
  paymentMethod?: any;
  paymentSource?: any;
  payout?: any;
  person?: any;
  plan?: any;
  price?: any;
  product?: any;
  promotionCode?: any;
  quote?: any;
  radarEarlyFraudWarning?: any;
  radarValueList?: any;
  radarValueListItem?: any;
  refund?: any;
  reportingReportRun?: any;
  reportingReportType?: any;
  review?: any;
  scheduledQueryRun?: any;
  setupAttempt?: any;
  setupIntent?: any;
  shippingRate?: any;
  source?: any;
  sourceMandateNotification?: any;
  sourceTransaction?: any;
  subscription?: any;
  subscriptionItem?: any;
  subscriptionSchedule?: any;
  taxCode?: any;
  taxId?: any;
  taxRate?: any;
  terminalConfiguration?: any;
  terminalConnectionToken?: any;
  terminalLocation?: any;
  terminalReader?: any;
  testHelpersTestClock?: any;
  token?: any;
  topup?: any;
  transfer?: any;
  transferReversal?: any;
  treasuryCreditReversal?: any;
  treasuryDebitReversal?: any;
  treasuryFinancialAccount?: any;
  treasuryFinancialAccountFeatures?: any;
  treasuryInboundTransfer?: any;
  treasuryOutboundPayment?: any;
  treasuryOutboundTransfer?: any;
  treasuryReceivedCredit?: any;
  treasuryReceivedDebit?: any;
  treasuryTransaction?: any;
  treasuryTransactionEntry?: any;
  webhookEndpoint?: any;
  accountNotice?: any;
  accountSession?: any;
  application?: any;
  balanceSettings?: any;
  billingAlert?: any;
  billingAlertTriggered?: any;
  billingCreditBalanceSummary?: any;
  billingCreditBalanceTransaction?: any;
  billingCreditGrant?: any;
  billingMeter?: any;
  billingMeterEvent?: any;
  billingMeterEventAdjustment?: any;
  billingMeterEventSummary?: any;
  capitalFinancingOffer?: any;
  capitalFinancingSummary?: any;
  capitalFinancingTransaction?: any;
  climateOrder?: any;
  climateProduct?: any;
  climateSupplier?: any;
  confirmationToken?: any;
  customerSession?: any;
  deletedApplication?: any;
  deletedBankAccount?: any;
  deletedCard?: any;
  deletedPrice?: any;
  deletedProductFeature?: any;
  entitlementsActiveEntitlement?: any;
  entitlementsActiveEntitlementSummary?: any;
  entitlementsFeature?: any;
  financialConnectionsAccountInferredBalance?: any;
  financialConnectionsAccountOwnership?: any;
  financialConnectionsInstitution?: any;
  financialConnectionsTransaction?: any;
  forwardingRequest?: any;
  fxQuote?: any;
  invoicePayment?: any;
  invoiceRenderingTemplate?: any;
  issuingCreditUnderwritingRecord?: any;
  issuingDisputeSettlementDetail?: any;
  issuingFraudLiabilityDebit?: any;
  issuingPersonalizationDesign?: any;
  issuingPhysicalBundle?: any;
  issuingToken?: any;
  margin?: any;
  order?: any;
  paymentAttemptRecord?: any;
  paymentIntentAmountDetailsLineItem?: any;
  paymentMethodConfiguration?: any;
  paymentMethodDomain?: any;
  paymentRecord?: any;
  privacyRedactionJob?: any;
  privacyRedactionJobValidationError?: any;
  productFeature?: any;
  quoteLine?: any;
  quotePreviewInvoice?: any;
  quotePreviewSubscriptionSchedule?: any;
  taxAssociation?: any;
  taxCalculation?: any;
  taxCalculationLineItem?: any;
  taxForm?: any;
  taxRegistration?: any;
  taxSettings?: any;
  taxTransaction?: any;
  taxTransactionLineItem?: any;
  terminalReaderCollectedData?: any;
  terminalOnboardingLink?: any;
  billingAnalyticsMeterUsage?: any;
  billingAnalyticsMeterUsageRow?: any;
  paymentMethodBalance?: any;
  delegatedCheckoutRequestedSession?: any;
  identityBlocklistEntry?: any;
  transitBalance?: any;
  issuingProgram?: any;
  balanceTransfer?: any;
  radarAccountEvaluation?: any;
  productCatalogTrialOffer?: any;
}



const mockStripeResources: StripeResource = {
  account: {
    business_profile: {
      mcc: null,
      name: null,
      product_description: null,
      support_address: {
        city: null,
        country: null,
        line1: null,
        line2: null,
        postal_code: null,
        state: null,
      },
      support_email: null,
      support_phone: null,
      support_url: null,
      url: null,
      minority_owned_business_designation: null,
    },
    business_type: null,
    capabilities: {
      card_payments: 'active',
      transfers: 'active',
    },
    charges_enabled: false,
    controller: {
      type: 'account',
    },
    country: 'US',
    created: 1234567890,
    default_currency: 'usd',
    details_submitted: false,
    email: 'site@stripe.com',
    external_accounts: {
      data: [],
      has_more: false,
      object: 'list',
      url: '/v1/accounts/acct_1MWlHDJITzLVzkSm/external_accounts',
    },
    future_requirements: {
      alternatives: [],
      current_deadline: null,
      currently_due: [
        'business_profile.product_description',
        'business_profile.support_phone',
        'business_profile.url',
        'external_account',
        'tos_acceptance.date',
        'tos_acceptance.ip',
      ],
      disabled_reason: null,
      errors: [],
      eventually_due: [
        'business_profile.product_description',
        'business_profile.support_phone',
        'business_profile.url',
        'external_account',
        'tos_acceptance.date',
        'tos_acceptance.ip',
      ],
      past_due: [],
      pending_verification: [],
    },
    id: 'acct_1MWlHDJITzLVzkSm',
    metadata: {},
    object: 'account',
    payouts_enabled: false,
    requirements: {
      alternatives: [],
      current_deadline: null,
      currently_due: [
        'business_profile.product_description',
        'business_profile.support_phone',
        'business_profile.url',
        'external_account',
        'tos_acceptance.date',
        'tos_acceptance.ip',
      ],
      disabled_reason: 'requirements.past_due',
      errors: [],
      eventually_due: [
        'business_profile.product_description',
        'business_profile.support_phone',
        'business_profile.url',
        'external_account',
        'tos_acceptance.date',
        'tos_acceptance.ip',
      ],
      past_due: [],
      pending_verification: [],
    },
    settings: {
      bacs_debit_payments: {
        display_name: null,
        service_user_number: null,
      },
      branding: {
        icon: null,
        logo: null,
        primary_color: null,
        secondary_color: null,
      },
      card_issuing: {
        tos_acceptance: {
          date: null,
          ip: null,
        },
      },
      card_payments: {
        decline_on: {
          avs_failure: true,
          cvc_failure: true,
        },
        statement_descriptor_prefix: null,
        statement_descriptor_prefix_kana: null,
        statement_descriptor_prefix_kanji: null,
      },
      dashboard: {
        display_name: null,
        timezone: 'Etc/UTC',
      },
      payments: {
        statement_descriptor: null,
        statement_descriptor_kana: null,
        statement_descriptor_kanji: null,
        statement_descriptor_prefix_kana: null,
        statement_descriptor_prefix_kanji: null,
      },
      payouts: {
        debit_negative_balances: true,
        schedule: {
          delay_days: 2,
          interval: 'daily',
        },
        statement_descriptor: null,
      },
      sepa_debit_payments: {},
    },
    tos_acceptance: {
      date: null,
      ip: null,
      user_agent: null,
    },
    type: 'standard',
  },
  account_link: {
    created: 1234567890,
    expires_at: 1234567890,
    object: 'account_link',
    url: '>-\n      https://rwashburne-manage-mydev.dev.stripe.me/setup/s/acct_1MWlHDJITzLVzkSm/Ep8ZlYAWJPc0',
  },
  apple_pay_domain: {
    created: 1234567890,
    domain_name: 'example.com',
    id: 'apwc_1MlLi1JITzLVzkSma2iSMoVr',
    livemode: true,
    object: 'apple_pay_domain',
  },
  application_fee: {
    account: 'acct_1MWlHDJITzLVzkSm',
    amount: 100,
    amount_refunded: 0,
    application: 'ca_NWOVPPSIVPD11hXgbABn38xeiYlTnzDZ',
    balance_transaction: 'txn_1MlLhiJITzLVzkSm0tDIM70A',
    charge: 'ch_1Mcd6UJITzLVzkSmp1XIBHoW',
    created: 1234567890,
    currency: 'usd',
    id: 'fee_1MlLiCJITzLVzkSmRgPvDzIk',
    livemode: false,
    object: 'application_fee',
    originating_transaction: null,
    refunded: false,
    refunds: {
      data: [],
      has_more: false,
      object: 'list',
      url: '/v1/application_fees/fee_1MlLiCJITzLVzkSmRgPvDzIk/refunds',
    },
    fee_source: {
      type: 'charge',
    },
  },
  appsSecret: {
    created: 1234567890,
    expires_at: 1234567890,
    id: 'appsecret_5110QzMIZ0005GiEH1m0419O8KAxCG',
    livemode: false,
    name: 'test-secret',
    object: 'apps.secret',
    scope: {
      type: 'account',
    },
  },
  balance: {
    available: [
      {
        amount: 0,
        currency: 'usd',
        source_types: {
          card: 0,
        },
      },
    ],
    connect_reserved: [
      {
        amount: 0,
        currency: 'usd',
      },
    ],
    livemode: false,
    object: 'balance',
    pending: [
      {
        amount: 0,
        currency: 'usd',
        source_types: {
          card: 0,
        },
      },
    ],
  },
  balance_transaction: {
    amount: 100,
    available_on: 1234567890,
    created: 1234567890,
    currency: 'usd',
    description: 'My First Test Charge (created for API docs)',
    exchange_rate: null,
    fee: 0,
    fee_details: [],
    id: 'txn_1MlLhiJITzLVzkSm0tDIM70A',
    net: 100,
    object: 'balance_transaction',
    reporting_category: 'charge',
    source: 'ch_1Mcd6UJITzLVzkSmp1XIBHoW',
    status: 'available',
    type: 'charge',
  },
  bank_account: {
    account_holder_name: 'Jane Austen',
    account_holder_type: 'company',
    account_type: null,
    bank_name: 'STRIPE TEST BANK',
    country: 'US',
    currency: 'usd',
    customer: null,
    fingerprint: 'I1e2zttmxgyFZKaM',
    id: 'ba_1Mcd6nJITzLVzkSm2CZD1tkj',
    last4: '3461',
    metadata: {},
    object: 'bank_account',
    routing_number: '110000000',
    status: 'new',
  },
  billingPortalConfiguration: {
    active: true,
    application: null,
    business_profile: {
      headline: null,
      privacy_policy_url: 'https://example.com/privacy',
      terms_of_service_url: 'https://example.com/terms',
    },
    created: 1234567890,
    default_return_url: null,
    features: {
      customer_update: {
        allowed_updates: ['email', 'tax_id'],
        enabled: true,
      },
      invoice_history: {
        enabled: true,
      },
      payment_method_update: {
        enabled: false,
        payment_method_configuration: null,
      },
      subscription_cancel: {
        cancellation_reason: {
          enabled: false,
          options: [],
        },
        enabled: false,
        mode: 'at_period_end',
        proration_behavior: 'none',
      },
      subscription_update: {
        default_allowed_updates: [],
        enabled: false,
        proration_behavior: 'none',
        schedule_at_period_end: {
          conditions: [{ type: 'decreasing_item_amount' }],
        },
        trial_update_behavior: 'end_trial',
        billing_cycle_anchor: null,
      },
    },
    id: 'bpc_1MlLiHJITzLVzkSmUYpn1kRA',
    is_default: true,
    livemode: true,
    login_page: {
      enabled: false,
      url: null,
    },
    metadata: null,
    object: 'billing_portal.configuration',
    updated: 1234567890,
    name: null,
  },
  billingPortalSession: {
    configuration: 'bpc_1MlLiHJITzLVzkSmUYpn1kRA',
    created: 1234567890,
    customer: 'cus_NNNslJKODLsLoG',
    flow: {
      after_completion: {
        hosted_confirmation: {
          custom_message: null,
        },
        redirect: {
          return_url: 'return_url',
        },
        type: 'hosted_confirmation',
      },
      subscription_cancel: {
        retention: {
          coupon_offer: {
            coupon: 'coupon',
          },
          type: 'coupon_offer',
        },
        subscription: 'subscription',
      },
      subscription_update: {
        subscription: 'subscription',
      },
      subscription_update_confirm: {
        discounts: null,
        items: [{ id: null, price: null }],
        subscription: 'subscription',
      },
      type: 'subscription_update',
    },
    id: 'bps_1MlLiHJITzLVzkSm8ZH6SnN2',
    livemode: true,
    locale: null,
    object: 'billing_portal.session',
    on_behalf_of: null,
    return_url: 'https://example.com/account',
    url: '>-\n      https://rwashburne-customer_portal-mydev.dev.stripe.me/session/{SESSION_SECRET}',
  },
  capability: {
    account: 'acct_1MWlHDJITzLVzkSm',
    future_requirements: {
      alternatives: [],
      current_deadline: null,
      currently_due: [],
      disabled_reason: null,
      errors: [],
      eventually_due: [],
      past_due: [],
      pending_verification: [],
    },
    id: 'card_payments',
    object: 'capability',
    requested: true,
    requested_at: 1234567890,
    requirements: {
      alternatives: [],
      current_deadline: null,
      currently_due: [],
      disabled_reason: null,
      errors: [],
      eventually_due: [],
      past_due: [],
      pending_verification: [],
    },
    status: 'inactive',
  },
  card: {
    address_city: null,
    address_country: null,
    address_line1: null,
    address_line1_check: null,
    address_line2: null,
    address_state: null,
    address_zip: null,
    address_zip_check: null,
    brand: 'Visa',
    country: 'US',
    customer: null,
    cvc_check: 'pass',
    dynamic_last4: null,
    exp_month: 8,
    exp_year: 2030,
    fingerprint: 'XFO13q66ulrWf0ou',
    funding: 'credit',
    id: 'card_1Mcd6SJITzLVzkSmqkE2eJHO',
    last4: '4242',
    metadata: {},
    name: 'Jenny Rosen',
    object: 'card',
    tokenization_method: null,
    regulated_status: null,
  },
  cash_balance: {
    available: {
      eur: 10000,
    },
    customer: 'cus_NNNslJKODLsLoG',
    livemode: false,
    object: 'cash_balance',
    settings: {
      reconciliation_mode: 'automatic',
      using_merchant_default: true,
    },
  },
  charge: {
    amount: 100,
    amount_captured: 0,
    amount_refunded: 0,
    application: null,
    application_fee: null,
    application_fee_amount: null,
    balance_transaction: 'txn_1MlLhiJITzLVzkSm0tDIM70A',
    billing_details: {
      address: {
        city: null,
        country: null,
        line1: null,
        line2: null,
        postal_code: null,
        state: null,
      },
      email: null,
      name: 'Jenny Rosen',
      phone: null,
      tax_id: null,
    },
    calculated_statement_descriptor: null,
    captured: false,
    created: 1234567890,
    currency: 'usd',
    customer: null,
    description: 'My First Test Charge (created for API docs)',
    disputed: false,
    failure_balance_transaction: null,
    failure_code: null,
    failure_message: null,
    fraud_details: {},
    id: 'ch_1Mcd6UJITzLVzkSmp1XIBHoW',
    livemode: false,
    metadata: {},
    object: 'charge',
    on_behalf_of: null,
    outcome: {
      advice_code: null,
      network_advice_code: null,
      network_decline_code: null,
      network_status: null,
      reason: null,
      seller_message: null,
      type: 'type',
    },
    paid: true,
    payment_intent: null,
    payment_method: 'card_1Mcd6SJITzLVzkSmqkE2eJHO',
    payment_method_details: {
      card: {
        brand: 'visa',
        checks: {
          address_line1_check: null,
          address_postal_code_check: null,
          cvc_check: 'pass',
        },
        country: 'US',
        exp_month: 8,
        exp_year: 2030,
        fingerprint: 'XFO13q66ulrWf0ou',
        funding: 'credit',
        installments: {
          plan: {
            count: null,
            interval: null,
            type: 'fixed_count',
          },
        },
        last4: '4242',
        mandate: null,
        network: 'visa',
        three_d_secure: {
          authentication_flow: null,
          electronic_commerce_indicator: null,
          exemption_indicator: null,
          result: null,
          result_reason: null,
          transaction_id: null,
          version: null,
        },
        wallet: {
          dynamic_last4: null,
          type: 'link',
        },
        amount_authorized: null,
        authorization_code: null,
        network_transaction_id: null,
        regulated_status: null,
      },
      type: 'card',
    },
    receipt_email: null,
    receipt_number: null,
    receipt_url:
      '>-\n      https://rwashburne-manage-mydev.dev.stripe.me/receipts/payment/CAcaFwoVYWNjdF8xTVdsSERKSVR6TFZ6a1NtKNr-vqAGMga56OxYPmU6LCIJCzDVSp5Ad3U9fZNleQoPNZ-HObHtPnsz8U55_1KOofBmEmAK5jBlWIYZ',
    refunded: false,
    refunds: {
      data: [],
      has_more: false,
      object: 'list',
      url: '/v1/charges/ch_1Mcd6UJITzLVzkSmp1XIBHoW/refunds',
    },
    review: null,
    shipping: {},
    source_transfer: null,
    statement_descriptor: null,
    statement_descriptor_suffix: null,
    status: 'succeeded',
    transfer_data: {
      amount: null,
      destination: {
        id: 'obj_123',
        object: 'account',
      },
    },
    transfer_group: null,
    source: {
      allow_redisplay: null,
      amount: null,
      client_secret: 'client_secret',
      created: 1028554472,
      currency: null,
      flow: 'flow',
      id: 'obj_123',
      livemode: true,
      metadata: null,
      object: 'source',
      owner: {
        address: {
          city: null,
          country: null,
          line1: null,
          line2: null,
          postal_code: null,
          state: null,
        },
        email: null,
        name: null,
        phone: null,
        verified_address: {
          city: null,
          country: null,
          line1: null,
          line2: null,
          postal_code: null,
          state: null,
        },
        verified_email: null,
        verified_name: null,
        verified_phone: null,
      },
      statement_descriptor: null,
      status: 'status',
      type: 'ideal',
      usage: null,
    },
  },
  checkoutSession: {
    after_expiration: {
      recovery: {
        allow_promotion_codes: true,
        enabled: true,
        expires_at: null,
        url: null,
      },
    },
    allow_promotion_codes: null,
    amount_subtotal: null,
    amount_total: null,
    automatic_tax: {
      enabled: false,
      status: null,
      liability: {
        type: 'account',
      },
      provider: null,
    },
    billing_address_collection: null,
    cancel_url: 'https://example.com/cancel',
    client_reference_id: null,
    consent: {
      promotions: null,
      terms_of_service: null,
    },
    consent_collection: {
      payment_method_reuse_agreement: {
        position: 'hidden',
      },
      promotions: null,
      terms_of_service: null,
    },
    created: 1234567890,
    currency: null,
    custom_fields: [],
    custom_text: {
      shipping_address: {
        message: 'message',
      },
      submit: {
        message: 'message',
      },
      after_submit: {
        message: 'message',
      },
      terms_of_service_acceptance: {
        message: 'message',
      },
    },
    customer: null,
    customer_creation: null,
    customer_details: {
      address: {
        city: null,
        country: null,
        line1: null,
        line2: null,
        postal_code: null,
        state: null,
      },
      email: 'example@example.com',
      name: null,
      phone: null,
      tax_exempt: 'none',
      tax_ids: null,
      business_name: null,
      individual_name: null,
    },
    customer_email: null,
    expires_at: 1234567890,
    id: 'cs_test_a1P5YYluaNII2Sw4YvDcqWDVcCaEF88dgjX1R52zahnP5GOEowMj42pzSq',
    invoice: null,
    invoice_creation: {
      enabled: true,
      invoice_data: {
        account_tax_ids: null,
        custom_fields: null,
        description: null,
        footer: null,
        issuer: {
          type: 'account',
        },
        metadata: null,
        rendering_options: {
          amount_tax_display: null,
          template: null,
        },
      },
    },
    livemode: false,
    locale: null,
    metadata: {},
    mode: 'payment',
    object: 'checkout.session',
    payment_intent: 'pi_1Mcd6XJITzLVzkSmwOxqskee',
    payment_link: null,
    payment_method_collection: null,
    payment_method_options: {},
    payment_method_types: ['card'],
    payment_status: 'unpaid',
    phone_number_collection: {
      enabled: false,
    },
    recovered_from: null,
    setup_intent: null,
    shipping_address_collection: {
      allowed_countries: ['SC'],
    },
    shipping_cost: {
      amount_subtotal: 1555417355,
      amount_tax: 1424534716,
      amount_total: 1117121693,
      shipping_rate: null,
    },
    shipping_options: [],
    status: 'open',
    submit_type: null,
    subscription: null,
    success_url: 'https://example.com/success',
    total_details: {
      amount_discount: 406046392,
      amount_shipping: null,
      amount_tax: 1424534716,
    },
    url: '>-\n      https://checkout.stripe.com/pay/c/cs_test_a1P5YYluaNII2Sw4YvDcqWDVcCaEF88dgjX1R52zahnP5GOEowMj42pzSq',
    adaptive_pricing: {
      enabled: true,
    },
    client_secret: null,
    collected_information: {
      shipping_details: {
        address: {
          city: null,
          country: null,
          line1: null,
          line2: null,
          postal_code: null,
          state: null,
        },
        name: 'name',
      },
      business_name: null,
      individual_name: null,
    },
    discounts: null,
    payment_method_configuration_details: {
      id: 'obj_123',
      parent: null,
    },
    permissions: {
      update_shipping_details: null,
    },
    saved_payment_method_options: {
      allow_redisplay_filters: null,
      payment_method_remove: null,
      payment_method_save: null,
    },
    ui_mode: null,
    wallet_options: {},
    origin_context: null,
    currency_conversion: {
      amount_subtotal: 1555417355,
      amount_total: 1117121693,
      fx_rate: '291452898',
      source_currency: 'usd',
    },
  },
  countrySpec: {
    default_currency: 'usd',
    id: 'US',
    object: 'country_spec',
    supported_bank_account_currencies: {
      usd: ['US'],
    },
    supported_payment_currencies: ['...', 'aed', 'afn', 'usd'],
    supported_payment_methods: ['ach', 'card', 'stripe'],
    supported_transfer_countries: [
      'AE',
      'AG',
      'AL',
      'AM',
      'AO',
      'AR',
      'AT',
      'AU',
      'AZ',
      'BA',
      'BD',
      'BE',
      'BG',
      'BH',
      'BJ',
      'BN',
      'BO',
      'BS',
      'BT',
      'BW',
      'CA',
      'CH',
      'CI',
      'CL',
      'CO',
      'CR',
      'CY',
      'CZ',
      'DE',
      'DK',
      'DO',
      'DZ',
      'EC',
      'EE',
      'EG',
      'ES',
      'ET',
      'FI',
      'FR',
      'GA',
      'GB',
      'GH',
      'GM',
      'GR',
      'GT',
      'GY',
      'HK',
      'HR',
      'HU',
      'ID',
      'IE',
      'IL',
      'IS',
      'IT',
      'JM',
