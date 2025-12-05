```typescript
import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const DeveloperHubView = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Developer Hub - ISO 20022 API
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the Developer Hub for our ISO 20022-native API. This hub provides you with the
          tools and documentation you need to integrate with our platform and build powerful
          financial applications.
        </Typography>

        <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          To get started, please review the following resources:
        </Typography>
        <ul>
          <li>
            <Link href="/documentation/api-overview" target="_blank" rel="noopener noreferrer">
              API Overview
            </Link>
            : A high-level introduction to our API and its capabilities.
          </li>
          <li>
            <Link href="/documentation/api-endpoints" target="_blank" rel="noopener noreferrer">
              API Endpoints
            </Link>
            : Detailed information on each API endpoint, including request/response
            schemas, parameters, and examples.
          </li>
          <li>
            <Link href="/documentation/authentication" target="_blank" rel="noopener noreferrer">
              Authentication
            </Link>
            : Instructions on how to authenticate your API requests.
          </li>
          <li>
            <Link href="/documentation/code-samples" target="_blank" rel="noopener noreferrer">
              Code Samples
            </Link>
            : Ready-to-use code snippets in various programming languages to help you integrate quickly.
          </li>
        </ul>

        <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
          ISO 20022 Schema Reference
        </Typography>
        <Typography variant="body1" paragraph>
          The API adheres to the ISO 20022 standard.  Below is the full schema definition for the ISO
          20022 elements supported by the API.  This is for informational and reference purposes.
        </Typography>
        <Box sx={{ mt: 2, overflowX: 'auto' }}>
          <pre style={{
            backgroundColor: '#f0f0f0',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            overflowX: 'auto', // Allows horizontal scrolling if needed
          }}>
            {JSON.stringify(iso20022, null, 2)}
          </pre>
        </Box>
      </Box>
    </Container>
  );
};

export default DeveloperHubView;

const iso20022 = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "$id": {
      "default": "urn:iso:std:iso:20022:tech:json:"
    },
    "ExternalAcceptedReason1Code": {
      "$ref": "#/definitions/ExternalAcceptedReason1Code"
    },
    "ExternalAccountIdentification1Code": {
      "$ref": "#/definitions/ExternalAccountIdentification1Code"
    },
    "ExternalAgentInstruction1Code": {
      "$ref": "#/definitions/ExternalAgentInstruction1Code"
    },
    "ExternalAgreementType1Code": {
      "$ref": "#/definitions/ExternalAgreementType1Code"
    },
    "ExternalAuthenticationChannel1Code": {
      "$ref": "#/definitions/ExternalAuthenticationChannel1Code"
    },
    "ExternalAuthenticationMethod1Code": {
      "$ref": "#/definitions/ExternalAuthenticationMethod1Code"
    },
    "ExternalAuthorityExchangeReason1Code": {
      "$ref": "#/definitions/ExternalAuthorityExchangeReason1Code"
    },
    "ExternalAuthorityIdentification1Code": {
      "$ref": "#/definitions/ExternalAuthorityIdentification1Code"
    },
    "ExternalBalanceSubType1Code": {
      "$ref": "#/definitions/ExternalBalanceSubType1Code"
    },
    "ExternalBalanceType1Code": {
      "$ref": "#/definitions/ExternalBalanceType1Code"
    },
    "ExternalBankTransactionDomain1Code": {
      "$ref": "#/definitions/ExternalBankTransactionDomain1Code"
    },
    "ExternalBankTransactionFamily1Code": {
      "$ref": "#/definitions/ExternalBankTransactionFamily1Code"
    },
    "ExternalBankTransactionSubFamily1Code": {
      "$ref": "#/definitions/ExternalBankTransactionSubFamily1Code"
    },
    "ExternalBenchmarkCurveName1Code": {
      "$ref": "#/definitions/ExternalBenchmarkCurveName1Code"
    },
    "ExternalBillingBalanceType1Code": {
      "$ref": "#/definitions/ExternalBillingBalanceType1Code"
    },
    "ExternalBillingCompensationType1Code": {
      "$ref": "#/definitions/ExternalBillingCompensationType1Code"
    },
    "ExternalBillingRateIdentification1Code": {
      "$ref": "#/definitions/ExternalBillingRateIdentification1Code"
    },
    "ExternalCalculationAgent1Code": {
      "$ref": "#/definitions/ExternalCalculationAgent1Code"
    },
    "ExternalCancellationReason1Code": {
      "$ref": "#/definitions/ExternalCancellationReason1Code"
    },
    "ExternalCardTransactionCategory1Code": {
      "$ref": "#/definitions/ExternalCardTransactionCategory1Code"
    },
    "ExternalCashAccountType1Code": {
      "$ref": "#/definitions/ExternalCashAccountType1Code"
    },
    "ExternalCashClearingSystem1Code": {
      "$ref": "#/definitions/ExternalCashClearingSystem1Code"
    },
    "ExternalCategoryPurpose1Code": {
      "$ref": "#/definitions/ExternalCategoryPurpose1Code"
    },
    "ExternalChannel1Code": {
      "$ref": "#/definitions/ExternalChannel1Code"
    },
    "ExternalChargeType1Code": {
      "$ref": "#/definitions/ExternalChargeType1Code"
    },
    "ExternalChequeAgentInstruction1Code": {
      "$ref": "#/definitions/ExternalChequeAgentInstruction1Code"
    },
    "ExternalChequeCancellationReason1Code": {
      "$ref": "#/definitions/ExternalChequeCancellationReason1Code"
    },
    "ExternalChequeCancellationStatus1Code": {
      "$ref": "#/definitions/ExternalChequeCancellationStatus1Code"
    },
    "ExternalClaimNonReceiptRejection1Code": {
      "$ref": "#/definitions/ExternalClaimNonReceiptRejection1Code"
    },
    "ExternalClearingSystemIdentification1Code": {
      "$ref": "#/definitions/ExternalClearingSystemIdentification1Code"
    },
    "ExternalCollateralReferenceDataStatusReason1Code": {
      "$ref": "#/definitions/ExternalCollateralReferenceDataStatusReason1Code"
    },
    "ExternalCommunicationFormat1Code": {
      "$ref": "#/definitions/ExternalCommunicationFormat1Code"
    },
    "ExternalContractBalanceType1Code": {
      "$ref": "#/definitions/ExternalContractBalanceType1Code"
    },
    "ExternalContractClosureReason1Code": {
      "$ref": "#/definitions/ExternalContractClosureReason1Code"
    },
    "ExternalCorporateActionEventType1Code": {
      "$ref": "#/definitions/ExternalCorporateActionEventType1Code"
    },
    "ExternalCreditLineType1Code": {
      "$ref": "#/definitions/ExternalCreditLineType1Code"
    },
    "ExternalCreditorAgentInstruction1Code": {
      "$ref": "#/definitions/ExternalCreditorAgentInstruction1Code"
    },
    "ExternalCreditorEnrolmentAmendmentReason1Code": {
      "$ref": "#/definitions/ExternalCreditorEnrolmentAmendmentReason1Code"
    },
    "ExternalCreditorEnrolmentCancellationReason1Code": {
      "$ref": "#/definitions/ExternalCreditorEnrolmentCancellationReason1Code"
    },
    "ExternalCreditorEnrolmentStatusReason1Code": {
      "$ref": "#/definitions/ExternalCreditorEnrolmentStatusReason1Code"
    },
    "ExternalCreditorReferenceType1Code": {
      "$ref": "#/definitions/ExternalCreditorReferenceType1Code"
    },
    "ExternalDateFrequency1Code": {
      "$ref": "#/definitions/ExternalDateFrequency1Code"
    },
    "ExternalDateType1Code": {
      "$ref": "#/definitions/ExternalDateType1Code"
    },
    "ExternalDebtorActivationAmendmentReason1Code": {
      "$ref": "#/definitions/ExternalDebtorActivationAmendmentReason1Code"
    },
    "ExternalDebtorActivationCancellationReason1Code": {
      "$ref": "#/definitions/ExternalDebtorActivationCancellationReason1Code"
    },
    "ExternalDebtorActivationStatusReason1Code": {
      "$ref": "#/definitions/ExternalDebtorActivationStatusReason1Code"
    },
    "ExternalDebtorAgentInstruction1Code": {
      "$ref": "#/definitions/ExternalDebtorAgentInstruction1Code"
    },
    "ExternalDeviceOperatingSystemType1Code": {
      "$ref": "#/definitions/ExternalDeviceOperatingSystemType1Code"
    },
    "ExternalDiscountAmountType1Code": {
      "$ref": "#/definitions/ExternalDiscountAmountType1Code"
    },
    "ExternalDocumentAmountType1Code": {
      "$ref": "#/definitions/ExternalDocumentAmountType1Code"
    },
    "ExternalDocumentFormat1Code": {
      "$ref": "#/definitions/ExternalDocumentFormat1Code"
    },
    "ExternalDocumentLineType1Code": {
      "$ref": "#/definitions/ExternalDocumentLineType1Code"
    },
    "ExternalDocumentPurpose1Code": {
      "$ref": "#/definitions/ExternalDocumentPurpose1Code"
    },
    "ExternalDocumentType1Code": {
      "$ref": "#/definitions/ExternalDocumentType1Code"
    },
    "ExternalEffectiveDateParameter1Code": {
      "$ref": "#/definitions/ExternalEffectiveDateParameter1Code"
    },
    "ExternalEmissionAllowanceSubProductType1Code": {
      "$ref": "#/definitions/ExternalEmissionAllowanceSubProductType1Code"
    },
    "ExternalEncryptedElementIdentification1Code": {
      "$ref": "#/definitions/ExternalEncryptedElementIdentification1Code"
    },
    "ExternalEnquiryRequestType1Code": {
      "$ref": "#/definitions/ExternalEnquiryRequestType1Code"
    },
    "ExternalEntitySize1Code": {
      "$ref": "#/definitions/ExternalEntitySize1Code"
    },
    "ExternalEntityType1Code": {
      "$ref": "#/definitions/ExternalEntityType1Code"
    },
    "ExternalEntryStatus1Code": {
      "$ref": "#/definitions/ExternalEntryStatus1Code"
    },
    "ExternalFinancialInstitutionIdentification1Code": {
      "$ref": "#/definitions/ExternalFinancialInstitutionIdentification1Code"
    },
    "ExternalFinancialInstrumentIdentificationType1Code": {
      "$ref": "#/definitions/ExternalFinancialInstrumentIdentificationType1Code"
    },
    "ExternalFinancialInstrumentProductType1Code": {
      "$ref": "#/definitions/ExternalFinancialInstrumentProductType1Code"
    },
    "ExternalGarnishmentType1Code": {
      "$ref": "#/definitions/ExternalGarnishmentType1Code"
    },
    "ExternalIncoterms1Code": {
      "$ref": "#/definitions/ExternalIncoterms1Code"
    },
    "ExternalIndustrySectorClassification1Code": {
      "$ref": "#/definitions/ExternalIndustrySectorClassification1Code"
    },
    "ExternalInformationType1Code": {
      "$ref": "#/definitions/ExternalInformationType1Code"
    },
    "ExternalInstructedAgentInstruction1Code": {
      "$ref": "#/definitions/ExternalInstructedAgentInstruction1Code"
    },
    "ExternalInvestigationAction1Code": {
      "$ref": "#/definitions/ExternalInvestigationAction1Code"
    },
    "ExternalInvestigationActionReason1Code": {
      "$ref": "#/definitions/ExternalInvestigationActionReason1Code"
    },
    "ExternalInvestigationExecutionConfirmation1Code": {
      "$ref": "#/definitions/ExternalInvestigationExecutionConfirmation1Code"
    },
    "ExternalInvestigationInstrument1Code": {
      "$ref": "#/definitions/ExternalInvestigationInstrument1Code"
    },
    "ExternalInvestigationReason1Code": {
      "$ref": "#/definitions/ExternalInvestigationReason1Code"
    },
    "ExternalInvestigationReasonSubType1Code": {
      "$ref": "#/definitions/ExternalInvestigationReasonSubType1Code"
    },
    "ExternalInvestigationServiceLevel1Code": {
      "$ref": "#/definitions/ExternalInvestigationServiceLevel1Code"
    },
    "ExternalInvestigationStatus1Code": {
      "$ref": "#/definitions/ExternalInvestigationStatus1Code"
    },
    "ExternalInvestigationStatusReason1Code": {
      "$ref": "#/definitions/ExternalInvestigationStatusReason1Code"
    },
    "ExternalInvestigationSubType1Code": {
      "$ref": "#/definitions/ExternalInvestigationSubType1Code"
    },
    "ExternalInvestigationType1Code": {
      "$ref": "#/definitions/ExternalInvestigationType1Code"
    },
    "ExternalLegalFramework1Code": {
      "$ref": "#/definitions/ExternalLegalFramework1Code"
    },
    "ExternalLetterType1Code": {
      "$ref": "#/definitions/ExternalLetterType1Code"
    },
    "ExternalLocalInstrument1Code": {
      "$ref": "#/definitions/ExternalLocalInstrument1Code"
    },
    "ExternalMandateReason1Code": {
      "$ref": "#/definitions/ExternalMandateReason1Code"
    },
    "ExternalMandateSetupReason1Code": {
      "$ref": "#/definitions/ExternalMandateSetupReason1Code"
    },
    "ExternalMandateStatus1Code": {
      "$ref": "#/definitions/ExternalMandateStatus1Code"
    },
    "ExternalMandateSuspensionReason1Code": {
      "$ref": "#/definitions/ExternalMandateSuspensionReason1Code"
    },
    "ExternalMarketArea1Code": {
      "$ref": "#/definitions/ExternalMarketArea1Code"
    },
    "ExternalMarketInfrastructure1Code": {
      "$ref": "#/definitions/ExternalMarketInfrastructure1Code"
    },
    "ExternalMessageFunction1Code": {
      "$ref": "#/definitions/ExternalMessageFunction1Code"
    },
    "ExternalModelFormIdentification1Code": {
      "$ref": "#/definitions/ExternalModelFormIdentification1Code"
    },
    "ExternalNarrativeType1Code": {
      "$ref": "#/definitions/ExternalNarrativeType1Code"
    },
    "ExternalNotificationCancellationReason1Code": {
      "$ref": "#/definitions/ExternalNotificationCancellationReason1Code"
    },
    "ExternalNotificationSubType1Code": {
      "$ref": "#/definitions/ExternalNotificationSubType1Code"
    },
    "ExternalNotificationType1Code": {
      "$ref": "#/definitions/ExternalNotificationType1Code"
    },
    "ExternalOrganisationIdentification1Code": {
      "$ref": "#/definitions/ExternalOrganisationIdentification1Code"
    },
    "ExternalPackagingType1Code": {
      "$ref": "#/definitions/ExternalPackagingType1Code"
    },
    "ExternalPartyRelationshipType1Code": {
      "$ref": "#/definitions/ExternalPartyRelationshipType1Code"
    },
    "ExternalPaymentCancellationRejection1Code": {
      "$ref": "#/definitions/ExternalPaymentCancellationRejection1Code"
    },
    "ExternalPaymentCompensationReason1Code": {
      "$ref": "#/definitions/ExternalPaymentCompensationReason1Code"
    },
    "ExternalPaymentControlRequestType1Code": {
      "$ref": "#/definitions/ExternalPaymentControlRequestType1Code"
    },
    "ExternalPaymentGroupStatus1Code": {
      "$ref": "#/definitions/ExternalPaymentGroupStatus1Code"
    },
    "ExternalPaymentModificationRejection1Code": {
      "$ref": "#/definitions/ExternalPaymentModificationRejection1Code"
    },
    "ExternalPaymentRole1Code": {
      "$ref": "#/definitions/ExternalPaymentRole1Code"
    },
    "ExternalPaymentScenario1Code": {
      "$ref": "#/definitions/ExternalPaymentScenario1Code"
    },
    "ExternalPaymentTransactionStatus1Code": {
      "$ref": "#/definitions/ExternalPaymentTransactionStatus1Code"
    },
    "ExternalPendingProcessingReason1Code": {
      "$ref": "#/definitions/ExternalPendingProcessingReason1Code"
    },
    "ExternalPersonIdentification1Code": {
      "$ref": "#/definitions/ExternalPersonIdentification1Code"
    },
    "ExternalPostTradeEventType1Code": {
      "$ref": "#/definitions/ExternalPostTradeEventType1Code"
    },
    "ExternalProductType1Code": {
      "$ref": "#/definitions/ExternalProductType1Code"
    },
    "ExternalProxyAccountType1Code": {
      "$ref": "#/definitions/ExternalProxyAccountType1Code"
    },
    "ExternalPurpose1Code": {
      "$ref": "#/definitions/ExternalPurpose1Code"
    },
    "ExternalRatesAndTenors1Code": {
      "$ref": "#/definitions/ExternalRatesAndTenors1Code"
    },
    "ExternalRePresentmentReason1Code": {
      "$ref": "#/definitions/ExternalRePresentmentReason1Code"
    },
    "ExternalReceivedReason1Code": {
      "$ref": "#/definitions/ExternalReceivedReason1Code"
    },
    "ExternalRegulatoryInformationType1Code": {
      "$ref": "#/definitions/ExternalRegulatoryInformationType1Code"
    },
    "ExternalRejectedReason1Code": {
      "$ref": "#/definitions/ExternalRejectedReason1Code"
    },
    "ExternalRelativeTo1Code": {
      "$ref": "#/definitions/ExternalRelativeTo1Code"
    },
    "ExternalReportingSource1Code": {
      "$ref": "#/definitions/ExternalReportingSource1Code"
    },
    "ExternalRequestStatus1Code": {
      "$ref": "#/definitions/ExternalRequestStatus1Code"
    },
    "ExternalReservationType1Code": {
      "$ref": "#/definitions/ExternalReservationType1Code"
    },
    "ExternalReturnReason1Code": {
      "$ref": "#/definitions/ExternalReturnReason1Code"
    },
    "ExternalReversalReason1Code": {
      "$ref": "#/definitions/ExternalReversalReason1Code"
    },
    "ExternalSecuritiesLendingType1Code": {
      "$ref": "#/definitions/ExternalSecuritiesLendingType1Code"
    },
    "ExternalSecuritiesPurpose1Code": {
      "$ref": "#/definitions/ExternalSecuritiesPurpose1Code"
    },
    "ExternalSecuritiesUpdateReason1Code": {
      "$ref": "#/definitions/ExternalSecuritiesUpdateReason1Code"
    },
    "ExternalServiceLevel1Code": {
      "$ref": "#/definitions/ExternalServiceLevel1Code"
    },
    "ExternalShipmentCondition1Code": {
      "$ref": "#/definitions/ExternalShipmentCondition1Code"
    },
    "ExternalStatusReason1Code": {
      "$ref": "#/definitions/ExternalStatusReason1Code"
    },
    "ExternalSystemBalanceType1Code": {
      "$ref": "#/definitions/ExternalSystemBalanceType1Code"
    },
    "ExternalSystemErrorHandling1Code": {
      "$ref": "#/definitions/ExternalSystemErrorHandling1Code"
    },
    "ExternalSystemEventType1Code": {
      "$ref": "#/definitions/ExternalSystemEventType1Code"
    },
    "ExternalSystemMemberType1Code": {
      "$ref": "#/definitions/ExternalSystemMemberType1Code"
    },
    "ExternalSystemPartyType1Code": {
      "$ref": "#/definitions/ExternalSystemPartyType1Code"
    },
    "ExternalTaxAmountType1Code": {
      "$ref": "#/definitions/ExternalTaxAmountType1Code"
    },
    "ExternalTechnicalInputChannel1Code": {
      "$ref": "#/definitions/ExternalTechnicalInputChannel1Code"
    },
    "ExternalTradeMarket1Code": {
      "$ref": "#/definitions/ExternalTradeMarket1Code"
    },
    "ExternalTradeTransactionCondition1Code": {
      "$ref": "#/definitions/ExternalTradeTransactionCondition1Code"
    },
    "ExternalTypeOfParty1Code": {
      "$ref": "#/definitions/ExternalTypeOfParty1Code"
    },
    "ExternalUnableToApplyIncorrectData1Code": {
      "$ref": "#/definitions/ExternalUnableToApplyIncorrectData1Code"
    },
    "ExternalUnableToApplyMissingData1Code": {
      "$ref": "#/definitions/ExternalUnableToApplyMissingData1Code"
    },
    "ExternalUnderlyingTradeTransactionType1Code": {
      "$ref": "#/definitions/ExternalUnderlyingTradeTransactionType1Code"
    },
    "ExternalUndertakingAmountType1Code": {
      "$ref": "#/definitions/ExternalUndertakingAmountType1Code"
    },
    "ExternalUndertakingDocumentType1Code": {
      "$ref": "#/definitions/ExternalUndertakingDocumentType1Code"
    },
    "ExternalUndertakingDocumentType2Code": {
      "$ref": "#/definitions/ExternalUndertakingDocumentType2Code"
    },
    "ExternalUndertakingStatusCategory1Code": {
      "$ref": "#/definitions/ExternalUndertakingStatusCategory1Code"
    },
    "ExternalUndertakingType1Code": {
      "$ref": "#/definitions/ExternalUndertakingType1Code"
    },
    "ExternalUnitOfMeasure1Code": {
      "$ref": "#/definitions/ExternalUnitOfMeasure1Code"
    },
    "ExternalValidationRuleIdentification1Code": {
      "$ref": "#/definitions/ExternalValidationRuleIdentification1Code"
    },
    "ExternalVerificationReason1Code": {
      "$ref": "#/definitions/ExternalVerificationReason1Code"
    }
  },
  "definitions": {
    "ExternalAcceptedReason1Code": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4,
      "description": "Specifies the reason for an accepted status.\n\r\nThe list of valid codes is an external code list published separately. \r\nExternal code sets can be downloaded from www.iso20022.org.\n*`ADEA`-Received after the servicer\u0027s deadline. Processed on best effort basis\n*`NSTP`-Instruction was not straight through processing and had to be processed manually\n*`SMPG`-Instruction is accepted but does not comply with the market practice rule published for the concerned market or process",
      "enum": [
        "ADEA",
        "NSTP",
        "SMPG"
      ]
    },
    "ExternalAccountIdentification1Code": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4,
      "description": "Specifies the external account identification scheme name code in the format of character string with a maximum length of 4 characters.\r\nThe list of valid codes is an external code list published separately.\r\nExternal code sets can be downloaded from www.iso20022.org.\n*`AIIN`-Issuer Identification Number (IIN) - identifies a card issuing institution in an international interchange environment. Issued by ABA (American Bankers Association).\n*`BBAN`-Basic Bank Account Number (BBAN) - identifier used nationally by financial institutions, ie, in individual countries, generally as part of a National Account Numbering Scheme(s), to uniquely identify the account of a customer.\n*`CUID`-(United States) Clearing House Interbank Payments System (CHIPS) Universal Identification (UID) - identifies entities that own accounts at CHIPS participating financial institutions, through which CHIPS payments are effected. The CHIPS UID is assigned by the New York Clearing House.\n*`UPIC`-Universal Payment Identification Code (UPIC) - identifier used by the New York Clearing House to mask confidential data, such as bank accounts and bank routing numbers. UPIC numbers remain with business customers, regardless of banking relationship changes.",
      "enum": [
        "AIIN",
        "BBAN",
        "CUID",
        "UPIC"
      ]
    },
    "ExternalAgentInstruction1Code": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4,
      "description": "Specifies further instructions for the agent concerning the processing of an instruction.\r\nExternal code sets can be downloaded from www.iso20022.org.\n*`CHQB`-(Ultimate) creditor must be paid by cheque. \n*`HOLD`-Amount of money must be held for the (ultimate) creditor, who will call. Pay on identification. \n*`INQR`-Additional Information to an inquiry reason must be provided. \n*`PBEN`-(Ultimate) creditor to be paid only after verification of identity. \n*`PHOA`-Please advise/contact next agent by phone. \n*`PHOB`-Please advise/contact (ultimate) creditor/claimant by phone. \n*`TELA`-Please advise/contact next agent by the most efficient means of telecommunication. \n*`TELB`-Please advise/contact (ultimate) creditor/claimant by the most efficient means of telecommunication. \n*`TFRO`-Payment instruction will be valid and eligible for execution from the date and time stipulated. \n*`TTIL`-Payment instruction is valid and eligible for execution until the date and time stipulated. Otherwise, the payment instruction will be rejected. ",
      "enum": [
        "CHQB",
        "HOLD",
        "INQR",
        "PBEN",
        "PHOA",
        "PHOB",
        "TELA",
        "TELB",
        "TFRO",
        "TTIL"
      ]
    },
    "ExternalAgreementType1Code": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4,
      "description": "Name of the identification scheme, in a coded form as published in an external list.\n*`AUSL`-Australian Masters Securities Lending Agreement (AMSLA).\n*`BIAG`-Bilateral agreement.\n*`CARA`-Investment Industry Regulatory Organization of Canada (IIROC) Repurchase/Reverse Repurchase Transaction Agreement.\n*`CDEA`-FIA-ISDA Cleared Derivatives Execution Agreement.\n*`CHMA`-Swiss Master Agreement.\n*`CHRA`-Swiss Master Repurchase Agreement.\n*`CMOP`-Contrato Marco de Operaciones Financieras.\n*`CNBR`-China Bond Repurchase Master Agreement.\n*`CSDA`-CSD bilateral agreement.\n*`DEMA`-German Master Agreement.\n*`DERD`-Deutscher Rahmenvertrag für Wertpapierdarlehen.\n*`DERP`-Deutscher Rahmenvertrag für Wertpapierpensionsgeschäfte .\n*`DERV`-Deutscher Rahmenvertrag für Finanztermingeschäfte (DRV).\n*`EFMA`-EFET Master Agreement.\n*`ESRA`-Contrato Marco de compraventa y Reporto de valores.\n*`EUMA`-European Master Agreement.\n*`FMAT`-FBF Master Agreement related to transactions on forward financial instruments.\n*`FPCA`-FOA Professional Client Agreement.\n*`FRFB`-Convention-Cadre Relative aux Operations de Pensions Livrees.\n*`GESL`-Gilt Edged Stock Lending Agreement (GESLA).\n*`GMRA`-Global Master Repurchase Agreement.\n*`GMSL`-Global Master Securities Lending Agreement.\n*`IDMA`-Islamic Derivative Master Agreement.\n*`ISDA`-International Swaps and Derivatives Association Agreement.\n*`JPBL`-Japanese Master Agreement on Lending Transaction of Bonds.\n*`JPBR`-Japanese Master Agreement on the Transaction with Repurchase Agreement of the Bonds.\n*`JPSL`-Japanese Master Agreement on the Borrowing and Lending Transactions of Share Certificates.\n*`KRRA`-Korea Financial Investment Association (KOFIA) Standard Repurchase Agreement.\n*`KRSL`-Korean Securities Lending Agreement (KOSLA).\n*`MEFI`-Master Equity and Fixed Interest Stock Lending Agreement (MEFISLA).\n*`MRAA`-Master Repurchase Agreement.\n*`MSLA`-Master Securities Loan Agreement.\n*`OSLA`-Overseas Securities Lending Agreement.\n*`OTHR`-Other type of master agreement.",
      "enum": [
        "AUSL",
        "BIAG",
        "CARA",
        "CDEA",
        "CHMA",
        "CHRA",
        "CMOP",
        "CNBR",
        "CSDA",
        "DEMA",
        "DERD",
        "DERP",
        "DERV",
        "EFMA",
        "ESRA",
        "EUMA",
        "FMAT",
        "FPCA",
        "FRFB",
        "GESL",
        "GMRA",
        "GMSL",
        "IDMA",
        "ISDA",
        "JPBL",
        "JPBR",
        "JPSL",
        "KRRA",
        "KRSL",
        "MEFI",
        "MRAA",
        "MSLA",
        "OSLA",
        "OTHR"
      ]
    },
    "ExternalAuthenticationChannel1Code": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4,
      "description": "Specifies the transaction authentication channel, as published in an external authentication channel code set.\r\nExternal code sets can be downloaded from www.iso20022.org.\n*`ATMA`-Authentication provided through ATM\n*`CARD`-Authentication provided through Card\n*`INBA`-Authentication provided through Internet Banking\n*`MOBI`-Authentication provided through Mobile",
      "enum": [
        "ATMA",
        "CARD",
        "INBA",
        "MOBI"
      ]
    },
    "ExternalAuthenticationMethod1Code": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4,
      "description": "Code to specify the authentication method used, as published separately in an external authentication method code set.\r\n\r\nExternal code sets can be downloaded from www.iso20022.org.\n*`ACSN`-Serial Number of the acceptor\u0027s certificate.\n*`ADDB`-Cardholder billing address.\n*`ADDS`-Shipping address.\n*`APKI`-Account-based digital signature authentication.\n*`ARNB`-Number assigned by a government agency to identify foreign nationals.\n*`ARPC`-Response Card Cryptogram (ARPC) verification.\n*`ARQC`-Verification of a cryptogram generated by a chip card, for instance an ARQC (Authorisation Request Cryptogram).\n*`ATCC`-Application Transaction Counter.\n*`BIOM`-Biometric authentication of the cardholder.\n*`BTHD`-Date of birth of a person. \n*`CDCM`-Consumer Device Cardholder Verification Method.\n*`CDHI`-Cardholder data provided for verification.\n*`CHDN`-Name of cardholder.\n*`CHSA`-Cardholder address.\n*`CHSN`-Serial Number of the cardholder\u0027s certificate.\n*`CPSG`-Electronic signature capture (handwritten signature).\n*`CSCV`-Verification of Card Security Code.\n*`CSEC`-Authentication performed during a secure electronic commerce transaction. \n*`CUID`-Customer number used as a mechanism of authentication.\n*`DRID`-Number assigned by a driving license authority to a person.\n*`DRVI`-Identification of a driver in a fleet of vehicles.\n*`EMAL`-Electronic mail address.\n*`EMIN`-Number assigned to an employee by an employer.\n*`EMRN`-Number assigned to an employer by a registration authority.\n*`FBIG`-Biographics authentication in an offline mode.\n*`FBIO`-Biometrics authentication in an offline mode.\n*`FCPN`-PIN generated offline and transmitted in clear\n*`FPIN`-Off-line PIN authentication (Personal Identification Number).\n*`IDCN`-Number assigned by a national authority to an identity card.\n*`MANU`-Manual verification, for example passport or drivers license.\n*`MOBL`-Customer mobile phone number.\n*`NBIG`-Biographics authentication in an online mode.\n*`NPIN`-On-line PIN authentication (Personal Identification Number).\n*`NTID`-National Identifier.\n*`NVSC`-Non visible Card Security Code.\n*`OCHI`-Other cardholder data provided for identification.\n*`OFPE`-PIN generated offline and transmitted encrypted.\n*`OLDA`-Authentication of data in an offline mode.\n*`OLDS`-Analysis of signature transmitted offline.\n*`OTHN`-Other type of verification defined at national level.\n*`OTHP`-Other type of verification defined at private level.\n*`OTPW`-Verification of a one-time password provided by the issuer.\n*`PASS`-Number assigned by a passport authority to a passport.\n*`PCDV`-Verification based on digits of the postal code.\n*`PHOM`-Customer home phone number.\n*`PHNB`-Generical phone number.\n*`PKIS`-PKI (Public Key Infrastructure) based digital signature.\n*`PLOB`-Place of birth of a person.\n*`PPSG`-Handwritten paper signature.\n*`PRXY`-Proxy.\n*`PSCD`-Authentication by a passcode.\n*`PSVE`-Authentication based on statistical cardholder behaviour.\n*`PSWD`-Authentication by a password.\n*`PWOR`-Customer business phone number.\n*`QWAC`-Qualified Certificate.\n*`SCNL`-Channel-encrypted transaction.\n*`SCRT`-Electronic commerce transaction secured with the X.509 certificate of a customer.\n*`SHAF`-Shipping address from verification.\n*`SHAT`-Shipping address to verification\n*`SSYN`-Number assigned by a social security agency.\n*`THDS`-Authentication performed during a secure electronic commerce transaction.\n*`AUVA`-A value is used to verify an already performed authentication, used for non ThreeDS related authentication.\n*`TAVV`-A value used to validate the authorised use of a token.\n*`TXID`-Number assigned by a tax authority to an entity.\n*`LAWE`-Identification of law enforcement.\n*`MILI`-Identification of military.\n*`TRVL`-Identification used for travel.\n*`CPNY`-Registration number of a company.",
      "enum": [
        "ACSN",
        "ADDB",
        "ADDS",
        "APKI",
        "ARNB",
        "ARPC",
        "ARQC",
        "ATCC",
        "BIOM