# services_data.py - REFACTORED with Package + Add-on Logic Fix
import json

class ServicesDataManager:
    def __init__(self):
        self.COMPLETE_SERVICES_DATA = self._load_complete_services_data()
    
    def _load_complete_services_data(self):
        """Load complete services data including packages, customized headers, and add-ons"""
        return {
            # **PROJECT REGISTRATION**
            "service-project-registration-1": {
                "name": "PROJECT REGISTRATION SERVICES",
                "origin": "Project Registration",
                "subServices": [
                    {"id": "subservice-project-registration-1-1", "name": "Consultation and Guidance on Registration Procedures"},
                    {"id": "subservice-project-registration-1-2", "name": "Assistance with Online Registration Process"},
                    {"id": "subservice-project-registration-1-3", "name": "Preparation of Necessary Undertakings and Affidavits for RERA Registration"},
                    {"id": "subservice-project-registration-1-4", "name": "Scrutiny Assistance till RERA Certificate is generated"},
                    {"id": "subservice-project-registration-1-5", "name": "Continued support until the RERA Certificate is issued"},
                    {"id": "subservice-project-registration-1-6", "name": "Procurement of CERSAI, Review of certificate as per RERA format"}
                ]
            },
            
            # **LEGAL SERVICES**
            "service-legal-1": {
                "name": "LEGAL CONSULTATION",
                "origin": "Legal Services",
                "subServices": [
                    {"id": "subservice-legal-1-1", "name": "Client Meetings: Conducting conference meetings with the client to understand objectives, clarify requirements, and gather necessary inputs"},
                    {"id": "subservice-legal-1-2", "name": "Review of Agreements for Sale: Examination of the Agreements for Sale executed with existing allottees to assess contractual obligations and relevant clauses"},
                    {"id": "subservice-legal-1-3", "name": "Analysis of Sanctioned Layout Plans: Detailed study of the currently sanctioned layout plans to understand the approved development framework"},
                    {"id": "subservice-legal-1-4", "name": "Review of Proposed Plans: Evaluation of the proposed revised plans in context with the existing development and approvals"},
                    {"id": "subservice-legal-1-5", "name": "Assessment of MahaRERA Profile: Review and analysis of the project's profile on the MahaRERA portal to verify past disclosures"},
                    {"id": "subservice-legal-1-6", "name": "Legal Research on RERA Provisions: In-depth research on the applicable provisions of the Real Estate (Regulation and Development) Act, 2016"},
                    {"id": "subservice-legal-1-7", "name": "Legal Consultation and Opinion: Providing a comprehensive legal opinion on the implications of 14(2) of the RERA Act"},
                    {"id": "subservice-legal-1-8", "name": "Drafting of Consent Letter: Preparation of a draft consent letter for use with allottees, incorporating legal requirements"}
                ]
            },

            # **COMPLIANCE SERVICES**
            "service-compliance-1": {
                "name": "CHANGE OF PROMOTER",
                "origin": "Compliance",
                "subServices": [
                    {"id": "subservice-compliance-1-1", "name": "Change of Promoters as per Section 15: Updating project promoter information in accordance with MahaRERA guidelines"},
                    {"id": "subservice-compliance-1-2", "name": "Drafting of Annexure A, B, and C: Compiling project-related information into required annexures for MahaRERA submission"},
                    {"id": "subservice-compliance-1-3", "name": "Drafting of Consent Letter: Formalizing stakeholders' approval for project-related changes or actions"},
                    {"id": "subservice-compliance-1-4", "name": "Follow-up Till Certificate is Generated: Continuous communication with MahaRERA until project certificate issuance"},
                    {"id": "subservice-compliance-1-5", "name": "Hearing at MahaRERA Office: Attending sessions at MahaRERA to address project-related queries or issues"},
                    {"id": "subservice-compliance-1-6", "name": "Drafting and Uploading of Correction Application: Rectifying errors in project documentation and re-submitting to MahaRERA"},
                    {"id": "subservice-compliance-1-7", "name": "Drafting of Format C: Complying with MahaRERA-prescribed document formats for reporting and compliance purposes"},
                    {"id": "subservice-compliance-1-8", "name": "Scrutiny Assistance Until Certificate is Generated: Providing support during MahaRERA scrutiny process until project certificate issuance"}
                ]
            },
            
            "service-compliance-2": {
                "name": "MAHARERA PROFILE UPDATION",
                "origin": "Compliance", 
                "subServices": [
                    {"id": "subservice-compliance-2-1", "name": "Disclosure of Sold/Unsold Inventory: Thorough drafting and meticulous uploading of the disclosure document showcasing the status of sold and unsold inventory"},
                    {"id": "subservice-compliance-2-2", "name": "Format D Drafting and Uploading: Proficient drafting and systematic uploading of Format D"},
                    {"id": "subservice-compliance-2-3", "name": "CERSAI Report Submission: Facilitating the submission and generation of the CERSAI report, ensuring completeness and adherence to regulatory standards"},
                    {"id": "subservice-compliance-2-4", "name": "Drafted Formats for Form 2A: Preparation and provision of meticulously drafted formats required for Form 2A"},
                    {"id": "subservice-compliance-2-5", "name": "MahaRERA Profile Update: Complete and accurate updating of the MahaRERA profile, ensuring all necessary information is current and compliant pertaining to extension"}
                ]
            },

            # **PACKAGE A SERVICES**
            "service-package-a-1": {
                "name": "CONSULTATION & ADVISORY SERVICES",
                "origin": "Package A",
                "subServices": [
                    {"id": "subservice-package-a-1-1", "name": "Comprehensive consultation regarding the RERA Act & Rules"},
                    {"id": "subservice-package-a-1-2", "name": "Expert Guidance and updates on MahaRERA Orders & Regulations"},
                    {"id": "subservice-package-a-1-3", "name": "Detailed insight into functioning of 100, 70% and 30% Bank Accounts & Procedures for withdrawals"},
                    {"id": "subservice-package-a-1-4", "name": "Advisory Services on contractual Agreements with buyers"},
                    {"id": "subservice-package-a-1-5", "name": "Preventive/Proactive advice with respect to compliances"},
                    {"id": "subservice-package-a-1-6", "name": "Implementation of Consents from Allottees"},
                    {"id": "subservice-package-a-1-7", "name": "Advisory Services on future withdrawals and further functioning of accounts"}
                ]
            },
            
            "service-package-a-2": {
                "name": "QUARTERLY PROGRESS REPORTS",
                "origin": "Package A",
                "subServices": [
                    {"id": "subservice-package-a-2-1", "name": "Vetting of Form 1 (Architect Certificate) as per Annexure A (Regulation 3)"},
                    {"id": "subservice-package-a-2-2", "name": "Vetting of Form 2 (Engineer Certificate) as per Annexure B (Regulation 3)"},
                    {"id": "subservice-package-a-2-3", "name": "Vetting of Form 3 (CA Certificate) as per Annexure D (Regulation 3)"},
                    {"id": "subservice-package-a-2-4", "name": "Drafting of Disclosure of Sold/Unsold Inventory as per Circular 29"},
                    {"id": "subservice-package-a-2-5", "name": "Updation of Work Progress and Development work"},
                    {"id": "subservice-package-a-2-6", "name": "Updation of Cost details (Estimated and Incurred)"},
                    {"id": "subservice-package-a-2-7", "name": "Updation of Inventory Details, Building Details, Project Details, FSI Details & Status"},
                    {"id": "subservice-package-a-2-8", "name": "Updation of Professional details including Channel Partner, Contractors and others"},
                    {"id": "subservice-package-a-2-9", "name": "Filing of QPR Report to MahaRERA on quarterly basis"}
                ]
            },
            
            "service-package-a-3": {
                "name": "RERA PROFILE UPDATION & COMPLIANCE",
                "origin": "Package A",
                "subServices": [
                    {"id": "subservice-package-a-3-1", "name": "Updation of amended/revised permissions from the local planning authority"},
                    {"id": "subservice-package-a-3-2", "name": "Updation of parking details"},
                    {"id": "subservice-package-a-3-3", "name": "Updation and Amendment of Encumbrance Details (Finance/Legal)"},
                    {"id": "subservice-package-a-3-4", "name": "Updation of Litigation details"},
                    {"id": "subservice-package-a-3-5", "name": "Updation of Promoter and Stakeholder details"},
                    {"id": "subservice-package-a-3-6", "name": "Updation of Communication and contact details"},
                    {"id": "subservice-package-a-3-7", "name": "Updation of project professional details"},
                    {"id": "subservice-package-a-3-8", "name": "Drafting assistance of Form 2A (Quality Assurance Certificate)"},
                    {"id": "subservice-package-a-3-9", "name": "Modification & Amendment of Project Details"},
                    {"id": "subservice-package-a-3-10", "name": "Obtaining CERSAI Certificate in case of financial encumbrance"}
                ]
            },
            
            "service-package-a-4": {
                "name": "MAHARERA PROCESS-LINKED APPLICATION SUPPORT",
                "origin": "Package A",
                "subServices": [
                    {"id": "subservice-package-a-4-1", "name": "Project time extension under section 7(3)"},
                    {"id": "subservice-package-a-4-2", "name": "Project Amendment under section 14(2)"},
                    {"id": "subservice-package-a-4-3", "name": "Project Closure application on the receipt of the OC"}
                ]
            },

            # **PACKAGE B SERVICES**
            "service-package-b-1": {
                "name": "PROFESSIONAL CERTIFICATIONS",
                "origin": "Package B",
                "subServices": [
                    {"id": "subservice-package-b-1-1", "name": "Preparing/Updating estimates related to cost of construction for the project"},
                    {"id": "subservice-package-b-1-2", "name": "Preparation and Certification of Form 2 (Engineers Certificate)"},
                    {"id": "subservice-package-b-1-3", "name": "Cost accounting as per RERA for evaluating the expenses incurred in the project as per Books of Accounts"},
                    {"id": "subservice-package-b-1-4", "name": "Preparing the detailed report of the Receipts of the Project as per RERA"},
                    {"id": "subservice-package-b-1-5", "name": "Constituting the valuation of the unsold inventory"},
                    {"id": "subservice-package-b-1-6", "name": "Preparation and Certification of Form 3 (CA Certificate)"},
                    {"id": "subservice-package-b-1-7", "name": "Recommendations with respect to modification or amendments to Form 3 (CA Certificate)"},
                    {"id": "subservice-package-b-1-8", "name": "Consultation in Compilation of Form 3 (CA Certificate)"},
                    {"id": "subservice-package-b-1-9", "name": "Advise on adhering to financial reporting and management practices mandated by RERA for the project"}
                ]
            },

            # **PACKAGE C SERVICES**
            "service-package-c-1": {
                "name": "RERA ANNUAL AUDIT CONSULTATION",
                "origin": "Package C",
                "subServices": [
                    {"id": "subservice-package-c-1-1", "name": "Consultation regarding Examination of the Prescribed Registers, Books & Documents, and Relevant Records"},
                    {"id": "subservice-package-c-1-2", "name": "Drafting assistance of Form 5 (Annual Report on Statement of Account) as per the Registers, Books & Documents"},
                    {"id": "subservice-package-c-1-3", "name": "Certification & Submission of Form 5"}
                ]
            },

            # **PACKAGE D SERVICES**
            "service-package-d-1": {
                "name": "BESPOKE OFFERINGS",
                "origin": "Package D",
                "subServices": [
                    {"id": "subservice-package-d-1-1", "name": "Conducting one training the Internal teams - Finance, Accounts, Sales, to provide an overview and understating of the RERA Regulation for smooth operation"},
                    {"id": "subservice-package-d-1-2", "name": "Dedicated Relationship Manager as one Point of Contact"},
                    {"id": "subservice-package-d-1-3", "name": "Accessibility for the RERA related queries and doubts"},
                    {"id": "subservice-package-d-1-4", "name": "Coordinating with various teams to gather the required information, documents, and details for compliance completion"}
                ]
            },
            
            "service-package-d-2": {
                "name": "Regulatory Hearing & Notices",
                "origin": "Package D",
                "subServices": [
                    {"id": "subservice-package-d-2-1", "name": "Handling and complying to the notices issued by the MahaRERA"},
                    {"id": "subservice-package-d-2-2", "name": "Replying to the notices and Suo-Moto orders being issued by MahaRERA for the particular project"},
                    {"id": "subservice-package-d-2-3", "name": "Representing the Developers in front of Authorities"},
                    {"id": "subservice-package-d-2-4", "name": "Appearing the Regulatory hearings imposed as Suo-Moto by the Authority"}
                ]
            },

            # **ADD-ON SERVICES**
            "service-addon-1": {
                "name": "LIAISONING",
                "origin": "Add ons",
                "subServices": [
                    {"id": "subservice-addon-1-1", "name": "Liaising with MahaRERA authorities to ensure seamless communication between your organization and the regulatory body"},
                    {"id": "subservice-addon-1-2", "name": "Managing complex documentation, addressing compliance challenges, and resolving regulatory disputes to prevent delays and ensure timely approvals"}
                ]
            },
            
            "service-addon-2": {
                "name": "Legal Documentation",
                "origin": "Add ons",
                "subServices": [
                    {"id": "subservice-addon-2-1", "name": "Drafting of Agreement for Sale in Compliance with MahaRERA Regulations"},
                    {"id": "subservice-addon-2-2", "name": "Drafting of Allotment Letters in Compliance with MahaRERA Regulations"},
                    {"id": "subservice-addon-2-3", "name": "Preparation and Submission of Deviation Reports for Agreement for Sale"},
                    {"id": "subservice-addon-2-4", "name": "Preparation and Submission of Deviation Reports for Allotment Letters"},
                    {"id": "subservice-addon-2-5", "name": "Vetting of Agreement for Sale in Compliance with MahaRERA Regulations"},
                    {"id": "subservice-addon-2-6", "name": "Vetting of Allotment Letters in Compliance with MahaRERA Regulations"},
                    {"id": "subservice-addon-2-7", "name": "Vetting and Submission of Deviation Reports for Agreement for Sale"},
                    {"id": "subservice-addon-2-8", "name": "Vetting and Submission of Deviation Reports for Allotment Letters"}
                ]
            },
            
            "service-addon-3": {
                "name": "Title Report",
                "origin": "Add ons",
                "subServices": [
                    {"id": "subservice-addon-3-1", "name": "Procurement of Title Certificate"},
                    {"id": "subservice-addon-3-2", "name": "Conducting Title Search and Examination"}
                ]
            },
            
            "service-addon-4": {
                "name": "Architect's Certificate as per Form 1",
                "origin": "Add ons",
                "requiresYearQuarter": True,
                "subServices": [
                    {"id": "subservice-addon-4-1", "name": "Provide duly certified Form 1 (Architect Certificate) as required under MahaRERA for project registration and milestone-based withdrawals"},
                    {"id": "subservice-addon-4-2", "name": "Verify and certify the percentage of construction completed in accordance with approved plans and RERA guidelines"}
                ]
            },
            
            "service-addon-5": {
                "name": "Engineer's Certificate as per Form 2",
                "origin": "Add ons",
                "requiresYearQuarter": True,
                "subServices": [
                    {"id": "subservice-addon-5-1", "name": "Provide duly certified Form 2 (Engineer Certificate) as required under MahaRERA, certifying the actual cost incurred on construction up to a specific stage"},
                    {"id": "subservice-addon-5-2", "name": "The certificate is prepared in coordination with Form 1 (Architect's Certificate) and Form 3 (CA's Certificate) to ensure consistency across physical progress and financial reporting"}
                ]
            },
            
            "service-addon-6": {
                "name": "Chartered Accountant's Certificate as per Form 3",
                "origin": "Add ons",
                "requiresYearQuarter": True,
                "subServices": [
                    {"id": "subservice-addon-6-1", "name": "Provide duly certified Form 3 (CA Certificate) as required under MahaRERA, certifying the financial aspects of the project including funds received and utilized"},
                    {"id": "subservice-addon-6-2", "name": "The certificate is prepared in coordination with Form 1 (Architect's Certificate) and Form 2 (Engineer's Certificate) to ensure consistency across physical progress and financial reporting"}
                ]
            },
            
            "service-addon-7": {
                "name": "Annual Return/Report as per Form 5",
                "origin": "Add ons",
                "requiresYearOnly": True,
                "subServices": [
                    {"id": "subservice-addon-7-1", "name": "Drafting assistance of Form 5 (Annual Report on Statement of Account) as per the Registers, Books & Documents"},
                    {"id": "subservice-addon-7-2", "name": "Certification of Form 5"}
                ]
            },
            
            "service-addon-8": {
                "name": "Search Report",
                "origin": "Add ons",
                "subServices": [
                    {"id": "subservice-addon-8-1", "name": "Conduct thorough searches of public land records for title investigation"},
                    {"id": "subservice-addon-8-2", "name": "Provide details on ownership history, encumbrances, legal descriptions, and tax status"},
                    {"id": "subservice-addon-8-3", "name": "Support accurate and efficient preparation of land title reports for legal or transactional use"}
                ]
            },
            
            "service-addon-9": {
                "name": "SRO Membership",
                "origin": "Add ons",
                "subServices": [
                    {"id": "subservice-addon-9-1", "name": "Assist developers in obtaining SRO membership as mandated under MahaRERA guidelines for registered promoters"},
                    {"id": "subservice-addon-9-2", "name": "Manage end-to-end application process, including documentation, eligibility verification, and coordination with recognized SRO bodies"},
                    {"id": "subservice-addon-9-3", "name": "Ensure compliance with RERA norms by facilitating timely registration, renewals, and updates related to SRO membership"}
                ]
            }
        }

    def get_actual_subservices(self, service_id):
        """Get actual subservice names from the complete services data"""
        service_data = self.COMPLETE_SERVICES_DATA.get(service_id, {})
        subservices = service_data.get('subServices', [])
        
        # Filter out any numeric-only entries and ensure proper formatting
        filtered_subservices = []
        for sub in subservices:
            if isinstance(sub, dict) and sub.get('name'):
                name = sub['name'].strip()
                # Skip if the name is just a number or empty
                if name and not name.isdigit():
                    filtered_subservices.append({
                        'id': sub.get('id', ''),
                        'name': name,
                        'included': sub.get('included', True)
                    })
        
        return filtered_subservices

    def is_package_header(self, header_name):
        """Check if the header is a package type"""
        return header_name and any(pkg in header_name.lower() for pkg in ['package a', 'package b', 'package c', 'package d'])

    def is_customized_header(self, header_name):
        """Check if the header is a customized header"""
        return header_name and 'customized' in header_name.lower()

    def get_services_for_package(self, package_name):
        """Get all services that should be included in a package"""
        package_services = []
        
        # Package hierarchy - each package includes previous packages
        package_hierarchy = {
            'package a': ['service-package-a-1', 'service-package-a-2', 'service-package-a-3', 'service-package-a-4'],
            'package b': ['service-package-a-1', 'service-package-a-2', 'service-package-a-3', 'service-package-a-4', 'service-package-b-1'],
            'package c': ['service-package-a-1', 'service-package-a-2', 'service-package-a-3', 'service-package-a-4', 'service-package-b-1', 'service-package-c-1'],
            'package d': ['service-package-a-1', 'service-package-a-2', 'service-package-a-3', 'service-package-a-4', 'service-package-b-1', 'service-package-c-1', 'service-package-d-1', 'service-package-d-2']
        }
        
        package_key = package_name.lower()
        service_ids = package_hierarchy.get(package_key, [])
        
        for service_id in service_ids:
            if service_id in self.COMPLETE_SERVICES_DATA:
                service_data = self.COMPLETE_SERVICES_DATA[service_id]
                package_services.append({
                    'id': service_id,
                    'name': service_data['name'],
                    'label': service_data['name'],
                    'subServices': self.get_actual_subservices(service_id)
                })
        
        return package_services

    def process_headers_with_subservices(self, headers):
        """Enhanced processing to properly handle add-on services in packages"""
        processed_headers = []
        
        for header in headers:
            header_name = header.get('header') or header.get('name', '')
            processed_header = {
                'header': header_name,
                'name': header_name,
                'services': []
            }
            
            if self.is_package_header(header_name):
                # For packages, first add core package services
                package_services = self.get_services_for_package(header_name)
                
                # Add core package services
                for package_service in package_services:
                    processed_service = {
                        'id': package_service['id'],
                        'name': package_service['name'], 
                        'label': package_service['label'],
                        'subServices': package_service.get('subServices', [])
                    }
                    processed_header['services'].append(processed_service)
                
                # CRITICAL FIX: Also add any additional services (including add-ons)
                for service in header.get('services', []):
                    service_id = service.get('id')
                    
                    # Skip if this service is already added as core package service
                    already_exists = any(ps['id'] == service_id for ps in processed_header['services'])
                    if not already_exists:
                        actual_subservices = self.get_actual_subservices(service_id)
                        
                        processed_service = {
                            'id': service_id,
                            'name': service.get('name') or service.get('label'),
                            'label': service.get('label') or service.get('name'),
                            'subServices': actual_subservices
                        }
                        
                        # Preserve quarter information if present
                        if service.get('quarterCount'):
                            processed_service['quarterCount'] = service.get('quarterCount')
                        if service.get('selectedQuarters'):
                            processed_service['selectedQuarters'] = service.get('selectedQuarters')
                        if service.get('selectedYears'):
                            processed_service['selectedYears'] = service.get('selectedYears')
                        
                        processed_header['services'].append(processed_service)
                        print(f"✅ Added add-on service to package: {service_id}")
            
            elif self.is_customized_header(header_name):
                # For customized headers, process selected services normally
                for service in header.get('services', []):
                    service_id = service.get('id')
                    actual_subservices = self.get_actual_subservices(service_id)
                    
                    processed_service = {
                        'id': service_id,
                        'name': service.get('name') or service.get('label'),
                        'label': service.get('label') or service.get('name'),
                        'subServices': actual_subservices
                    }
                    
                    # Preserve quarter information if present
                    if service.get('quarterCount'):
                        processed_service['quarterCount'] = service.get('quarterCount')
                    if service.get('selectedQuarters'):
                        processed_service['selectedQuarters'] = service.get('selectedQuarters')
                    if service.get('selectedYears'):
                        processed_service['selectedYears'] = service.get('selectedYears')
                    
                    processed_header['services'].append(processed_service)
            
            else:
                # For regular headers, process services normally
                for service in header.get('services', []):
                    service_id = service.get('id')
                    actual_subservices = self.get_actual_subservices(service_id)
                    
                    processed_service = {
                        'id': service_id,
                        'name': service.get('name') or service.get('label'),
                        'label': service.get('label') or service.get('name'),
                        'subServices': actual_subservices
                    }
                    
                    # Preserve quarter information if present
                    if service.get('quarterCount'):
                        processed_service['quarterCount'] = service.get('quarterCount')
                    if service.get('selectedQuarters'):
                        processed_service['selectedQuarters'] = service.get('selectedQuarters')
                    if service.get('selectedYears'):
                        processed_service['selectedYears'] = service.get('selectedYears')
                    
                    processed_header['services'].append(processed_service)
            
            processed_headers.append(processed_header)
        
        return processed_headers

    def _map_service_name(self, frontend_service_name):
        """Map frontend service names to actual pricing JSON service names"""
        service_name_mapping = {
            # Project Registration Services
            "PROJECT REGISTRATION SERVICES": "Project Registration ",
            
            # Compliance Services
            "CHANGE OF PROMOTER": "Change of Promoter (section 15)",
            "CORRECTION (CHANGE OF FSI)": "Project Correction - Change of FSI/ Plan",
            "MAHARERA PROFILE UPDATION": "Profile Updation ",
            "MAHARERA PROFILE MIGRATION": "Profile Migration",
            "REMOVAL FROM ABEYANCE (QPR)": "Removal of Abeyance - QPR, Lapsed",
            "Extension of Project Completion Date U/S 7(3)": "Project Extension - Section 7.3",
            "PROJECT CLOSURE": "Project Closure ",
            "10. Extension of Project Completion Date u/s 6": "Project Extension - Section 7.3",
            "POST FACTO EXTENSION": "Project Extension - Post Facto",
            "EXTENSION UNDER ORDER 40": "Project Extension - Order No. 40",
            "Correction (Change of Bank Account)": "Project Correction - Change of Bank Account",
            "Removal from Abeyance (Lapsed)": "Removal of Abeyance - QPR, Lapsed",
            "Project De-registration": "Deregistration ",
            "Drafting of Title Report in Format A": "Drafting of Title Report in Format A",
            "Correction - Change of other Details": "Project Correction - Change of Other Details",
            
            # Legal Services
            "LEGAL CONSULTATION": "Drafting of Legal Documents",
            
            # Package Services
            "CONSULTATION & ADVISORY SERVICES": "Package A",
            "QUATERLY PROGRESS REPORTS": "QPR",
            "QUARTERLY PROGRESS REPORTS": "QPR",
            "RERA PROFILE UPDATION & COMPLIANCE": "Profile Updation ",
            "MAHARERA PROCESS-LINKED APPLICATION SUPPORT": "Project Extension - Section 7.3",
            "PROFESSIONAL CERTIFICATIONS": "Package B",
            "RERA ANNUAL AUDIT CONSULTATION": "Package C",
            "BESPOKE OFFERINGS": "Package D",
            "Regulatory Hearing & Notices": "Package D",
            
            # Add-on Services
            "LIAISONING": "Liasioning ",
            "Legal Documentation": "Drafting of Legal Documents",
            "Title Report": "Title Certificate",
            "Search Report": "Drafting of Title Report in Format A",
            "SRO Membership": "SRO Membership",
            "Architect's Certificate as per Form 1": "Form 1",
            "Engineer's Certificate as per Form 2": "Form 2 ",
            "Chartered Accountant's Certificate as per Form 3": "Form 3",
            "Annual Return/Report as per Form 5": "Form 5"
        }
        
        # Return mapped name or original name if no mapping exists
        return service_name_mapping.get(frontend_service_name, frontend_service_name)

    def _find_pricing_from_array(self, category, region, plot_area, service_name, pricing_data):
        """Find pricing for a specific service from the flat pricing array"""
        
        # Map the frontend service name to the actual JSON service name
        mapped_service_name = self._map_service_name(service_name)
        
        # Fix category format (frontend sends "category 1" but JSON has "Category 1")
        if category.lower().startswith('category'):
            formatted_category = category.title()  # "category 1" -> "Category 1"
        else:
            formatted_category = category
        
        # Determine pricing band - exact matching with what's in the data
        if plot_area <= 500:
            band = "0-500"
        elif plot_area <= 2000:
            band = "500-2000" 
        elif plot_area <= 4000:
            band = "2000-4000"
        elif plot_area <= 6500:
            band = "4000-6500"
        else:
            band = "6500 and above"
        
        # Search through the pricing data array
        for item in pricing_data:
            # Match all criteria using the mapped service name and formatted category
            if (item.get('Developer Type ') == formatted_category and 
                item.get('Project location ') == region and
                item.get('Plot Area') == band and
                item.get('Service', '').strip() == mapped_service_name.strip()):
                
                amount = item.get('Amount')
                # Handle string amounts and special cases
                if isinstance(amount, str):
                    if amount == '-' or amount.strip() == '':
                        return 0
                    try:
                        parsed_amount = float(amount.replace(',', ''))
                        return parsed_amount
                    except ValueError:
                        return 50000
                elif isinstance(amount, (int, float)):
                    return float(amount)
                else:
                    return 50000
        
        # Fallback: try to find a close match by relaxing some criteria
        for item in pricing_data:
            if (item.get('Developer Type ') == formatted_category and 
                item.get('Service', '').strip() == mapped_service_name.strip()):
                amount = item.get('Amount')
                if isinstance(amount, str):
                    if amount == '-' or amount.strip() == '':
                        return 0
                    try:
                        return float(amount.replace(',', ''))
                    except ValueError:
                        continue
                elif isinstance(amount, (int, float)):
                    return float(amount)
        
        # Final fallback
        return 50000

    def calculate_enhanced_pricing(self, category, region, plot_area, headers, pricing_data):
        """Enhanced pricing calculation that properly handles add-on services in packages"""
        
        breakdown, total, total_services = [], 0.0, 0

        for header_data in headers:
            header_name = header_data.get('header') or header_data.get('name', '')
            header_services, header_total = [], 0.0

            # **Enhanced service processing for all header types**
            services_to_process = []
            
            if self.is_package_header(header_name):
                # For packages, calculate core package price
                package_price = self._find_pricing_from_array(category, region, plot_area, header_name, pricing_data)
                
                # Add core package as single line item
                header_services.append({
                    "id": f"package-{header_name.lower().replace(' ', '-')}",
                    "name": f"{header_name} (Core Services)",
                    "baseAmount": package_price,
                    "totalAmount": round(package_price, 2),
                    "subServices": []
                })
                
                header_total += package_price
                total_services += 1
                
                # CRITICAL FIX: Process additional add-on services separately
                for service in header_data.get('services', []):
                    service_id = service.get('id', '')
                    
                    # Only process add-on services (not core package services)
                    if service_id.startswith('service-addon-'):
                        s_name = service.get('label') or service.get('name', '')
                        
                        # Get pricing for add-on service
                        addon_price = self._find_pricing_from_array(category, region, plot_area, s_name, pricing_data)
                        
                        # Get actual subservices
                        actual_subservices = self.get_actual_subservices(service_id)
                        
                        # Handle time-based pricing for add-ons
                        service_data = self.COMPLETE_SERVICES_DATA.get(service_id, {})
                        requires_quarter_pricing = service_data.get('requiresYearQuarter', False)
                        requires_year_pricing = service_data.get('requiresYearOnly', False)
                        
                        if requires_quarter_pricing:
                            quarter_count = service.get('quarterCount', 1)
                            total_amt = addon_price * quarter_count
                        elif requires_year_pricing:
                            year_count = len(service.get('selectedYears', [])) or 1
                            total_amt = addon_price * year_count
                        else:
                            total_amt = addon_price

                        service_entry = {
                            "id": service_id,
                            "name": f"{s_name} (Add-on)",
                            "baseAmount": addon_price,
                            "totalAmount": round(total_amt, 2),
                            "subServices": actual_subservices
                        }
                        
                        # Add time-based pricing information if applicable
                        if requires_quarter_pricing:
                            service_entry["requiresYearQuarter"] = True
                            service_entry["quarterCount"] = service.get('quarterCount', 1)
                            service_entry["basePrice"] = addon_price
                        elif requires_year_pricing:
                            service_entry["requiresYearOnly"] = True
                            service_entry["yearCount"] = len(service.get('selectedYears', [])) or 1
                            service_entry["basePrice"] = addon_price
                        
                        header_services.append(service_entry)
                        header_total += total_amt
                        total_services += 1
                        
                        print(f"💰 Added add-on pricing: {s_name} = ₹{total_amt}")
                
                # Skip the normal service processing for packages
                services_to_process = []
            else:
                # For regular and customized headers, use provided services
                services_to_process = header_data.get('services', [])

            for service in services_to_process:
                service_id = service.get('id')
                s_name = service.get('label') or service.get('name', '')
                
                # Get exact pricing from JSON - no multipliers applied
                exact_price = self._find_pricing_from_array(category, region, plot_area, s_name, pricing_data)

                # **Get actual subservices with proper names**
                actual_subservices = self.get_actual_subservices(service_id)
                
                # Check if this service requires time-based pricing
                service_data = self.COMPLETE_SERVICES_DATA.get(service_id, {})
                requires_quarter_pricing = service_data.get('requiresYearQuarter', False)
                requires_year_pricing = service_data.get('requiresYearOnly', False)
                
                # Calculate final price based on time multiplier if applicable
                if requires_quarter_pricing:
                    # Get quarter count from service data, default to 1 if not specified
                    quarter_count = service.get('quarterCount', 1)
                    total_amt = exact_price * quarter_count
                elif requires_year_pricing:
                    # Get year count from service data, default to 1 if not specified
                    year_count = len(service.get('selectedYears', [])) or 1
                    total_amt = exact_price * year_count
                else:
                    # Use exact price from JSON without any multipliers
                    total_amt = exact_price

                service_entry = {
                    "id": service_id,
                    "name": s_name,
                    "baseAmount": exact_price,
                    "totalAmount": round(total_amt, 2),
                    "subServices": actual_subservices  # **Proper subservices with names**
                }
                
                # Add time-based pricing information if applicable
                if requires_quarter_pricing:
                    service_entry["requiresYearQuarter"] = True
                    service_entry["quarterCount"] = service.get('quarterCount', 1)
                    service_entry["basePrice"] = exact_price
                elif requires_year_pricing:
                    service_entry["requiresYearOnly"] = True
                    service_entry["yearCount"] = len(service.get('selectedYears', [])) or 1
                    service_entry["basePrice"] = exact_price
                
                header_services.append(service_entry)

                header_total += total_amt
                total_services += 1

            breakdown.append({
                "header": header_name,
                "services": header_services,
                "headerTotal": round(header_total, 2)
            })

            total += header_total

        return {
            "success": True,
            "breakdown": breakdown,
            "summary": {"subtotal": round(total, 2), "totalServices": total_services}
        }


# Create a global instance
services_manager = ServicesDataManager()

# Export functions for easy access
def get_actual_subservices(service_id):
    return services_manager.get_actual_subservices(service_id)

def is_package_header(header_name):
    return services_manager.is_package_header(header_name)

def is_customized_header(header_name):
    return services_manager.is_customized_header(header_name)

def get_services_for_package(package_name):
    return services_manager.get_services_for_package(package_name)

def process_headers_with_subservices(headers):
    return services_manager.process_headers_with_subservices(headers)

def calculate_enhanced_pricing(category, region, plot_area, headers, pricing_data):
    return services_manager.calculate_enhanced_pricing(category, region, plot_area, headers, pricing_data)

# **UPDATED APPROVAL FUNCTIONS** - NEW LOGIC FOR CORE vs ADD-ON SERVICES

def requires_approval_due_to_packages(headers):
    """
    NEW LOGIC: Only require approval if package headers contain ADD-ON services
    Core package services alone should NOT require approval
    """
    if not headers:
        return False
    
    for header_data in headers:
        header_name = header_data.get('header', '') or header_data.get('name', '')
        
        # Check if this is a package header
        if is_package_header(header_name):
            services = header_data.get('services', [])
            if services and len(services) > 0:
                
                # Check if any services are ADD-ON services (not core package services)
                for service in services:
                    service_id = service.get('id', '')
                    
                    # If service ID starts with 'service-addon-', it's an add-on service
                    if service_id.startswith('service-addon-'):
                        print(f"🚨 APPROVAL REQUIRED: Package '{header_name}' contains add-on service '{service_id}'")
                        return True
                        
                # If we reach here, package contains only core services
                print(f"✅ NO APPROVAL: Package '{header_name}' contains only core services")
    
    return False

def requires_approval_due_to_customized_header(headers):
    """
    Keep existing logic for customized headers
    """
    if not headers:
        return False
    
    for header_data in headers:
        header_name = header_data.get('header', '') or header_data.get('name', '')
        if is_customized_header(header_name):
            services = header_data.get('services', [])
            if services and len(services) > 0:
                return True
    return False

def has_addon_services_in_packages(headers):
    """
    NEW HELPER: Check specifically for add-on services in any header
    """
    if not headers:
        return False
        
    for header_data in headers:
        services = header_data.get('services', [])
        for service in services:
            service_id = service.get('id', '')
            if service_id.startswith('service-addon-'):
                return True
    return False