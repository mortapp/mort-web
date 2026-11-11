-- Terms V5 publication: insert the website's published Master Terms
-- (MORT-LEGAL-2026-V5) into legal_document_versions and retire V3,
-- so the site content, database, and manifest all match.

update public.legal_document_versions
set retired_at = '2026-11-11T01:57:00Z'::timestamptz
where document_id = (select id from public.legal_documents where document_key = 'master_terms_of_service')
  and version_label = 'MORT-LEGAL-2026-V3'
  and retired_at is null;

insert into public.legal_document_versions (
  document_id, version_label, content_hash, content_markdown,
  effective_at, published_at, material_revision, requires_electronic_signature,
  publication_status, attorney_reviewed_at, approved_by_counsel_reference
)
select
  d.id,
  'MORT-LEGAL-2026-V5',
  '097770e3130b5d22d4327a10351a3a7d6781da4daf3a72ffc8c17f58fc08a599',
  '# MORT Master Terms of Service
Marketplace, Safety, Guardian, Payment & Tax Framework

Document reference: MORT-LEGAL-2026-V5
Jurisdiction: United States / Indiana
Effective date: November 10, 2026
Operator: MORT, the trade name under which the MORT Platform at https://mortapp.org is operated and published
Legal notices and support: support@mortapp.org (designated notice method; MORT will publish its registered legal-entity name and mailing address at https://legal.mortapp.org/ when established)

## Plain-language overview

MORT provides software for adults and eligible teens to find and coordinate local tasks. MORT is not the person who performs a task. A task is an arrangement between the adult who posts it and the teen who accepts it, subject to applicable law and any required guardian approval. Legal classification depends on actual facts and law, not the labels in these Terms.

A parent or legal guardian ("Guardian") must give verifiable consent before a teen account is enabled. The teen must also agree in an age-appropriate manner. Guardian approval is required for each task as specified in these Terms and in the product. A Guardian''s consent does not waive a teen''s legal rights or automatically make the Guardian the person who earned the teen''s pay.

The MORT marketplace is open. Eligible users can browse and apply to Task listings, and adults who complete the Platform''s verification steps can post them. Identity verification is available through MORT''s document review process: a Teen submits permitted school evidence and an adult submits a permitted government-issued ID through the Platform, and MORT reviews the submission and updates the account''s verification status. MORT does not currently process real-world task payments, and these Terms do not promise payment processing, background screening, insurance, or safety guarantees. MORT will not enable or advertise any such feature until its operation, vendor arrangements, and user-facing disclosures are accurate.

## 1. Agreement, scope, and definitions

### 1.1 Agreement and related policies

These Master Terms ("Terms") form an agreement between the user and MORT for access to the MORT website, mobile applications, and related services (the "Platform"). The Terms apply together with the Privacy Notice, Community Standards, Safety Rules, any Payment Terms presented for an enabled payment feature, and the applicable State Addendum. Each incorporated document is linked and provided before acceptance. If a feature-specific term conflicts with these Terms, the feature-specific term controls only for that feature and only to the extent lawful. A State Addendum controls where it gives a user greater protection or is required by law.

The person creating or using an account is a "User." A person under 18 is a "Teen User" or "Teen." A parent or legal guardian with authority for the Teen is a "Guardian." An adult who posts or requests work is a "Poster." The Teen who offers to perform work is a "Teen Provider." A "Task" is a specific local service described in a listing and accepted through the Platform. "Task Agreement" means the arrangement between the Poster and the Teen Provider, with Guardian involvement where required. "Payment Provider" means a payment service provider MORT has actually engaged for an enabled feature. "Payment Feature" means any feature that authorizes, collects, routes, refunds, or pays money for a Task. "User Content" includes listings, applications, messages, photographs, ratings, and other submissions.

### 1.2 Platform role; no label overrides law

MORT provides coordination software, account controls, and communications features. MORT does not itself perform a Task, promise that any Task will be available, or guarantee a Poster or Teen Provider will accept or complete a proposed Task. Unless MORT separately states otherwise in a signed writing, MORT is not a party to a Task Agreement and does not supply tools, transportation, job-site supervision, or insurance for a Task.

This description is not a finding that MORT, a Poster, or a Teen Provider is or is not an employer, employee, staffing agency, employment agency, contractor, agent, or joint employer. The actual relationship depends on the facts and applicable law. No User may rely on the word "independent," "marketplace," "casual," "household," or similar label as a determination of legal classification or exemption.

## 2. Eligibility, accounts, and consent

### 2.1 Who may use MORT

A Poster must be at least 18 and, if acting for an organization, authorized to bind it. A Teen must be at least 13 and under 18, reside in a state and locality MORT has expressly opened for Teen participation, and satisfy the age, task, school-hour, and other eligibility rules applicable to the particular Task. MORT may impose stricter age or feature limits. A person under 13 may not create or use an account. If MORT learns that an account was created by a person below the permitted minimum age, it may disable the account and handle associated information under the Privacy Notice and applicable law.

Age eligibility does not mean a particular Task is lawful. Federal, state, and local child-labor, school-attendance, licensing, wage, safety, and other rules may prohibit a Task or limit who may perform it, when, and under what conditions. MORT may restrict a Teen account or category where applicable requirements have not been reviewed and implemented.

### 2.2 Guardian consent and Teen assent

Before a Teen account is enabled, MORT must receive Guardian consent using the verifiable process described in the product. The Guardian represents that they are an adult with legal authority to act for the Teen, provides accurate contact details, and agrees to the Guardian provisions that apply to them. The Teen must receive an understandable explanation of the Terms and affirmatively assent through the Platform. Guardian consent and Teen assent are separate records. MORT may request additional proof and suspend access if consent cannot be verified, is withdrawn, or appears unauthorized.

Guardian consent authorizes the Teen''s use of the Platform only within the approved features and applicable law. It does not waive a Teen''s non-waivable rights, make every Teen Agreement enforceable, make the Guardian the service provider, or transfer ownership of compensation. The enforceability of a minor''s agreements and the effect of parental consent or ratification are governed by applicable law.

### 2.3 Task-specific Guardian review

Before a Teen accepts a Task, MORT makes available to the Teen and Guardian the material task information entered by the Poster, including the exact duties, location, date and time, estimated duration, pay, required tools, hazards, animals, chemicals, lifting, transportation, supervision, and any indoor or private-residence setting. A Guardian must approve the particular Task in the manner required by the product before the Teen may begin. A broad account-level consent is not a substitute for task-specific consent where the Platform requires it or law requires it.

The Poster must accurately describe the work and must not expand the task after acceptance without renewed Teen and Guardian approval. A Teen may decline, pause, or stop a Task that differs materially from its listing, feels unsafe, or becomes unlawful. A Poster may not retaliate for a Teen''s refusal or safety report.

### 2.4 Guardian controls and responsibilities

A Guardian may review the controls MORT actually makes available, receive notices selected in account settings, approve or reject Tasks, request an account pause, report safety concerns, and request account closure. MORT describes what task, location, check-in, payment, and message information is visible to a Guardian in the Privacy Notice and product interface. MORT does not promise that a Guardian will monitor a Teen continuously or be present at a Task unless a specific feature or Task condition says so.

A Guardian is responsible for their own conduct and for any payment account they personally open or control. A Guardian is not responsible for every act of a Teen or Poster merely by consenting, except to the extent applicable law and a separate, valid undertaking impose responsibility. Nothing here creates a blanket guaranty, indemnity, waiver of claims, or assumption of the Poster''s legal duties.

### 2.5 Account security and accurate information

Users must provide truthful and current account information, protect credentials, and promptly report suspected account compromise. Users may not impersonate another person, evade age controls, lend accounts, create duplicate or deceptive accounts, or misrepresent authority to act for a business or Teen. MORT may request re-verification and restrict an account pending review.

### 2.6 Turning 18

When a Teen turns 18, Guardian controls and Teen-specific terms cease only as allowed by law and the Platform''s transition process. Continued use as an adult requires acceptance of the then-current adult terms and any adult identity, payment, or tax verification required for enabled features. MORT will not rewrite the historic identity of the person who performed a Task or earned compensation. Any transfer from a Guardian-controlled or custodial account must follow the Payment Provider''s requirements, applicable property law, and the actual ownership arrangement. Certain custodial property may remain subject to statutory rules after age 18.

## 3. Tasks, safety, and conduct

### 3.1 Poster duties and accurate listings

A Poster must be an adult, accurately identify the hiring/requesting person or business, describe all duties and conditions, disclose known hazards, set lawful and age-appropriate hours, and obtain any permission, license, insurance, or supervision required by law. A Poster may not use a listing to obtain work prohibited for a Teen''s age or location or to evade employment, wage, tax, licensing, or safety obligations. The Poster is responsible for the premises and conditions under their control, subject to non-waivable law.

### 3.2 Prohibited and restricted work

No User may post, accept, or perform work that is unlawful, hazardous, age-inappropriate, discriminatory, exploitative, or outside the Teen''s capability or authorization. Unless MORT has specifically reviewed and enabled a narrower exception consistent with applicable law, prohibited work includes:

- Motor-vehicle driving or delivery, being an outside helper on a motor vehicle, or transporting passengers or property as work;
- Roofing, work on roofs, ladders, scaffolds, elevated surfaces, demolition, excavation, trenching, or structural construction or repair;
- Chainsaws, circular saws, wood chippers, power-driven cutting equipment, prohibited mowers or trimmers, forklifts, hoists, compactors, balers, meat slicers, or other prohibited machinery;
- Hazardous chemicals, explosives, weapons, fireworks, dangerous substances, or work in unsafe or restricted areas;
- Alcohol, tobacco, nicotine, vaping, cannabis, controlled substances, adult entertainment, gambling, or weapons-related work or settings;
- Medical, personal-care, intimate-care, or unsupervised caregiving duties requiring a license, specialized training, or access to sensitive personal information;
- Work involving dangerous animals, livestock handling without appropriate lawful supervision, large sums of cash, overnight hours, or any duty barred by the Teen''s age or local law; and
- Any task whose actual duties materially differ from the listing or require an unapproved vehicle, tool, chemical, height, animal, or location.

This list is not complete. A task category that appears ordinary may still be prohibited because of a Teen''s age, equipment, hours, location, school schedule, business context, or actual conditions. MORT may reject or remove a listing without deciding that every unlisted task is lawful.

### 3.3 Hours, permits, and legal compliance

The Poster and any legally responsible employer must comply with applicable federal, state, and local child-labor rules, including age-specific occupation restrictions, hours, breaks, school attendance, minimum wages, recordkeeping, permits or registration where required, and supervision. The Teen and Guardian must provide accurate age and availability information and comply with duties applicable to them. MORT''s scheduling or age controls are not a legal determination and do not replace the Poster''s obligations.

Rules differ by age and jurisdiction. Federal rules generally limit nonagricultural work by 14- and 15-year-olds to specified occupations and hours, and prohibit hazardous occupations for workers under 18. Indiana has separate rules and current agency guidance on youth hours and permits. MORT enables Teen participation only in locations and task categories for which applicable requirements have been determined and operational controls implemented. (See References [1]–[3].)

### 3.4 Contact, private locations, and emergencies

Users must use in-Platform communications for Task coordination when that feature is available. Users may not pressure a Teen to move communications off-platform, keep secrets from a Guardian, exchange inappropriate or sexual messages, request private or intimate images, offer undisclosed gifts, or arrange prohibited off-platform work. These rules do not restrict a User from contacting emergency services, reporting unlawful conduct, or exercising legal rights.

A Teen may not be required to enter an unsafe or secluded location, ride with a Poster, or be alone with an adult in a vehicle. A Task at a private residence may proceed only if it has been disclosed and approved as required by the Platform, applicable law, and MORT''s Safety Rules. Any required second-adult or supervision condition must be confirmed in the task flow and actually maintained by the responsible adult. A click-through approval does not establish that a site is safe.

For immediate danger, call 911 or the appropriate emergency service. In-Platform reporting, check-ins, location signals, or support channels are not emergency dispatch and may not be monitored continuously. Users should report abuse, unsafe tasks, exploitation, payment concerns, and policy violations promptly. MORT may preserve records and disclose information when required or permitted by law, including to protect a person from imminent harm.

### 3.5 Verification and safety tools

MORT may offer particular identity, age, guardian, or background-screening checks only when those services are actually available and accurately described. A badge or check indicates only the specific step completed, as explained in the relevant notice. It does not guarantee identity, honesty, criminal history, suitability, work quality, or physical safety. Background screening may be incomplete, outdated, or subject to legal limits. A User must not treat a check as a substitute for independent judgment.

MORT does not currently provide insurance coverage for Tasks. Users must determine what insurance applies to their own activities, property, or business. Any insurance feature will be described only in a separate, accurate written disclosure identifying the insurer, insureds, coverage, exclusions, and claims process.

## 4. MORT''s current and future features

### 4.1 Features described only when available

The Platform may provide applications, listings, scheduling, messaging, guardian controls, check-ins, PIN flows, location functions, identity verification, background screening, ratings, or payment tools. Availability may differ by state, account, age, device, and launch stage. MORT will not describe a feature as operating, verified, monitored, guaranteed, or available unless the feature is live and the description is accurate. MORT may change or suspend a feature for safety, legal, provider, or technical reasons.

The MORT marketplace is open, and identity verification is available through MORT''s document review process described in Section 1. MORT does not currently process real-world Task payments. Accordingly, MORT does not accept, hold, route, settle, or promise Task payments through the Platform. Before changing that operating model, MORT will update its website, app, store listings, and these Terms, complete required legal and provider review, and give Users all required disclosures. (See [4]–[6].)

### 4.2 User disputes and MORT review

MORT may provide an administrative channel to report a Task, listing, account, or payment concern. Any review is limited to the records and tools available and is not a court, arbitrator, regulator, tax authority, or finding of legal liability. An internal decision does not resolve claims between Users unless they separately agree or applicable law provides otherwise. Users may contact law enforcement, regulators, or other public authorities at any time.

## 5. Fees, payments, and payment features

### 5.1 No payment feature unless specifically enabled

Task payments are not processed by MORT unless and until MORT expressly enables a Payment Feature, identifies the Payment Provider and applicable terms in the product, completes required legal and provider review, and gives Users all required disclosures before a transaction. While no Payment Feature is enabled, Users arrange payment outside the Platform at their own discretion and subject to applicable law; MORT does not collect, hold, safeguard, escrow, route, or guarantee such funds. MORT will not instruct a User to send money to an account controlled by MORT outside an approved Payment Feature.

When enabled, payment processing is provided by the named third-party Payment Provider under its separate terms. MORT is not a bank, insurer, or escrow agent merely because it provides software. This wording does not decide whether a legal license, registration, agency relationship, or other obligation applies; those questions depend on actual funds flow, contracts, state law, and conduct. MORT will enable payment flows only after determining applicable federal and state money-transmission, payment-processing, escrow, consumer, labor, and tax requirements and implementing the required controls. (See [15].)

### 5.2 Price, fees, and authorization

Before a Poster accepts a Task or authorizes payment, the checkout screen shows the Task price, each MORT fee, each Payment Provider fee charged to the User, any tax collected, the total authorized amount, cancellation terms, and the expected payout method and timing. Fees may be changed only prospectively with notice and any consent required by law. Tips, if available, are optional, disclosed, and processed through the approved feature. No User may be charged a hidden fee.

A payment authorization does not guarantee that a charge will settle, that a payout will be immediate, or that funds cannot be subject to a dispute, reversal, legal process, fraud review, reserve, or provider restriction. MORT will not describe a balance as a bank account, stored-value account, escrow, trust, or insured deposit unless MORT has implemented that structure and the statement is accurate.

### 5.3 Cancellations, incomplete Tasks, refunds, and disputes

The booking flow states the cancellation window and any charge before the Poster confirms. No late cancellation charge is imposed unless it was shown before authorization and is lawful. A Teen may cancel or stop a Task at any time for safety or legal reasons without penalty. For ordinary cancellations, the fee and refund shown in the booking flow control, subject to applicable law.

A Poster may report non-performance, material difference, or damage through the published support process within 14 days of the scheduled Task date. MORT may request information from both sides and, if the Payment Provider permits and applicable law allows, direct a full or partial refund or other adjustment. MORT''s review does not adjudicate personal-injury, employment, wage, discrimination, property, or other legal claims. MORT discloses any internal review deadline and will not shorten a non-waivable legal deadline.

Refunds and chargebacks follow the Payment Provider''s rules and the actual charge configuration. A refund may not automatically reverse a transfer to a Provider, and a reversal may fail if funds are unavailable. The user-facing terms and support workflow identify the party responsible for each type of loss and any lawful recovery method. MORT may not debit a minor''s funds or a Guardian''s account except under a valid, disclosed authorization and applicable law.

### 5.4 Holds, reserves, failed payouts, and chargebacks

A Payment Provider may delay, decline, reverse, or restrict a transaction, require identity or tax information, maintain reserves, or impose chargeback and negative-balance rules. MORT may pause a payout for a documented safety, fraud, legal, provider, dispute, or verification reason, but only as allowed by law and the provider agreement. MORT provides a reason and review channel where legally and operationally permitted. A hold is not a forfeiture of a User''s legal rights or a determination that funds belong to MORT.

Before enabling payments, MORT publishes the applicable maximum hold situations, payout timetable, negative-balance allocation, chargeback process, notice method, and escalation path. These details are not supplied by a generic statement that the Payment Provider controls everything.

## 6. Minor payee, payout structure, and payee identity

### 6.1 Who earned the pay; who may receive it

Compensation for a Task is earned by the Teen Provider who performed the Task. A Guardian''s ownership or control of a processor account, bank account, custodial account, or payout method does not change who performed the Task, who earned the compensation, or who owns the proceeds. MORT will not represent otherwise, and no account configuration or Guardian instruction substitutes a Guardian''s name or taxpayer identification number for the Teen''s as the earning party except where a lawful custodial or representative structure verified with the Payment Provider actually applies.

### 6.2 Provider and legal review before enabling teen payouts

Before any Payment Feature is enabled for Teen Providers, MORT confirms in writing with the Payment Provider and counsel that the specific account, age, Guardian, payee, tax-identification, charge, transfer, and payout structure is permitted, including any provider minimum-age requirements for account holders and any representative or custodial account arrangements the provider actually supports. Where required by the provider, the Guardian completes account-owner or representative steps and accepts provider terms before charges or transfers are enabled. (See [16].)

### 6.3 Pre-acceptance payee disclosures

The product clearly discloses before acceptance: (a) the Teen Provider identified as performing the Task; (b) the processor account holder and legally designated payee, where different; (c) the person or entity expected to receive any information return; (d) how funds are tracked and paid; and (e) how a Teen or Guardian can raise a payee, tax-form, or payout error. MORT pauses payout setup if the correct recipient/payee structure cannot be verified.

### 6.4 Custodial and Guardian-held arrangements

If a payout is lawfully directed to a Guardian-held or custodial account (for example, an account structured under applicable minors'' property or custodial-account law), the disclosures in Section 6.3 identify that structure, and the funds remain the property of the Teen to the extent provided by applicable law. A Guardian who receives or controls Teen-earned proceeds holds them subject to the duties applicable to the arrangement used. MORT does not administer, invest, or supervise custodial funds and is not a fiduciary for them.

### 6.5 Payee errors and correction

A Teen or Guardian who believes a payout was sent to the wrong person, mislabeled, or recorded under the wrong payee may report it through the support channel in Section 8. MORT will investigate, coordinate with the Payment Provider where applicable, correct records that MORT controls, and support correction of information returns as provided in Section 7.5. MORT''s correction process does not determine ownership disputes between a Teen and a Guardian, which are governed by applicable property and family law.

## 7. Tax information and reporting

### 7.1 No tax advice; Users'' own obligations

MORT does not give tax advice. Each User must provide accurate information required for a payment or legally required reporting, and must consult a qualified tax professional about their circumstances. Tax treatment depends on actual services, worker classification, payee identity, payment flow, and federal, state, and local law. A Teen''s age or Guardian''s involvement does not by itself determine who earned income or must report it. A User may have tax obligations even if no information return is issued. (See [7]–[10].)

### 7.2 Who reports teen-earned income

Income earned by a Teen Provider for performing a Task is the Teen''s income for tax purposes, regardless of whose payment or bank account receives it. A Guardian may help a Teen comply with tax obligations, including preparing or filing returns, but these Terms do not determine whether a Guardian, Teen, or another person must file or pay tax; that is determined by applicable law and the actual facts. If amounts are paid to a Guardian or a Guardian-controlled account for a Teen''s services, the parties are responsible for the correct tax treatment and reporting of that arrangement.

### 7.3 Information returns MORT or a provider may issue

MORT or the Payment Provider, as applicable, may request tax forms or taxpayer-identification information (including Form W-9 or equivalent) and may issue information returns if required or permitted, including Form 1099-K for payment card and third-party network transactions. A Form 1099-K generally reports gross payment transactions; it does not decide whether the reported amount is taxable income or the recipient''s profit, and the gross amount does not include adjustments for fees, credits, refunds, or discounts. Reporting thresholds and state rules may change; under current federal rules, third-party settlement organizations generally must file Form 1099-K only when gross payments to a payee exceed $20,000 and exceed 200 transactions in a calendar year. MORT may report payment information, correct a form, or apply backup withholding when law requires it. (See [8]–[11].)

### 7.4 Tax documentation before payouts

Before enabling a Payment Feature, MORT documents which party is the payment settlement entity or other reporting payer, which payee is reported, whose name and taxpayer identification number are collected, how minor-earned proceeds are represented, how fees and refunds are handled on statements, and who corrects an erroneous form. The legal and tax reporting recipient must match the real payment and contractual arrangement. MORT may suspend payout eligibility for an account that has not provided required tax information, subject to applicable law.

### 7.5 Corrected and erroneous forms

A User who receives an information return that is incorrect in amount, payee, or taxpayer identification number may request correction through the support channel in Section 8. MORT or the Payment Provider, as the filing party, will issue a corrected form where required or permitted and will provide the User a statement of account records relevant to the correction. A corrected form does not by itself resolve underlying tax liability, ownership of funds, or worker classification.

## 8. Complaints, support, and legal claims

Users should report safety, account, listing, or payment issues to **support@mortapp.org** or the support channel published in the product. MORT may ask for supporting information and may take account or listing action. Internal support does not replace emergency services, government complaints, employment or wage claims, chargeback rights, or a court remedy.

These Terms do not require a Teen or Guardian to arbitrate a claim, waive a jury, waive a class or representative right, shorten a limitation period, or give up a right that law makes non-waivable. No separate dispute-resolution agreement applies to a Teen or Guardian unless separately presented with required notices and accepted in a manner permitted by applicable law. Disputes may be brought in any court with jurisdiction under applicable law.

Indiana law governs only to the extent applicable law permits and without displacing federal law or non-waivable protections of another state. A court proceeding may be brought in a court with jurisdiction and venue under applicable law. Nothing here prevents a User from reporting suspected unlawful conduct to a regulator or law-enforcement authority.

## 9. Reconciliation and transaction records

### 9.1 Transaction-level ledger

For any enabled Payment Feature, MORT maintains records sufficient to trace each transaction from authorization through settlement and final payout or reversal. The operational ledger identifies, at a minimum, the Task/order, Poster, Teen Provider, disclosed payee/account holder, gross charge, MORT and processor fees, taxes collected, refunds, chargebacks, disputes, reserves, transfer IDs, payout status, and adjustments. MORT distinguishes pending, available, reserved, paid, reversed, and disputed amounts and does not treat amounts payable to a User as MORT revenue merely because they pass through a processor account.

### 9.2 Reconciliation schedule and exception handling

MORT reconciles its transaction records to the Payment Provider''s balance transactions, transfers, reversals, fees, refunds, disputes, reserves, payouts, and relevant bank statements on a documented regular schedule (at minimum monthly, and daily while transaction volume is material). MORT investigates unmatched, duplicated, failed, or aged items within that schedule; preserves an audit trail of each adjustment and its approval; restricts access to payment and tax data to authorized personnel; and retains records for the period required by law and the Privacy Notice.

### 9.3 User statements

Users have access to transaction-level statements sufficient to understand amounts charged, fees, taxes, refunds, and payout status. For Teen Providers, statements identify the disclosed payee structure under Section 6.3. Statements are provided through the product or on request through the support channel, subject to account-verification requirements.

### 9.4 No trust or escrow representation

These Terms do not promise a particular accounting treatment and do not establish a trust or escrow relationship. If MORT ever implements a structure in which it holds User funds, it will do so only under the licenses, registrations, bonding, and disclosures required by applicable law, described accurately in a separate Payment Terms document presented before use.

## 10. Privacy, messages, and records

### 10.1 Privacy Notice controls

The Privacy Notice—not this summary—explains information collected, purposes, recipients, precise or approximate location use, Guardian access, retention, deletion, security, vendor sharing, and applicable privacy rights. MORT minimizes collection and exposure of Teen location, personal contact details, photos, school information, and worksite addresses. Users must review the Privacy Notice before using the Platform.

MORT prohibits under-13 accounts. If MORT operates a service directed to children under 13 or has actual knowledge it collects their personal information, additional COPPA obligations apply. Age screening does not itself resolve whether a service is child-directed or satisfies all applicable privacy laws. MORT maintains an age-assurance, privacy, vendor, and retention assessment appropriate to its audience and features. (See [12]–[13].)

### 10.2 Guardian access, moderation, and deletion

The Platform describes what account information a Guardian can see and whether message content is visible. MORT may use automated or human review for safety, abuse, fraud, and legal compliance, but does not claim it reads every message or continuously monitors every Task unless that is true. Users may report or block accounts through the controls actually available.

Users may request account closure or data deletion through the process described in the Privacy Notice. MORT may retain information needed for legal compliance, safety, payment accounting, fraud prevention, tax, dispute, or recordkeeping purposes for the time permitted or required by law. Deletion does not necessarily erase a payment record that MORT must retain or information held by a third-party provider.

### 10.3 Calls, SMS, and marketing

MORT may send essential account, scheduling, security, and safety messages using the contact method selected by a User. Message/data charges may apply. Where law requires consent for automated or prerecorded calls or texts, MORT obtains the required consent, keeps evidence of it, identifies the purpose and sender, and honors revocation promptly. Marketing consent is separate from essential service notices and is not a condition of using the Platform where prohibited. Users may opt out of marketing using the instructions provided. MORT may limit or close an account if it cannot safely provide essential notices, subject to applicable law and alternative contact methods. (See [14].)

## 11. User content and intellectual property

Users are responsible for their User Content and must have authority to submit it. Listings and messages must be accurate, lawful, respectful, and consistent with the Safety Rules. Users must not post personal data about another person without a lawful basis or permission. MORT may remove or restrict content that it reasonably believes violates law, these Terms, or safety rules, and may preserve content when required or reasonably necessary for safety, disputes, or legal compliance.

A User grants MORT a non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, and process User Content only as needed to operate, secure, support, and improve the Platform as described in the Privacy Notice. For a Teen, the Guardian grants this license only to the extent the Guardian has authority and applicable law permits. MORT will not use a Teen''s name, image, or likeness in public marketing without a separate, specific consent that is not a condition of access.

MORT and its licensors own the Platform and its software, design, marks, and related content. Users receive a limited, revocable, non-transferable license to use the Platform for its intended purpose. Users may not scrape, reverse engineer, interfere with, circumvent safety or age controls, or use the Platform unlawfully, except where a restriction is prohibited by law.

Copyright notices must satisfy applicable law and be sent to **support@mortapp.org** with the subject "Copyright Notice."

## 12. Disclaimers and limits

To the extent permitted by law, the Platform is provided "as is" and "as available." MORT does not warrant uninterrupted operation, listing accuracy, Task availability, payment timing, a User''s conduct, or the outcome of any Task. MORT does not guarantee identity, background, safety, work quality, lawful classification, or payment. These statements do not negate any specific promise MORT actually makes, any duty that cannot be disclaimed, or MORT''s responsibility for its own conduct where applicable law imposes it.

To the maximum extent permitted by applicable law, MORT will not be liable for indirect, incidental, special, punitive, or consequential damages arising from use of the Platform. Nothing in these Terms limits liability for fraud, willful misconduct, gross negligence, bodily injury or death where limitation is prohibited, statutory rights, or any liability that cannot legally be limited. No User is asked to waive a Teen''s rights through Guardian assent.

## 13. Indemnity and enforcement

A User is responsible for their own unlawful conduct, User Content, and breach of obligations that are validly binding on that User. MORT may investigate reports, remove listings or content, restrict features, suspend or close accounts, preserve evidence, and cooperate with lawful requests. MORT may act without advance notice where reasonably necessary to address immediate safety, fraud, or legal risks, and will provide notice or an appeal channel where appropriate and lawful.

These Terms impose no indemnity obligation on a Teen and no blanket indemnity obligation on a Guardian. To the maximum extent permitted by law, an adult or business Poster indemnifies MORT against third-party claims arising from that Poster''s unlawful listing, wage or youth-work violation, unsafe worksite, undisclosed hazard, fraud, intentional misconduct, infringement, misuse of personal information, or material breach of these Terms, except where applicable law prohibits such an obligation.

## 14. Service interruption and termination

A User may stop using the Platform or request account closure as described in the Privacy Notice. A Guardian may request a Teen account pause or closure. MORT may suspend or end access for ineligibility, unsafe or unlawful conduct, provider restrictions, nonpayment of a lawful amount, security concerns, or breach of Terms. MORT will provide notice when practicable and an appropriate channel to contest an error, except where notice would create a safety, fraud, or legal risk.

Closing an account does not erase accrued payment obligations, rights to records, or claims that survive under law. Any Task or payment in progress is handled under the disclosed transaction terms and applicable law. Force majeure events may affect Platform availability but do not excuse payment for a completed Task or duties that cannot lawfully be suspended.

## 15. Changes and state availability

MORT may revise these Terms prospectively. It will provide reasonable advance notice of material changes and obtain fresh affirmative assent when required by law or when a material change affects a Teen''s participation, Guardian consent, payment, privacy, or dispute rights. Continued use alone is not treated as consent where affirmative consent is required. The version, date, and method of each User and Guardian acceptance are recorded.

MORT enables Teen accounts only in states and localities for which it has approved a current compliance plan, including age/task rules, privacy, screening, payment, tax, consumer protection, and support requirements. A state addendum is provided before use and controls over a conflicting general term as required. If the legal or operational requirements for a state are not confirmed, MORT may restrict or suspend Teen participation there rather than imply nationwide compliance.

## 16. General terms and acceptance

These Terms and the incorporated documents are the complete agreement about the Platform, except for any valid, separately signed agreement. If a provision is unenforceable, it will be modified only to the extent law permits or severed, and remaining provisions continue. A failure to enforce is not a waiver. A User may not assign their account without permission. MORT may assign these Terms in a merger or transfer of the relevant business, subject to applicable law and the Privacy Notice.

Electronic acceptance and notices may be used where legally valid. MORT preserves the version accepted, date/time, account identity, Guardian relationship, and consent method. Notices to MORT must be sent to **support@mortapp.org**. A notice is effective only as provided by the applicable provision or law.

By selecting "I Agree," the adult User agrees to the terms applicable to them. A Teen''s assent and a Guardian''s affirmative consent are separately captured. Merely browsing a public page does not constitute acceptance. A business Poster represents that the person accepting is authorized to act for the business.

## References

[1] [U.S. Department of Labor, Fact Sheet 43: Child Labor Provisions for Nonagricultural Occupations —](https://www.dol.gov/agencies/whd/fact-sheets/43-child-labor-non-agriculture)
[2] [Indiana Department of Labor, Youth Employment —](https://www.in.gov/dol/youth-employment/youth-employment-home/)
[3] [Indiana General Assembly, Indiana Code Title 22: Labor and Safety —](https://iga.in.gov/laws/current/ic/titles/22/)
[4] [MORT public homepage —](https://mortapp.org/)
[5] [MORT Legal and Safety Archive —](https://legal.mortapp.org/)
[6] [MORT public Terms of Service (effective 2026-10-10) —](https://legal.mortapp.org/terms/)
[7] [IRS, Gig Economy Tax Center —](https://www.irs.gov/businesses/gig-economy-tax-center)
[8] [IRS, Understanding your Form 1099-K —](https://www.irs.gov/businesses/understanding-your-form-1099-k)
[9] [IRS, Form 1099-K FAQs: General Information —](https://www.irs.gov/newsroom/form-1099-k-faqs-general-information)
[10] [IRS, Manage taxes for a digital platform —](https://www.irs.gov/businesses/small-businesses-self-employed/manage-taxes-for-a-digital-platform)
[11] [IRS, Backup withholding —](https://www.irs.gov/businesses/small-businesses-self-employed/backup-withholding)
[12] [FTC, Complying with COPPA: FAQs —](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
[13] [FTC, Changes to the Children''s Privacy Rule (January 2025) —](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data)
[14] [FCC, Stop unwanted robocalls and texts —](https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts)
[15] [FinCEN, Money Services Business Definition and Registration —](https://www.fincen.gov/money-services-business-definition)
[16] [Stripe, Age requirement to create a Stripe account —](https://support.stripe.com/questions/age-requirement-to-create-a-stripe-account)
[17] [Stripe Connect, Handle refunds and disputes —](https://docs.stripe.com/connect/marketplace/tasks/refunds-disputes)
[18] [CFPB Circular 2024-06, Background dossiers and algorithmic scores for employment decisions —](https://www.consumerfinance.gov/compliance/circulars/consumer-financial-protection-circular-2024-06-background-dossiers-and-algorithmic-scores-for-hiring-promotion-and-other-employment-decisions/)
',
  '2026-11-11T01:57:00Z'::timestamptz,
  '2026-11-11T01:57:00Z'::timestamptz,
  true,
  false,
  'published',
  '2026-11-11T00:00:00Z'::timestamptz,
  'Base text MORT-LEGAL-2026-V3 was approved by counsel (Ken Nunn Law Office email approval, 2026-10-28; screenshot SHA-256 8e20e10e02c22f778a39319f59225b47ecfbf97c4abe23b30a09d39e968e03db). V4 (2026-11-10) and V5 (2026-11-11) revisions - open marketplace status, MORT document-review verification, minor-payee/payment/tax framework, and support@mortapp.org notice channel - were approved by counsel on 2026-11-11 (operator-confirmed approval; Ken Nunn Law Office, legal counsel of record). Operator confirmed the approval date on 2026-11-11 during the launch verification session.'
from public.legal_documents d
where d.document_key = 'master_terms_of_service'
  and not exists (
    select 1 from public.legal_document_versions v
    where v.document_id = d.id and v.version_label = 'MORT-LEGAL-2026-V5'
  );

update public.legal_documents
set updated_at = now()
where document_key = 'master_terms_of_service';
