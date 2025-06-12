# Copyright (c) 2024, Allen and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _

class Lease(Document):
    def validate(self):
        self.validate_dates()

    def on_submit(self):
        self.create_first_rent_invoice()

    def validate_dates(self):
        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                frappe.throw(_("Lease End Date must be after the Start Date"))

    def create_first_rent_invoice(self):
        frappe.msgprint(_("Creating first month's rent invoice..."))
        try:
            if frappe.db.exists("Sales Invoice", {"custom_lease": self.name}):
                 frappe.msgprint(_("Invoice for this lease already exists."))
                 return

            invoice = frappe.get_doc({
                "doctype": "Sales Invoice",
                "customer": self.tenant,
                "posting_date": self.start_date,
                "due_date": self.start_date,
                "custom_lease": self.name
            })

            invoice.append("items", {
                "item_code": "Monthly Rent",
                "item_name": f"Monthly Rent for Property: {self.property}",
                "description": f"Rent for the period starting {self.start_date}",
                "qty": 1,
                "rate": self.rent_amount,
                "cost_center": "Main - RM"
            })

            invoice.insert(ignore_permissions=True)
            invoice.submit()

            frappe.msgprint(
                _("Successfully created Sales Invoice: {0}").format(invoice.get_link()),
                title=_("Invoice Created"),
                indicator="green"
            )
        except Exception as e:
            frappe.log_error(frappe.get_traceback(), _("Lease Invoice Creation Failed"))
            frappe.throw(_("Failed to create the Sales Invoice. Error: {0}").format(e))