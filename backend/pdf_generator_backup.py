import os
from jinja2 import Environment, FileSystemLoader
import pdfkit
from pypdf import PdfWriter, PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

class QuotationPDFGenerator:
    def __init__(self, template_dir="."):
        # Template setup
        self.template_dir = os.path.abspath(template_dir)
        self.env = Environment(loader=FileSystemLoader(self.template_dir))
        self.template_name = "quotation_multipage_template.html"

        # wkhtmltopdf setup
        default_path = r"C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe"
        self.path_wkhtmltopdf = os.environ.get("WKHTMLTOPDF_PATH", default_path)

        if not os.path.exists(self.path_wkhtmltopdf):
            raise FileNotFoundError(
                f"wkhtmltopdf not found at {self.path_wkhtmltopdf}. "
                "Install from https://wkhtmltopdf.org/downloads.html or set WKHTMLTOPDF_PATH."
            )

        self.config = pdfkit.configuration(wkhtmltopdf=self.path_wkhtmltopdf)

        # Enhanced options for multi-page layout
        self.wk_options = {
            "enable-local-file-access": None,
            "allow": [self.template_dir],
            "page-size": "A4",
            "margin-top": "20mm",
            "margin-right": "15mm", 
            "margin-bottom": "15mm",
            "margin-left": "15mm",
            "quiet": "",
            "load-error-handling": "ignore",
            "load-media-error-handling": "ignore",
            "print-media-type": "",
            "dpi": "300",
            "image-dpi": "300",
            "image-quality": "100",
            "disable-smart-shrinking": "",
            "enable-smart-shrinking": None,  # Better page breaks
        }

    def safe_number(self, v, default=0):
        if v is None:
            return default
        try:
            return float(v) if v != "" else default
        except (ValueError, TypeError):
            return default

    def safe_string(self, v, default=""):
        return default if v is None else str(v).strip()

    def generate_multipage_pdf(self, quotation_data, filename):
        """
        Generate multi-page PDF with the exact layout:
        - Each header on separate page
        - Header in middle, logo on top right
        - Amount on LEFT, services on RIGHT
        - Total & Terms on separate page
        - Disclaimer on separate page
        """
        print(f"📚 generate_multipage_pdf called with template: {self.template_name}")
        print(f"📊 DEBUG: quotation_data keys: {list(quotation_data.keys())}")

        base_dir = os.path.dirname(os.path.abspath(__file__))

        # Get display mode
        display_mode = quotation_data.get('displayMode', 'bifurcated')
        print(f"🔧 Display mode: {display_mode}")

        # Process headers for multi-page layout
        processed_headers = []

        for header in quotation_data.get("headers", []):
            header_name = self.safe_string(header.get("name", ""))

            # Check if this is a package
            is_package = any(pkg in header_name.lower() for pkg in ["package a", "package b", "package c", "package d", "package"])

            # Process services
            processed_services = []
            package_total = 0

            # Get pricing from breakdown
            service_price_map = {}
            header_price_map = {}

            if quotation_data.get("pricingBreakdown"):
                for breakdown in quotation_data["pricingBreakdown"]:
                    # Map header prices
                    header_name_key = breakdown.get("name") or breakdown.get("header")
                    if header_name_key:
                        total_amount = breakdown.get("totalAmount") or breakdown.get("headerTotal") or breakdown.get("total", 0)
                        header_price_map[header_name_key.strip()] = self.safe_number(total_amount)

                    # Map service prices
                    if breakdown.get("services"):
                        for service in breakdown["services"]:
                            if service.get("name"):
                                price = service.get("finalAmount") or service.get("totalAmount") or service.get("price", 0)
                                service_price_map[service["name"].strip()] = self.safe_number(price)

            # Calculate package total if needed
            if is_package:
                package_total = header_price_map.get(header_name.strip(), 0)

                if not package_total and quotation_data.get("pricingBreakdown"):
                    package_breakdown = next((b for b in quotation_data["pricingBreakdown"]
                                            if (b.get("name", "").strip() == header_name.strip() or
                                                b.get("header", "").strip() == header_name.strip())), None)

                    if package_breakdown and package_breakdown.get("services"):
                        services_total = sum(self.safe_number(s.get("finalAmount") or s.get("totalAmount", 0))
                                           for s in package_breakdown["services"])
                        package_total = services_total

                print(f"📦 Package '{header_name}' total: {package_total}")

            # Process each service
            for service in header.get("services", []):
                service_name = self.safe_string(service.get("name", ""))
                service_price = service_price_map.get(service_name, 0)

                if not service_price:
                    service_price = self.safe_number(service.get("price", 0))

                # Handle display price based on mode
                display_price = service_price
                if display_mode == 'lumpsum' and is_package:
                    display_price = None  # Hide individual prices in lumpsum mode

                # Process sub-services
                sub_services = []
                for sub in service.get("subServices", []):
                    if isinstance(sub, dict):
                        sub_name = self.safe_string(sub.get("name", ""))
                        if sub_name and sub.get("included", True):
                            sub_services.append({
                                "id": sub.get("id", ""),
                                "name": sub_name
                            })
                    elif isinstance(sub, str):
                        sub_name = self.safe_string(sub)
                        if sub_name:
                            sub_services.append({
                                "id": "",
                                "name": sub_name
                            })

                processed_services.append({
                    "name": service_name,
                    "price": service_price,
                    "display_price": display_price,
                    "subServices": sub_services
                })

            processed_headers.append({
                "name": header_name,
                "services": processed_services,
                "is_package": is_package,
                "package_total": package_total
            })

        # Calculate total amount with enhanced logic
        total_amount = self.safe_number(quotation_data.get("totalAmount", 0))

        if not total_amount and quotation_data.get("pricingBreakdown"):
            total_amount = 0
            for breakdown in quotation_data["pricingBreakdown"]:
                if breakdown.get("services"):
                    for service in breakdown["services"]:
                        price = service.get("finalAmount") or service.get("totalAmount", 0)
                        total_amount += self.safe_number(price)

        # Fallback calculation from processed headers
        if not total_amount:
            for header in processed_headers:
                if header["is_package"] and header["package_total"]:
                    total_amount += header["package_total"]
                else:
                    for service in header["services"]:
                        total_amount += service["price"]

        # Final safety check
        if total_amount <= 0:
            print("⚠️  WARNING: Total amount is zero! Using minimum value...")
            total_amount = 1

        print(f"💰 Final total_amount: ₹{total_amount:,.0f}")

        # Process terms & conditions
        terms = []

        # Generate dynamic terms based on quotation data
        validity = quotation_data.get("validity") or quotation_data.get("validityPeriod")
        if validity:
            validity_str = str(validity).lower()
            validity_days = 0
            if "7" in validity_str:
                validity_days = 7
            elif "15" in validity_str:
                validity_days = 15
            elif "30" in validity_str:
                validity_days = 30
            else:
                import re
                matches = re.findall(r'\\d+', validity_str)
                if matches:
                    validity_days = int(matches[0])

            if validity_days > 0:
                from datetime import datetime, timedelta
                try:
                    base_date = datetime.fromisoformat(quotation_data.get("createdAt", "").replace('Z', '+00:00')) if quotation_data.get("createdAt") else datetime.now()
                    valid_until = base_date + timedelta(days=validity_days)
                    formatted_date = valid_until.strftime("%d/%m/%Y")
                    terms.append(f"The quotation is valid upto {formatted_date}.")
                except:
                    terms.append(f"The quotation is valid for {validity_days} days.")

        # Add payment schedule term
        payment_schedule = quotation_data.get("paymentSchedule") or quotation_data.get("payment_schedule")
        if payment_schedule:
            terms.append(f"{payment_schedule} of the total amount must be paid in advance before commencement of work/service.")

        # Default terms
        default_terms = [
            "The above quotation is subject to this project only.",
            "The prices mentioned above are in particular to One Project per year.",
            "The services outlined above are included within the project scope. Any additional services not specified are excluded from this scope.",
            "The prices mentioned above are applicable to One Project only for the duration of the services obtained.",
            "The prices mentioned above DO NOT include Government Fees.",
            "The prices mentioned above DO NOT include Edit Fees.",
            "The prices listed above do not include any applicable statutory taxes.",
            "Any and all services not mentioned in the above scope of services are not applicable.",
            "All Out-of-pocket expenses incurred for completion of the work shall be re-imbursed to RERA Easy."
        ]

        terms.extend(default_terms)

        # Add applicable terms from quotation data
        if quotation_data.get("applicableTerms"):
            terms_data = {
                "Package A,B,C": [
                    "Payment is due at the initiation of services, followed by annual payments thereafter.",
                    "Any kind of drafting of legal documents or contracts are not applicable.",
                    "The quoted fee covers annual MahaRERA compliance services, with billing on a Yearly basis for convenience and predictable financial planning.",
                    "Invoices will be generated at a predetermined interval for each year in advance.",
                    "The initial invoice will be issued from the date of issuance or a start date as specified in the Work Order."
                ],
                "Package D": [
                    "All Out-of-pocket expenses incurred for the explicit purpose of Commuting, Refreshment meals of RERA Easy's personnel shall be re-imbursed to RERA Easy, subject to submission of relevant invoices, bills and records submitted."
                ]
            }

            for category in quotation_data["applicableTerms"]:
                if category in terms_data:
                    terms.extend(terms_data[category])

        # Add custom terms
        if quotation_data.get("customTerms"):
            custom_terms = [self.safe_string(t) for t in quotation_data["customTerms"] if self.safe_string(t)]
            terms.extend(custom_terms)

        # Get reference number
        ref_number = self.safe_string(quotation_data.get("id", "REQ 0001"))
        if not ref_number.upper().startswith("REQ"):
            ref_number = f"REQ {ref_number}"

        # Clean reference number
        ref_number = ref_number.replace("REQ ", "").strip()
        if ref_number:
            ref_number = f"REQ {ref_number}"
        else:
            ref_number = "REQ 0001"

        print(f"📄 Reference number: {ref_number}")

        # Resolve logo
        logo_src = self._find_and_resolve_logo(base_dir)

        # Get page title (for the summary page)
        page_title = self.safe_string(
            quotation_data.get("pageTitle") or 
            quotation_data.get("header") or 
            "PROJECT QUOTATION"
        ).upper()

        # Render HTML using the multi-page template
        template = self.env.get_template(self.template_name)

        try:
            html_out = template.render(
                quotation_data=quotation_data,
                page_title=page_title,
                headers=processed_headers,
                total_amount=total_amount,
                terms=terms,
                ref_number=ref_number,
                logo_src=logo_src or "",
                display_mode=display_mode
            )

            print(f"✅ HTML rendered successfully ({len(html_out)} chars)")
            print(f"📄 Pages will include: {len(processed_headers)} header page(s) + 1 summary page + 1 disclaimer page")

        except Exception as e:
            print(f"❌ ERROR rendering HTML: {e}")
            raise

        # Generate PDF
        temp_pdf = filename.replace(".pdf", "_temp.pdf")

        try:
            pdfkit.from_string(html_out, temp_pdf, configuration=self.config, options=self.wk_options)
            print(f"✅ PDF generated: {temp_pdf}")

        except Exception as e:
            print(f"❌ ERROR generating PDF: {e}")
            # Save debug HTML
            debug_html = filename.replace(".pdf", "_debug.html")
            with open(debug_html, "w", encoding="utf-8") as f:
                f.write(html_out)
            print(f"🐛 Debug HTML saved: {debug_html}")
            raise

        # Handle image merging if needed
        self.combine_with_images(temp_pdf, filename)

        # Cleanup
        try:
            if os.path.exists(temp_pdf):
                os.remove(temp_pdf)
        except Exception:
            pass

        print(f"✅ Final multi-page PDF ready: {filename}")
        return filename

    def _find_and_resolve_logo(self, base_dir):
        """Find and resolve logo file path"""
        logo_extensions = [".png", ".jpg", ".jpeg", ".svg"]
        logo_names = ["logo", "Logo", "LOGO"]

        print(f"🔍 Looking for logo in: {base_dir}")

        for name in logo_names:
            for ext in logo_extensions:
                logo_path = os.path.join(base_dir, f"{name}{ext}")
                if os.path.exists(logo_path):
                    logo_uri = self._file_uri(logo_path)
                    print(f"✅ Found logo: {logo_path} -> {logo_uri}")
                    return logo_uri

        print(f"❌ No logo found in {base_dir}")
        return None

    def _file_uri(self, path):
        """Convert file path to URI"""
        if os.path.exists(path):
            abs_path = os.path.abspath(path)
            if os.name == 'nt':  # Windows
                abs_path = abs_path.replace("\\\\", "/")
                return f"file:///{abs_path}"
            else:
                return f"file://{abs_path}"
        return None

    def combine_with_images(self, generated_pdf, final_pdf):
        """Merge with any additional images if needed"""
        base_dir = os.path.dirname(os.path.abspath(__file__))
        images_dir = os.path.join(base_dir, "images")

        writer = PdfWriter()
        temps = []

        try:
            # Add prepend images if they exist
            if os.path.isdir(images_dir):
                first_image = self._find_image(images_dir, "1")
                if first_image:
                    temp_pdf = os.path.join(base_dir, "temp_first.pdf")
                    self._image_to_pdf(first_image, temp_pdf)
                    temps.append(temp_pdf)
                    self._add_pdf(writer, temp_pdf)

            # Add main content
            self._add_pdf(writer, generated_pdf)

            # Add append images
            if os.path.isdir(images_dir):
                for i in range(2, 9):
                    img = self._find_image(images_dir, str(i))
                    if img:
                        temp_pdf = os.path.join(base_dir, f"temp_{i}.pdf")
                        self._image_to_pdf(img, temp_pdf)
                        temps.append(temp_pdf)
                        self._add_pdf(writer, temp_pdf)

            with open(final_pdf, "wb") as f:
                writer.write(f)

        finally:
            for temp in temps:
                try:
                    if os.path.exists(temp):
                        os.remove(temp)
                except Exception:
                    pass

    def _find_image(self, images_dir, base):
        """Find image file with various extensions"""
        for ext in (".jpg", ".png", ".jpeg"):
            path = os.path.join(images_dir, base + ext)
            if os.path.exists(path):
                return path
        return None

    def _image_to_pdf(self, image_path, pdf_path):
        """Convert image to PDF"""
        c = canvas.Canvas(pdf_path, pagesize=A4)
        width, height = A4
        try:
            c.drawImage(image_path, 0, 0, width, height, preserveAspectRatio=True, anchor="c")
        except Exception as e:
            print(f"Warning: Could not draw image {image_path}: {e}")
        c.showPage()
        c.save()

    def _add_pdf(self, writer, path):
        """Add PDF to writer"""
        try:
            reader = PdfReader(path)
            for page in reader.pages:
                writer.add_page(page)
        except Exception as e:
            print(f"Warning: Could not read PDF {path}: {e}")

